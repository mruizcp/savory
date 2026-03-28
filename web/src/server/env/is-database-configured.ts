import "server-only";

/**
 * Única fuente de verdad: ¿hay cadena de conexión para Prisma (Azure SQL)?
 * Sin esto no hay persistencia de historial, recetas, favoritos, etc.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
