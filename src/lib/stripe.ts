import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set — billing features disabled");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

// Plan definitions — keep in sync with Stripe dashboard
export const PLANS = {
    starter: {
        name: "Starter",
        price: 29,
        priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
        limits: {
            socialAccounts: 3,
            postsPerMonth: 30,
            teamMembers: 1,
            workspaces: 1,
        },
        features: [
            "3 social accounts",
            "30 posts per month",
            "Basic AI captions",
            "Email approval workflow",
            "Basic analytics",
        ],
    },
    pro: {
        name: "Pro",
        price: 79,
        priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
        limits: {
            socialAccounts: 10,
            postsPerMonth: -1, // unlimited
            teamMembers: 3,
            workspaces: 1,
        },
        features: [
            "10 social accounts",
            "Unlimited posts",
            "Full AI Content Studio",
            "Lead generation funnel",
            "Comment intelligence",
            "Advanced analytics",
            "Team collaboration (3 seats)",
        ],
    },
    agency: {
        name: "Agency",
        price: 199,
        priceId: process.env.STRIPE_AGENCY_PRICE_ID ?? "",
        limits: {
            socialAccounts: -1, // unlimited
            postsPerMonth: -1,
            teamMembers: -1,
            workspaces: 5,
        },
        features: [
            "Unlimited social accounts",
            "Unlimited posts",
            "White-label dashboard",
            "Client portal",
            "5 workspaces",
            "Priority support",
            "API access",
            "Custom integrations",
        ],
    },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
    for (const [key, plan] of Object.entries(PLANS)) {
        if (plan.priceId === priceId) return key as PlanKey;
    }
    return null;
}
