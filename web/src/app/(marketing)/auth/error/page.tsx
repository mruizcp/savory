import Link from "next/link";

import { Container } from "@/components/ui/container";
import { getAuthErrorMessage } from "@/lib/auth/errors";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const sp = await searchParams;
  const message = getAuthErrorMessage(sp.error);

  return (
    <Container className="flex min-h-[min(70vh,36rem)] flex-col justify-center py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border/80 bg-card/80 p-6 text-center shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:bg-card/60 dark:ring-white/[0.06] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Error de autenticación
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-muted px-4 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              Volver al inicio de sesión
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
