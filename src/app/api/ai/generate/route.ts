import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { captureEvent } from "@/lib/posthog";

// POST /api/ai/generate — powered by Google Gemini
export async function POST(req: NextRequest) {
    // Rate limit: 10 req / 60 s per IP
    const limited = await checkRateLimit(req, "ai");
    if (limited) return limited;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, content, platform, tone, topic } = body;

    // ── Demo mode if no key configured ────────────────────────────────────────
    const geminiKey = process.env.GOOGLE_AI_API_KEY ?? "";
    const isDemoMode = !geminiKey || geminiKey.startsWith("your");

    const platformInstructions = (p: string) => {
        if (p === "twitter") return "Keep it under 280 characters. Be punchy and direct.";
        if (p === "linkedin") return "Make it professional and insightful, 150-300 words. Include a hook and a call to action.";
        if (p === "instagram") return "Make it engaging and visual. Include a strong call to action and 3-5 relevant emojis.";
        if (p === "facebook") return "Make it conversational and shareable. Ask a question to drive comments.";
        return "";
    };

    const buildPrompt = (t: string, p: string, subject: string) =>
        `Write a compelling ${p ?? "social media"} post about: "${subject}".
Tone: ${t}.
Platform: ${p ?? "general"}.
${platformInstructions(p)}
Return ONLY the post text, no explanations, no labels.`;

    const prompts: Record<string, string> = {
        generate: buildPrompt(tone ?? "Professional", platform ?? "linkedin", topic ?? content),

        rephrase: `Rephrase the following social media post to make it more engaging and impactful.
Keep the same core message but improve the wording. Tone: ${tone ?? "professional"}.
Original: "${content}"
Return ONLY the rephrased text, no explanations.`,

        hashtags: `Generate 10-15 relevant hashtags for this social media post:
"${content}"
Platform: ${platform ?? "general"}
Return ONLY the hashtags separated by spaces, starting each with #.`,

        emojis: `Add relevant emojis to enhance this social media post. Keep the original text but strategically place emojis:
"${content}"
Return ONLY the enhanced text with emojis, no explanations.`,

        improve: `Improve the following social media post to make it more engaging, clear, and impactful.
Fix any grammar issues, improve the hook, and add a stronger call to action. Tone: ${tone ?? "professional"}.
Original: "${content}"
Return ONLY the improved text, no explanations.`,
    };

    // Helper: call Gemini
    const callGemini = async (prompt: string, temperature = 0.8): Promise<string> => {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { temperature, maxOutputTokens: 800 },
        });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    };

    // ── Variants: 3 parallel completions with different tones ────────────────
    if (action === "variants" || action === "tone_test") {
        const subject = topic || content;
        if (!subject?.trim()) {
            return NextResponse.json({ error: "Provide a topic or content to generate variants" }, { status: 400 });
        }

        const variantTones = action === "tone_test"
            ? ["Professional", "Casual", "Inspirational"]
            : ["Professional", "Casual", "Funny"];

        if (isDemoMode) {
            const demoVariants = variantTones.map((t) => ({
                tone: t,
                content: `[Gemini Demo — ${t}] Here's a ${t.toLowerCase()} take on "${subject}".\n\nAdd your GOOGLE_AI_API_KEY to .env.local to enable real AI generation.\n\n#PostFlow #SocialMedia`,
            }));
            return NextResponse.json({ variants: demoVariants, action, demo: true });
        }

        try {
            const results = await Promise.all(
                variantTones.map(async (t) => {
                    const temperature = t === "Funny" ? 1.0 : t === "Casual" ? 0.85 : 0.7;
                    const text = await callGemini(buildPrompt(t, platform ?? "linkedin", subject), temperature);
                    return { tone: t, content: text };
                })
            );
            captureEvent(user.id, "ai_generated", { action, platform, tone, variant_count: results.length, model: "gemini-2.0-flash" });
            return NextResponse.json({ variants: results, action });
        } catch (err: unknown) {
            console.error("Gemini error:", err);
            const message = err instanceof Error ? err.message : "Unknown error";
            return NextResponse.json({ error: `AI service error: ${message}` }, { status: 503 });
        }
    }

    // ── Single-result actions ─────────────────────────────────────────────────
    const prompt = prompts[action];
    if (!prompt) return NextResponse.json({ error: "Invalid action. Use: generate, rephrase, hashtags, emojis, improve, variants, tone_test" }, { status: 400 });

    if (isDemoMode) {
        const mocks: Record<string, string> = {
            generate: `🚀 [Gemini Demo] Here's a sample ${platform ?? "social"} post about "${topic ?? content}".\n\nThis is a placeholder — add your GOOGLE_AI_API_KEY to .env.local to enable real AI generation.\n\n#AI #SocialMedia #PostFlow`,
            rephrase: `✨ [Gemini Demo] Here's a rephrased version of your post.\n\nAdd your GOOGLE_AI_API_KEY to .env.local to enable real AI rephrasing.`,
            hashtags: `#Marketing #SocialMedia #ContentCreation #DigitalMarketing #Growth #Entrepreneur #Business #LinkedIn #PostFlow`,
            emojis: `${content} 🚀✨💡🔥`,
            improve: `[Gemini Demo] Your post has been improved!\n\nAdd your GOOGLE_AI_API_KEY to .env.local to enable real AI improvements.\n\n${content}`,
        };
        return NextResponse.json({ result: mocks[action], action, demo: true });
    }

    try {
        const temperature = action === "generate" ? 0.8 : action === "rephrase" ? 0.7 : 0.6;
        const result = await callGemini(prompt, temperature);
        if (!result) return NextResponse.json({ error: "AI generation failed" }, { status: 500 });

        captureEvent(user.id, "ai_generated", { action, platform, tone, model: "gemini-2.0-flash" });
        return NextResponse.json({ result, action });
    } catch (err: unknown) {
        console.error("Gemini error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: `AI service error: ${message}` }, { status: 503 });
    }
}
