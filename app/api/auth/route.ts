import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, getSupabaseAdmin } from "../../../lib/supabase-client";
import { config } from "../../../lib/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("[auth] POST received");
    console.log("[auth] env presence", {
      supabaseUrl: !!config.supabaseUrl,
      supabaseAnonKey: !!config.supabaseAnonKey,
      supabaseServiceKey: !!config.supabaseServiceKey,
    });

    const { username, password } = await request.json();
    const email = username?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.warn("[auth] signInWithPassword failed", { message: authError?.message });
      return NextResponse.json({ error: authError?.message || "Invalid credentials." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, username, role, avatar_url, author_image_url")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.warn("[auth] profile lookup failed", { message: profileError.message });
      return NextResponse.json({ error: profileError.message }, { status: 401 });
    }

    return NextResponse.json({
      id: authData.user.id,
      username: authData.user.email ?? email,
      displayName: profile?.full_name || profile?.username || profile?.email || email,
      role: profile?.role || "author",
      avatarUrl: profile?.author_image_url ?? profile?.avatar_url ?? null,
    });
  } catch (err) {
    console.error("[auth] Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
