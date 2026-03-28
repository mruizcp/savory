import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { detectIngredientsFromImage } from "@/lib/ai";
import { saveIngredientImageBuffer } from "@/lib/azure/blob-storage";
import { persistIngredientSession } from "@/server/ingredients/persist-ingredient-session";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Debes seleccionar una imagen para continuar." },
        { status: 400 },
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo seleccionado no es una imagen valida." },
        { status: 400 },
      );
    }

    if (image.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el limite permitido de 8MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const fileName = image.name?.trim() || "image.jpg";
    const mimeType = image.type?.trim() || "image/jpeg";
    const imageBase64 = buffer.toString("base64");

    const blob = await saveIngredientImageBuffer(buffer, fileName, {
      contentType: mimeType,
    });
    const detection = await detectIngredientsFromImage({
      imageBase64,
      mimeType,
      fileName,
    });

    const session = await auth();
    const userId = session?.user?.id;
    let sessionId: string | null = null;
    let persisted = false;

    if (userId && process.env.DATABASE_URL?.trim()) {
      try {
        await ensureUserForAuth({
          userId: userId,
          email: session.user?.email,
          displayName: session.user?.name,
        });
        const saved = await persistIngredientSession({
          userId,
          sourceType: "PHOTO",
          imageUrl: blob.url,
          storageProvider: blob.provider,
          detectionProvider: detection.provider,
          ingredientNames: detection.ingredients,
        });
        if (saved) {
          sessionId = saved.sessionId;
          persisted = true;
        }
      } catch {
        // No bloquear el análisis si el historial falla.
      }
    }

    return NextResponse.json({
      imageUrl: blob.url,
      storageProvider: blob.provider,
      detectionProvider: detection.provider,
      detectedIngredients: detection.ingredients,
      detectionNote: detection.fallbackNote ?? null,
      persisted,
      sessionId,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la imagen. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
