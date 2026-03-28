import "server-only";

import { z } from "zod";

import {
  COOKING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  EMPTY_PROFILE_INPUT,
  PROFILE_GOAL_OPTIONS,
  type CookingLevel,
  type UserProfileInput,
} from "@/features/profile";
import { logHistoryEvent } from "@/server/history/log-history-event";
import { prisma } from "@/server/db/prisma";
import {
  getUserProfileByUserId,
  upsertUserProfileByUserId,
} from "@/server/profile/repository";

const cookingLevelValues = COOKING_LEVEL_OPTIONS.map((item) => item.value) as [
  CookingLevel,
  ...CookingLevel[],
];

const formSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  cookingLevel: z.enum(cookingLevelValues).default("BEGINNER"),
  goals: z.array(z.string()).default([]),
  dislikedIngredients: z.string().default(""),
});

export type SaveProfileResult = {
  ok: boolean;
  message: string;
};

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function parseCsv(csv: string): string[] {
  return csv
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniqueAllowed(values: string[], allowed: readonly string[]): string[] {
  const allowedSet = new Set(allowed);
  return [...new Set(values)].filter((value) => allowedSet.has(value));
}

export async function getProfileOrDefault(userId: string): Promise<UserProfileInput> {
  if (!hasDatabaseUrl()) return EMPTY_PROFILE_INPUT;
  try {
    const existing = await getUserProfileByUserId(userId);
    return existing ?? EMPTY_PROFILE_INPUT;
  } catch {
    return EMPTY_PROFILE_INPUT;
  }
}

export async function saveProfileFromFormData(
  userId: string,
  formData: FormData,
): Promise<SaveProfileResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      message:
        "Falta configurar DATABASE_URL para guardar el perfil en base de datos.",
    };
  }
  try {
    const parsed = formSchema.safeParse({
      dietaryRestrictions: formData.getAll("dietaryRestrictions"),
      cookingLevel: formData.get("cookingLevel"),
      goals: formData.getAll("goals"),
      dislikedIngredients: formData.get("dislikedIngredients"),
    });

    if (!parsed.success) {
      return { ok: false, message: "Revisa los datos del perfil e intenta de nuevo." };
    }

    const payload: UserProfileInput = {
      dietaryRestrictions: uniqueAllowed(
        parsed.data.dietaryRestrictions,
        DIETARY_RESTRICTION_OPTIONS,
      ),
      cookingLevel: parsed.data.cookingLevel,
      goals: uniqueAllowed(parsed.data.goals, PROFILE_GOAL_OPTIONS),
      dislikedIngredients: parseCsv(parsed.data.dislikedIngredients),
    };

    await upsertUserProfileByUserId(userId, payload);

    const profileRow = await prisma.userProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (profileRow) {
      await logHistoryEvent({
        userId,
        entityType: "PROFILE",
        entityId: profileRow.id,
        actionType: "UPDATED",
        summary: "Perfil actualizado (preferencias y restricciones).",
        metadata: {
          cookingLevel: payload.cookingLevel,
          dietaryCount: payload.dietaryRestrictions.length,
          goalsCount: payload.goals.length,
          dislikedCount: payload.dislikedIngredients.length,
        },
      });
    }

    return { ok: true, message: "Perfil guardado correctamente." };
  } catch {
    return {
      ok: false,
      message: "No se pudo guardar el perfil. Intenta nuevamente en unos minutos.",
    };
  }
}
