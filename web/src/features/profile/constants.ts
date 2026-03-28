export const DIETARY_RESTRICTION_OPTIONS = [
  "Vegetariana",
  "Vegana",
  "Sin gluten",
  "Sin lactosa",
  "Baja en sodio",
  "Sin frutos secos",
] as const;

export const PROFILE_GOAL_OPTIONS = ["Salud", "Rapidez", "Ahorro"] as const;

export const COOKING_LEVEL_OPTIONS = [
  { value: "BEGINNER", label: "Principiante" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" },
] as const;
