import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

type AuthCardVariant = "sign-in" | "sign-up";

const copy: Record<
  AuthCardVariant,
  { title: string; description: string; footerLead: string; footerLink: string; footerHref: string }
> = {
  "sign-in": {
    title: "Iniciar sesión",
    description:
      "Accede con tu correo y contraseña para guardar recetas, favoritos y tu actividad.",
    footerLead: "¿No tienes cuenta?",
    footerLink: "Crear cuenta",
    footerHref: "/registro",
  },
  "sign-up": {
    title: "Crear cuenta",
    description:
      "Regístrate en unos segundos. Solo necesitas un correo y una contraseña segura.",
    footerLead: "¿Ya tienes cuenta?",
    footerLink: "Iniciar sesión",
    footerHref: "/login",
  },
};

type AuthCardProps = {
  variant: AuthCardVariant;
  databaseConfigured: boolean;
  callbackUrl: string;
  registeredBanner?: boolean;
  errorMessage: string | null;
};

export function AuthCard({
  variant,
  databaseConfigured,
  callbackUrl,
  registeredBanner,
  errorMessage,
}: AuthCardProps) {
  const c = copy[variant];

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:bg-card/60 dark:ring-white/[0.06] sm:p-8">
        <div className="flex flex-col gap-6">
          <header className="text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {c.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {c.description}
            </p>
          </header>

          {registeredBanner ? (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
              role="status"
            >
              Tu cuenta está lista. Inicia sesión con tu correo y contraseña.
            </p>
          ) : null}

          {errorMessage ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          {databaseConfigured ? (
            variant === "sign-in" ? (
              <LoginForm callbackUrl={callbackUrl} />
            ) : (
              <RegisterForm />
            )
          ) : (
            <div
              className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100"
              role="status"
            >
              <p className="font-medium text-foreground">
                Acceso no disponible
              </p>
              <p className="mt-2 text-muted-foreground">
                No podemos crear tu cuenta ni iniciar sesión en este momento.
                Vuelve a intentarlo más tarde o contacta con soporte si necesitas
                ayuda.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {c.footerLead}{" "}
            <Link
              href={c.footerHref}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {c.footerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
