import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-2">
          <Link
            href="/"
            className="truncate text-base font-semibold tracking-tight text-foreground"
          >
            {siteConfig.name}
          </Link>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link
              href="/registro"
              className="font-medium text-muted-foreground hover:text-foreground"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="font-semibold text-foreground hover:text-primary"
            >
              Iniciar sesión
            </Link>
          </div>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Vista pública · {siteConfig.name}
      </footer>
    </div>
  );
}
