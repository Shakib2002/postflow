"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Map raw Supabase error messages to friendly user-facing messages
function friendlyAuthError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("rate limit") || m.includes("email rate limit") || m.includes("too many"))
        return "Too many attempts. Please wait a few minutes and try again, or use a different email address.";
    if (m.includes("already registered") || m.includes("user already exists"))
        return "An account with this email already exists. Try logging in instead.";
    if (m.includes("invalid login") || m.includes("invalid credentials"))
        return "Incorrect email or password. Please check your credentials and try again.";
    if (m.includes("email not confirmed"))
        return "Please check your email and click the confirmation link before logging in.";
    if (m.includes("password") && m.includes("short"))
        return "Password must be at least 6 characters long.";
    if (m.includes("unable to validate email"))
        return "Please enter a valid email address.";
    if (m.includes("signups not allowed") || m.includes("signup is disabled") || m.includes("not allowed for this instance"))
        return "Signups are currently disabled. Please enable signups in your Supabase Dashboard → Authentication → Providers → Email.";
    if (m.includes("network") || m.includes("fetch"))
        return "Network error. Please check your connection and try again.";
    // Return the original message if no match, but capitalize it
    return message.charAt(0).toUpperCase() + message.slice(1);
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/signup?error=${encodeURIComponent(friendlyAuthError(error.message))}`);
    }

    // Create workspace for new user
    if (data.user) {
        const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);

        const { data: workspace } = await supabase
            .from("workspaces")
            .insert({
                name: name ? `${name}'s Workspace` : "My Workspace",
                slug,
                owner_id: data.user.id,
                plan: "starter",
            })
            .select()
            .single();

        // Add owner as workspace member
        if (workspace) {
            await supabase.from("workspace_members").insert({
                workspace_id: workspace.id,
                user_id: data.user.id,
                role: "owner",
            });
        }
    }

    // If email confirmation is enabled, Supabase returns a user with no session
    // Redirect to a "check your email" page instead of dashboard
    if (data.session) {
        redirect("/dashboard");
    } else {
        redirect("/signup?info=Check+your+email+to+confirm+your+account%2C+then+log+in.");
    }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(friendlyAuthError(error.message))}`);
    }

    redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
