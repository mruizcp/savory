import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CookbookDetailClient } from "@/components/collections/cookbook-detail-client";
import { Container } from "@/components/ui/container";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CookbookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/recetarios/${id}`)}`);
  }

  return (
    <Container className="py-6 sm:py-10">
      <CookbookDetailClient cookbookId={id} />
    </Container>
  );
}
