import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export type BlobSaveResult = {
  /** URL absoluta (Azure) o relativa `/uploads/...` en fallback local. */
  url: string;
  provider: "azure-blob" | "local-fallback";
  key: string;
};

type BlobRuntimeConfig = {
  containerName: string;
  accountName: string;
  credential: StorageSharedKeyCredential;
  /** URL base del servicio (p. ej. https://cuenta.blob.core.windows.net) */
  serviceUrl: string;
};

function sanitizeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

function createBlobKey(fileName: string): string {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const rand = randomBytes(8).toString("hex");
  return `ingredients/${datePart}-${rand}-${sanitizeFileName(fileName)}`;
}

function parseAccountKeyFromConnectionString(
  connectionString: string,
): { accountName: string; accountKey: string } {
  const parts: Record<string, string> = {};
  for (const segment of connectionString.split(";")) {
    const eq = segment.indexOf("=");
    if (eq === -1) continue;
    const k = segment.slice(0, eq).trim().toLowerCase();
    const v = segment.slice(eq + 1).trim();
    if (k) parts[k] = v;
  }
  const accountName = parts["accountname"];
  const accountKey = parts["accountkey"];
  if (!accountName || !accountKey) {
    throw new Error(
      "La cadena de conexión debe incluir AccountName y AccountKey para firmar SAS.",
    );
  }
  return { accountName, accountKey };
}

function resolveBlobConfig(): BlobRuntimeConfig | null {
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME?.trim();
  if (!containerName) return null;

  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
  if (conn) {
    const { accountName, accountKey } = parseAccountKeyFromConnectionString(conn);
    return {
      containerName,
      accountName,
      credential: new StorageSharedKeyCredential(accountName, accountKey),
      serviceUrl: `https://${accountName}.blob.core.windows.net`,
    };
  }

  const account =
    process.env.AZURE_BLOB_STORAGE_ACCOUNT?.trim() ??
    process.env.AZURE_STORAGE_ACCOUNT_NAME?.trim();
  const accountKey =
    process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY?.trim() ??
    process.env.AZURE_STORAGE_ACCOUNT_KEY?.trim();

  if (!account || !accountKey) return null;

  return {
    containerName,
    accountName: account,
    credential: new StorageSharedKeyCredential(account, accountKey),
    serviceUrl: `https://${account}.blob.core.windows.net`,
  };
}

/**
 * True si hay credenciales suficientes para subir blobs a Azure (no implica contenedor creado).
 */
export function isAzureBlobConfigured(): boolean {
  return resolveBlobConfig() !== null;
}

function inferContentType(fileName: string, override?: string): string {
  if (override?.trim()) return override.trim();
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function shouldUsePublicUrlOnly(): boolean {
  const v = process.env.AZURE_BLOB_PUBLIC_READ?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function sasExpiry(): Date {
  const years = Number(process.env.AZURE_BLOB_SAS_READ_YEARS?.trim()) || 10;
  const d = new Date();
  d.setFullYear(d.getFullYear() + Math.min(100, Math.max(1, years)));
  return d;
}

async function saveToLocalDisk(
  buffer: Buffer,
  originalFileName: string,
): Promise<BlobSaveResult> {
  const key = createBlobKey(originalFileName || "image.jpg");
  const outputPath = path.join(process.cwd(), "public", "uploads", key);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  return {
    url: `/uploads/${key}`,
    provider: "local-fallback",
    key,
  };
}

export type SaveIngredientImageOptions = {
  contentType?: string;
};

/**
 * Sube la imagen a Azure Blob Storage cuando hay configuración válida; si no, escribe en `public/uploads` (desarrollo).
 */
export async function saveIngredientImageBuffer(
  buffer: Buffer,
  originalFileName: string,
  options?: SaveIngredientImageOptions,
): Promise<BlobSaveResult> {
  const cfg = resolveBlobConfig();
  const contentType = inferContentType(originalFileName, options?.contentType);

  if (!cfg) {
    return saveToLocalDisk(buffer, originalFileName);
  }

  const key = createBlobKey(originalFileName || "image.jpg");

  try {
    const serviceClient = new BlobServiceClient(
      cfg.serviceUrl,
      cfg.credential,
    );
    const containerClient = serviceClient.getContainerClient(
      cfg.containerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    let url: string;
    if (shouldUsePublicUrlOnly()) {
      url = blockBlobClient.url;
    } else {
      const sas = generateBlobSASQueryParameters(
        {
          containerName: cfg.containerName,
          blobName: key,
          permissions: BlobSASPermissions.parse("r"),
          startsOn: new Date(Date.now() - 60_000),
          expiresOn: sasExpiry(),
          protocol: SASProtocol.Https,
        },
        cfg.credential,
      ).toString();
      url = `${blockBlobClient.url}?${sas}`;
    }

    return {
      url,
      provider: "azure-blob",
      key,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al subir a Azure";
    throw new Error(`No se pudo guardar la imagen en Blob Storage: ${message}`);
  }
}

export async function saveIngredientImageBlob(
  file: File,
  options?: SaveIngredientImageOptions,
): Promise<BlobSaveResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveIngredientImageBuffer(buffer, file.name || "image.jpg", {
    ...options,
    contentType: file.type?.trim() || options?.contentType,
  });
}
