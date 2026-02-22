import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketingClient from "./(marketing)/marketing-client";

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Authenticated users go straight to the dashboard
    if (user) {
      redirect("/dashboard");
    }

    // Unauthenticated visitors see the marketing landing page
    return <MarketingClient />;
  } catch (error: any) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold text-red-500">Startup Error</h1>
        <p className="mt-2 text-white/50">{error.message}</p>
        <p className="mt-4 text-xs">Verify your Vercel Environment Variables matches .env.local</p>
      </div>
    );
  }
}
