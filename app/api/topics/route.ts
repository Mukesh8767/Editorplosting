import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-client";

const topicSelect = `id, parent_id, title, slug, description, is_active, created_at, updated_at`;

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const parentId = request.nextUrl.searchParams.get("parentId");

  let base = supabaseAdmin.from("topics").select(topicSelect).order("title", { ascending: true });
  if (parentId === "null") {
    base = base.is("parent_id", null);
  } else if (parentId) {
    base = base.eq("parent_id", parentId);
  }

  const { data, error } = await base;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = await request.json();

  const { id, title, parent_id, slug, description, is_active } = payload;

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("topics")
      .update({ title, parent_id: parent_id || null, slug: slug ?? null, description, is_active })
      .eq("id", id)
      .select(topicSelect)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin
    .from("topics")
    .insert([{ title, parent_id: parent_id || null, slug: slug ?? null, description, is_active: is_active ?? true }])
    .select(topicSelect)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabaseAdmin.from("topics").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
