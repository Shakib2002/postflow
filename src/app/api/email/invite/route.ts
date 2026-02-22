import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/email/invite — send team invite email
export async function POST(req: NextRequest) {
    const { to, inviteUrl, role, inviterEmail } = await req.json();

    if (!to || !inviteUrl) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const roleLabel = role === "admin" ? "Admin"
        : role === "viewer" ? "Viewer"
            : "Member";

    const roleColor = role === "admin" ? "#7c3aed"
        : role === "viewer" ? "#6b7280"
            : "#2563eb";

    const roleDescription = role === "admin"
        ? "Full access to manage posts, team members, and workspace settings."
        : role === "viewer"
            ? "Read-only access to view posts, analytics, and leads."
            : "Can create, schedule, and publish posts.";

    const { error } = await resend.emails.send({
        from: "PostFlow <noreply@postflow.app>",
        to,
        subject: `You've been invited to join a PostFlow workspace`,
        html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f4f4f5; border-radius: 16px; overflow: hidden; border: 1px solid #1e1e2e;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%); padding: 40px 32px; text-align: center;">
            <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px;">⚡ PostFlow</div>
            <p style="margin: 0; opacity: 0.85; font-size: 15px;">You've been invited to join a workspace</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px;">
            
            <p style="color: #a1a1aa; line-height: 1.7; margin-top: 0;">
              ${inviterEmail ? `<strong style="color: #f4f4f5;">${inviterEmail}</strong> has invited you` : "You've been invited"} 
              to collaborate on <strong style="color: #f4f4f5;">PostFlow</strong> — the AI-powered social media platform.
            </p>

            <!-- Role Badge -->
            <div style="background: #111118; border: 1px solid #2a2a3a; border-radius: 12px; padding: 20px 24px; margin: 24px 0; display: flex; align-items: center; gap: 16px;">
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${roleColor}22; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                ${role === "admin" ? "🛡️" : role === "viewer" ? "👁️" : "👤"}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 16px; color: ${roleColor};">${roleLabel}</div>
                <div style="font-size: 13px; color: #71717a; margin-top: 2px;">${roleDescription}</div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: -0.3px; box-shadow: 0 4px 24px #7c3aed44;">
                Accept Invitation →
              </a>
            </div>

            <!-- Features reminder -->
            <div style="border-top: 1px solid #1e1e2e; padding-top: 24px; margin-top: 16px;">
              <p style="color: #52525b; font-size: 13px; margin: 0 0 12px;">With PostFlow you can:</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="color: #a1a1aa; font-size: 13px;">✅ Schedule posts across LinkedIn, Twitter, Facebook & Instagram</div>
                <div style="color: #a1a1aa; font-size: 13px;">✅ Generate AI captions and hashtag templates</div>
                <div style="color: #a1a1aa; font-size: 13px;">✅ Track leads, mentions, and engagement analytics</div>
              </div>
            </div>

            <!-- Note -->
            <p style="color: #3f3f46; font-size: 12px; margin-top: 32px; text-align: center; line-height: 1.6;">
              This invite link expires in <strong style="color: #52525b;">7 days</strong>. If you didn't expect this, you can safely ignore this email.<br/>
              Questions? Reply to this email and we'll help out.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #050508; padding: 20px 32px; text-align: center; border-top: 1px solid #1e1e2e;">
            <p style="color: #3f3f46; font-size: 12px; margin: 0;">
              PostFlow · Social Media Automation Platform · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #7c3aed; text-decoration: none;">postflow.app</a>
            </p>
          </div>

        </div>
        `,
    });

    if (error) {
        console.warn("[Email/Invite] Resend error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
