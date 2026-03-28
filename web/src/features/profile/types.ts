export type CookingLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type UserProfileInput = {
  dietaryRestrictions: string[];
  cookingLevel: CookingLevel;
  goals: string[];
  dislikedIngredients: string[];
};

export type UserProfileDTO = UserProfileInput & {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const EMPTY_PROFILE_INPUT: UserProfileInput = {
  dietaryRestrictions: [],
  cookingLevel: "BEGINNER",
  goals: [],
  dislikedIngredients: [],
};
