import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/leads
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspace_id");
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");

    let query = supabase
        .from("leads")
        .select(`*, source_post:posts(title, content)`)
        .order("created_at", { ascending: false });

    if (workspaceId) query = query.eq("workspace_id", workspaceId);
    if (status) query = query.eq("status", status);
    if (platform) query = query.eq("platform", platform);
    if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ leads: data });
}

// POST /api/leads — public endpoint for lead capture form
export async function POST(req: NextRequest) {
    // Rate limit: 60 req / 60 s per IP (public endpoint — no auth check)
    const limited = await checkRateLimit(req, "leads");
    if (limited) return limited;

    const supabase = await createClient();
    const body = await req.json();

    const { workspace_id, email, name, phone, company, source_post_id, platform, utm_source, utm_medium, utm_campaign } = body;

    if (!workspace_id || !email) {
        return NextResponse.json({ error: "workspace_id and email are required" }, { status: 400 });
    }

    // Upsert lead (duplicate detection by workspace + email)
    const { data: lead, error } = await supabase
        .from("leads")
        .upsert(
            {
                workspace_id,
                email: email.toLowerCase().trim(),
                name,
                phone,
                company,
                source_post_id: source_post_id ?? null,
                platform: platform ?? null,
                utm_source: utm_source ?? null,
                utm_medium: utm_medium ?? null,
                utm_campaign: utm_campaign ?? null,
                score: calculateLeadScore({ platform, source_post_id }),
            },
            { onConflict: "workspace_id,email", ignoreDuplicates: false }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Trigger file delivery email if source_post has a lead_file
    if (source_post_id && lead) {
        const { data: leadFile } = await supabase
            .from("lead_files")
            .select("*")
            .eq("post_id", source_post_id)
            .single();

        if (leadFile) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/lead-file`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lead_id: lead.id, lead_file_id: leadFile.id }),
            });
        }
    }

    return NextResponse.json({ lead, success: true }, { status: 201 });
}

function calculateLeadScore({ platform, source_post_id }: { platform?: string; source_post_id?: string }): number {
    let score = 50; // base score
    if (platform === "linkedin") score += 20;
    if (platform === "facebook") score += 10;
    if (platform === "twitter") score += 5;
    if (source_post_id) score += 10;
    return Math.min(score, 100);
}
