import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketingClient from "./marketing-client";

export default async function MarketingPage() {
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
            <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center p-4 font-mono">
                <div className="max-w-xl w-full border border-red-500/30 bg-red-500/5 p-6 rounded-xl space-y-4 shadow-2xl shadow-red-500/10 animate-in fade-in duration-500">
                    <h1 className="text-xl font-bold border-b border-red-500/20 pb-2">🚀 Production Startup Error</h1>
                    <p className="text-sm">An error occurred while initializing the app environment:</p>
                    <pre className="bg-black/50 p-4 rounded border border-red-500/10 text-xs overflow-auto whitespace-pre-wrap max-h-[200px]">
                        {error.message || "Unknown Error"}
                    </pre>
                    <div className="text-[10px] text-gray-500 space-y-1">
                        <p className="font-bold text-gray-400 mb-1">Infrastructure Check:</p>
                        <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ INSTALLED" : "❌ MISSING"}</p>
                        <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ INSTALLED" : "❌ MISSING"}</p>
                        <p>APP_URL: {process.env.NEXT_PUBLIC_APP_URL ? "✅ INSTALLED" : "❌ MISSING"}</p>
                    </div>
                    <a
                        href="/"
                        className="block text-center w-full py-2.5 bg-red-500 text-black font-bold rounded-lg hover:bg-red-600 transition-all font-sans text-sm active:scale-95"
                    >
                        Try Again
                    </a>
                </div>
            </div>
        );
    }
}
