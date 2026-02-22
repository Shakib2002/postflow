import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, PlanKey } from "@/lib/stripe";

// POST /api/billing/checkout — create Stripe checkout session
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json() as { plan: PlanKey };
    if (!plan || !PLANS[plan]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig.priceId) {
        return NextResponse.json({ error: "Plan price not configured" }, { status: 500 });
    }

    // Get workspace
    const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    // Get existing subscription for customer ID
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("workspace_id", member.workspace_id)
        .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: planConfig.priceId, quantity: 1 }],
        success_url: `${appUrl}/billing?success=true&plan=${plan}`,
        cancel_url: `${appUrl}/billing?cancelled=true`,
        ...(subscription?.stripe_customer_id
            ? { customer: subscription.stripe_customer_id }
            : { customer_email: user.email }),
        metadata: {
            workspace_id: member.workspace_id,
            plan,
            user_id: user.id,
        },
        subscription_data: {
            trial_period_days: 14,
            metadata: {
                workspace_id: member.workspace_id,
                plan,
            },
        },
    });

    return NextResponse.json({ url: session.url });
}
