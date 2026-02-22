import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/email/approval — send approval request email
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { approval_id, token } = body;

    const supabase = await createClient();

    const { data: approval } = await supabase
        .from("approvals")
        .select(`*, post:posts(content, scheduled_at, workspace_id)`)
        .eq("id", approval_id)
        .single();

    if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 });

    // Get workspace owner email
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("name, owner_id")
        .eq("id", approval.post.workspace_id)
        .single();

    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const { data: ownerData } = await supabase.auth.admin.getUserById(workspace.owner_id);
    const ownerEmail = ownerData?.user?.email;
    if (!ownerEmail) return NextResponse.json({ error: "Owner email not found" }, { status: 404 });

    const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve/${token}?action=approve`;
    const rejectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve/${token}?action=reject`;
    const previewContent = approval.post.content.substring(0, 200);

    const { error } = await resend.emails.send({
        from: "PostFlow <noreply@postflow.app>",
        to: ownerEmail,
        subject: `✅ Post Approval Required — ${workspace.name}`,
        html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚡ PostFlow</h1>
          <p style="margin: 8px 0 0; opacity: 0.8;">Post Approval Required</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #a1a1aa;">A post is waiting for your approval in <strong style="color: #fff;">${workspace.name}</strong>:</p>
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #e4e4e7; line-height: 1.6;">${previewContent}${approval.post.content.length > 200 ? "..." : ""}</p>
          </div>
          ${approval.post.scheduled_at ? `<p style="color: #a1a1aa;">Scheduled for: <strong style="color: #fff;">${new Date(approval.post.scheduled_at).toLocaleString()}</strong></p>` : ""}
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <a href="${approveUrl}" style="flex: 1; background: #16a34a; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; display: block;">✅ Approve</a>
            <a href="${rejectUrl}" style="flex: 1; background: #dc2626; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; display: block;">❌ Reject</a>
          </div>
          <p style="color: #52525b; font-size: 12px; margin-top: 24px; text-align: center;">This link expires in 48 hours.</p>
        </div>
      </div>
    `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
