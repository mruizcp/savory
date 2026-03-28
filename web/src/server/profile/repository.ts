import "server-only";

import { randomUUID } from "node:crypto";

import type { UserProfileInput } from "@/features/profile";
import { prisma } from "@/server/db/prisma";

function fromModel(model: {
  cookingLevel: string;
  dietaryRestrictions: Array<{ value: string }>;
  goals: Array<{ value: string }>;
  dislikedIngredients: Array<{ value: string }>;
}): UserProfileInput {
  return {
    dietaryRestrictions: model.dietaryRestrictions.map((item) => item.value),
    cookingLevel: model.cookingLevel as UserProfileInput["cookingLevel"],
    goals: model.goals.map((item) => item.value),
    dislikedIngredients: model.dislikedIngredients.map((item) => item.value),
  };
}

export async function getUserProfileByUserId(
  userId: string,
): Promise<UserProfileInput | null> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      dietaryRestrictions: true,
      goals: true,
      dislikedIngredients: true,
    },
  });
  if (!profile) return null;
  return fromModel(profile);
}

export async function upsertUserProfileByUserId(
  userId: string,
  input: UserProfileInput,
): Promise<UserProfileInput> {
  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const profileId = existing?.id ?? randomUUID();

  await prisma.$transaction(async (tx) => {
    await tx.userProfile.upsert({
      where: { userId },
      create: {
        id: profileId,
        userId,
        cookingLevel: input.cookingLevel,
      },
      update: {
        cookingLevel: input.cookingLevel,
      },
    });

    await tx.userProfileDietaryRestriction.deleteMany({ where: { profileId } });
    await tx.userProfileGoal.deleteMany({ where: { profileId } });
    await tx.userProfileDislikedIngredient.deleteMany({ where: { profileId } });

    if (input.dietaryRestrictions.length > 0) {
      await tx.userProfileDietaryRestriction.createMany({
        data: input.dietaryRestrictions.map((value) => ({ profileId, value })),
      });
    }
    if (input.goals.length > 0) {
      await tx.userProfileGoal.createMany({
        data: input.goals.map((value) => ({ profileId, value })),
      });
    }
    if (input.dislikedIngredients.length > 0) {
      await tx.userProfileDislikedIngredient.createMany({
        data: input.dislikedIngredients.map((value) => ({ profileId, value })),
      });
    }
  });

  const saved = await prisma.userProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      dietaryRestrictions: true,
      goals: true,
      dislikedIngredients: true,
    },
  });
  return fromModel(saved);
}
