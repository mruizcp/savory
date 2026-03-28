import { CocinarPageClient } from "@/components/cooking/cocinar-page-client";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export default async function CocinarPage() {
  const hasDb = isDatabaseConfigured();
  return <CocinarPageClient canPersist={hasDb} />;
}
