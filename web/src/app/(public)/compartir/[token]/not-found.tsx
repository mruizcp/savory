import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function SharedRecipeNotFound() {
  return (
    <Container className="py-12 text-center">
      <h1 className="text-lg font-semibold">Enlace no válido o desactivado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El propietario pudo revocar el enlace o el token es incorrecto.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        Ir al inicio
      </Link>
    </Container>
  );
}
