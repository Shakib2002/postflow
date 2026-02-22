import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

// Lazy-init Resend to avoid build-time crashes if key is missing
const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key && process.env.NODE_ENV === "production") {
    console.warn("RESEND_API_KEY is missing in production.");
  }
  return new Resend(key || "re_dummy_key");
};

// POST /api/email/lead-file — deliver file to a new lead
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { lead_id, lead_file_id } = body;

  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", lead_id)
    .single();

  const { data: leadFile } = await supabase
    .from("lead_files")
    .select("*")
    .eq("id", lead_file_id)
    .single();

  if (!lead || !leadFile) {
    return NextResponse.json({ error: "Lead or file not found" }, { status: 404 });
  }

  // Don't send duplicate if already sent
  if (lead.file_sent_at) {
    return NextResponse.json({ skipped: true, reason: "File already sent" });
  }

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: "PostFlow <noreply@postflow.app>",
    to: lead.email,
    subject: `📎 Here's your file, ${lead.name ?? "there"}!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚡ PostFlow</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 8px;">Hi ${lead.name ?? "there"} 👋</h2>
          <p style="color: #a1a1aa;">Thanks for your interest! Here's the file you requested:</p>
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 4px; font-size: 18px;">📄</p>
            <p style="margin: 0; font-weight: 600;">${leadFile.file_name}</p>
          </div>
          <a href="${leadFile.file_url}" style="display: block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600;">
            ⬇️ Download File
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 24px; text-align: center;">
            You received this because you commented on one of our posts.
          </p>
        </div>
      </div>
    `,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark file as sent
  await supabase
    .from("leads")
    .update({ file_sent_at: new Date().toISOString() })
    .eq("id", lead_id);

  // Increment download count
  await supabase
    .from("lead_files")
    .update({ download_count: leadFile.download_count + 1 })
    .eq("id", lead_file_id);

  return NextResponse.json({ success: true });
}
