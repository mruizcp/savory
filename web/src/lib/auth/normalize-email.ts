/** Normaliza correo para comparación y almacenamiento. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
