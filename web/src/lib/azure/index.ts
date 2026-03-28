/**
 * Azure integrations (Blob Storage).
 * Avoid importing Azure SDKs from React client components.
 */

export {
  isAzureBlobConfigured,
  saveIngredientImageBlob,
  saveIngredientImageBuffer,
} from "@/lib/azure/blob-storage";
