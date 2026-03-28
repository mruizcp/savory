import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { generateRecommendationsForUser } from "@/server/recommendations/generate-recommendations";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para ver recomendaciones." },
      { status: 401 },
    );
  }

  const result = await generateRecommendationsForUser(userId);
  return NextResponse.json(result);
}
