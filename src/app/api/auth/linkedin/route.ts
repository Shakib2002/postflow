import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/linkedin — redirect to LinkedIn OAuth
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            scopes: "openid profile email w_member_social",
        },
    });

    if (error || !data.url) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=linkedin_auth_failed`);
    }

    return NextResponse.redirect(data.url);
}
