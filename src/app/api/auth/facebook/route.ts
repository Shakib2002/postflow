import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/facebook — redirect to Facebook OAuth
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            scopes: "email,pages_show_list,pages_read_engagement,pages_manage_posts,publish_to_groups",
        },
    });

    if (error || !data.url) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=facebook_auth_failed`);
    }

    return NextResponse.redirect(data.url);
}
