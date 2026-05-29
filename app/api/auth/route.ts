import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, getSupabaseAdmin } from "../../../lib/supabase-client";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: authError?.message || "Invalid credentials." }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, username, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 401 });
  }

  return NextResponse.json({
    id: authData.user.id,
    username: authData.user.email ?? email,
    displayName: profile?.full_name || profile?.username || profile?.email || email,
    role: profile?.role || "author",
    avatarUrl: profile?.author_image_url ?? null,
  });
}
