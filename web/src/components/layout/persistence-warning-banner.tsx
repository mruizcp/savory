/**
 * Aviso cuando falta DATABASE_URL: la sesión existe pero el servidor no persiste datos.
 */
export function PersistenceWarningBanner() {
  return (
    <div
      className="border-b border-amber-500/50 bg-amber-50 px-4 py-2.5 text-center text-sm leading-snug text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/35 dark:text-amber-50"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium">Persistencia no disponible en el servidor</p>
      <p className="mt-1 text-xs opacity-90 sm:text-sm">
        Falta <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[0.8rem] dark:bg-amber-900/50">DATABASE_URL</code>
        . No se guardan historial, recetas, favoritos ni perfil en base de datos.
        Revisa la configuración (véase{" "}
        <code className="rounded bg-amber-100/80 px-1 font-mono text-[0.8rem] dark:bg-amber-900/50">docs/architecture.md</code>
        ).
      </p>
    </div>
  );
}
