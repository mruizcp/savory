/** Códigos de error que Auth.js puede devolver en la query `error`. Mensajes genéricos para usuario final. */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "El inicio de sesión no está disponible en este momento. Inténtalo más tarde.",
  AccessDenied: "No tienes permiso para acceder.",
  Verification: "El enlace ha caducado o ya se ha usado.",
  OAuthSignin: "No se pudo iniciar sesión. Inténtalo de nuevo.",
  OAuthCallback: "No se pudo completar el acceso. Inténtalo de nuevo.",
  OAuthCreateAccount: "No se pudo crear la cuenta. Inténtalo de nuevo.",
  EmailCreateAccount: "No se pudo crear la cuenta. Inténtalo de nuevo.",
  Callback: "No se pudo completar el acceso. Inténtalo de nuevo.",
  OAuthAccountNotLinked:
    "Esta cuenta ya está vinculada a otro método de acceso.",
  EmailSignin: "No se pudo enviar el correo de acceso.",
  CredentialsSignin:
    "Correo o contraseña incorrectos. Comprueba los datos e inténtalo de nuevo.",
  SessionRequired: "Inicia sesión para continuar.",
  Default: "No se pudo completar el inicio de sesión. Inténtalo de nuevo.",
};

export function getAuthErrorMessage(code: string | undefined): string {
  if (!code) return AUTH_ERROR_MESSAGES.Default;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default;
}
