"use server";

import { auth } from "@/auth";
import { saveProfileFromFormData, type SaveProfileResult } from "@/server/profile/service";

export async function saveProfileAction(
  _prevState: SaveProfileResult,
  formData: FormData,
): Promise<SaveProfileResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Sesion invalida. Vuelve a iniciar sesion." };
  }
  return saveProfileFromFormData(userId, formData);
}
