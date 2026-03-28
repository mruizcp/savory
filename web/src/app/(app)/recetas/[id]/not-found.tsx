import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function RecipeNotFound() {
  return (
    <Container className="py-10">
      <h1 className="text-xl font-semibold tracking-tight">
        Receta no encontrada
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Puede que el enlace sea incorrecto o que no tengas permiso para ver esta
        receta.
      </p>
      <Link
        href="/cocinar"
        className="mt-6 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        Ir a cocinar
      </Link>
    </Container>
  );
}
