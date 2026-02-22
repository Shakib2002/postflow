import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// This endpoint must be excluded from auth middleware — Stripe calls it directly
export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Use service role client for webhook (no user session)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(supabase, session);
                break;
            }
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(supabase, sub);
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(supabase, sub);
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(supabase, invoice);
                break;
            }
            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(supabase, invoice);
                break;
            }
            default:
                console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
        }
    } catch (err) {
        console.error("[Stripe Webhook] Handler error:", err);
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
    const workspaceId = session.metadata?.workspace_id;
    const plan = session.metadata?.plan;
    if (!workspaceId || !plan) return;

    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    // Access billing period via items data (Stripe API v2 compatible)
    const item = stripeSubscription.items.data[0];
    const periodStart = item?.current_period_start ?? stripeSubscription.start_date;
    const periodEnd = item?.current_period_end ?? (stripeSubscription.start_date + 30 * 24 * 3600);

    await supabase.from("subscriptions").upsert({
        workspace_id: workspaceId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        status: stripeSubscription.status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    }, { onConflict: "workspace_id" });

    console.log(`[Stripe] Checkout completed: workspace=${workspaceId} plan=${plan}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(supabase: any, sub: Stripe.Subscription) {
    const workspaceId = sub.metadata?.workspace_id;
    if (!workspaceId) return;

    const priceId = sub.items.data[0]?.price.id;
    const plan = getPlanByPriceId(priceId) ?? "starter";

    const item = sub.items.data[0];
    const periodStart = item?.current_period_start ?? sub.start_date;
    const periodEnd = item?.current_period_end ?? (sub.start_date + 30 * 24 * 3600);

    await supabase.from("subscriptions").update({
        plan,
        status: sub.status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
    }).eq("stripe_subscription_id", sub.id);

    console.log(`[Stripe] Subscription updated: workspace=${workspaceId} plan=${plan} status=${sub.status}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(supabase: any, sub: Stripe.Subscription) {
    await supabase.from("subscriptions").update({
        status: "cancelled",
        cancel_at_period_end: false,
    }).eq("stripe_subscription_id", sub.id);

    console.log(`[Stripe] Subscription cancelled: ${sub.id}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
    // In newer Stripe API, subscription is accessed via parent or lines
    const subscriptionId = (invoice as unknown as { subscription?: string }).subscription
        ?? invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;
    if (!subscriptionId) return;

    await supabase.from("subscriptions").update({
        status: "past_due",
    }).eq("stripe_subscription_id", subscriptionId);

    console.log(`[Stripe] Payment failed: subscription=${subscriptionId}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as unknown as { subscription?: string }).subscription
        ?? invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;
    if (!subscriptionId) return;

    await supabase.from("subscriptions").update({
        status: "active",
    }).eq("stripe_subscription_id", subscriptionId);

    console.log(`[Stripe] Payment succeeded: subscription=${subscriptionId}`);
}
