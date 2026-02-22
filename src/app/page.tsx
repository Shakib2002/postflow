import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketingClient from "./(marketing)/marketing-client";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated users go straight to the dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Unauthenticated visitors see the marketing landing page
  return <MarketingClient />;
}
