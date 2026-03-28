import { auth } from "@/auth";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { redirect } from "next/navigation";

export default async function MarketingHomePage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/cocinar");
  }
  return <MarketingLanding />;
}
