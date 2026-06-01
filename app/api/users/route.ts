import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-client";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, username, full_name, role")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((user) => ({
      id: user.id,
      username: user.email,
      displayName: user.full_name || user.username || user.email,
      role: user.role,
    }))
  );
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { username, displayName, password, authorImageUrl, avatarUrl } = await request.json();
  const email = username?.trim();

  if (!email || !displayName || !password) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const usernameValue = email.split("@")[0];
  const imageUrl = avatarUrl ?? authorImageUrl ?? null;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || "Unable to create user." }, { status: 500 });
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: authData.user.id,
        email,
        username: usernameValue,
        full_name: displayName,
        role: "author",
        author_image_url: imageUrl,
        avatar_url: imageUrl,
      },
    ])
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    id: profileData.id,
    username: profileData.email,
    displayName: profileData.full_name || profileData.username || profileData.email,
    role: profileData.role,
    avatarUrl: profileData.author_image_url ?? profileData.avatar_url ?? null,
  });
}

export async function PATCH(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { id, displayName, password, avatarUrl, authorImageUrl } = await request.json();
  const imageUrl = avatarUrl ?? authorImageUrl ?? null;

  if (!id || !displayName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: displayName,
      author_image_url: imageUrl,
      avatar_url: imageUrl,
    })
    .eq("id", id)
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (password) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password,
    });
    if (passwordError) {
      return NextResponse.json({ error: passwordError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    id: profileData.id,
    username: profileData.email,
    displayName: profileData.full_name || profileData.username || profileData.email,
    role: profileData.role,
    avatarUrl: profileData.author_image_url ?? profileData.avatar_url ?? null,
  });
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  // Delete the profile first
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Delete the auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
