import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketingClient from "./(marketing)/marketing-client";

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      // Don't crash, just proceed as unauthenticated
    }

    // Authenticated users go straight to the dashboard
    if (user) {
      redirect("/dashboard");
    }

    // Unauthenticated visitors see the marketing landing page
    return <MarketingClient />;
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center p-4 font-mono">
        <div className="max-w-xl w-full border border-red-500/30 bg-red-500/5 p-6 rounded-xl space-y-4">
          <h1 className="text-xl font-bold border-b border-red-500/20 pb-2">🚀 Production Startup Error</h1>
          <p className="text-sm">An error occurred while initializing the app environment:</p>
          <pre className="bg-black/50 p-4 rounded border border-red-500/10 text-xs overflow-auto whitespace-pre-wrap">
            {error.message || "Unknown Error"}
          </pre>
          <div className="text-[10px] text-gray-500 space-y-1">
            <p>Verification Check:</p>
            <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Present" : "❌ MISSING"}</p>
            <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ MISSING"}</p>
            <p>APP_URL: {process.env.NEXT_PUBLIC_APP_URL ? "✅ Present" : "❌ MISSING"}</p>
          </div>
          <a
            href="/"
            className="block text-center w-full py-2 bg-red-500 text-black font-bold rounded hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </a>
        </div>
      </div>
    );
  }
}
