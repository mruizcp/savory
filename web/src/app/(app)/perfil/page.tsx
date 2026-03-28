import { auth } from "@/auth";
import { ProfileForm } from "@/components/forms";
import { Container } from "@/components/ui/container";
import { getProfileOrDefault } from "@/server/profile/service";

import { saveProfileAction } from "./actions";

export default async function PerfilPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Container className="py-6 sm:py-10">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Perfil</h1>
        <p className="mt-3 text-sm text-red-600 sm:text-base">
          No se pudo cargar tu sesion. Vuelve a iniciar sesion.
        </p>
      </Container>
    );
  }

  const profile = await getProfileOrDefault(userId);

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Perfil</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Personaliza tu experiencia para recomendaciones más útiles.
      </p>
      <ProfileForm initialData={profile} action={saveProfileAction} />
    </Container>
  );
}
