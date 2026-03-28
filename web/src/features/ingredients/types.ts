export type PhotoIngredientsAnalysisResponse = {
  imageUrl: string;
  storageProvider: string;
  detectionProvider: string;
  detectedIngredients: string[];
  /** Aviso cuando se usó respaldo sin visión (sin clave, error de API o lista vacía). */
  detectionNote?: string | null;
  /** True si se guardó sesión + historial (usuario con sesión y DATABASE_URL). */
  persisted?: boolean;
  sessionId?: string | null;
};
