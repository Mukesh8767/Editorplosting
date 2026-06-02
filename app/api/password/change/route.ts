import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseClient } from "../../../../lib/supabase-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { id, email, currentPassword, newPassword } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!id || !normalizedEmail || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required." }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: currentPassword,
    });

    if (authError || !authData.user || authData.user.id !== id) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    await supabase.auth.signOut();

    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("[password/change] Unexpected error:", err);
    return NextResponse.json({ error: "Unable to change password." }, { status: 500 });
  }
}
