import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../lib/supabase-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const redirectTo = `${origin}/reset-password`;
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "If this email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("[password/forgot] Unexpected error:", err);
    return NextResponse.json({ error: "Unable to send reset email." }, { status: 500 });
  }
}
