import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-client";

const brochureSelect = `id, title, description, pdf_url, uploaded_by, is_active, created_at, updated_at, uploader:profiles!uploaded_by(id, full_name, username, avatar_url)`;

const isFileObject = (value: FormDataEntryValue): value is File => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).arrayBuffer === "function" &&
    typeof (value as any).name === "string"
  );
};

const BUCKET_NAME = "sustainwheelsolutions";

const getSafeStoragePath = (file: File) => {
  const extension = file.name.split(".").pop() || "pdf";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 150);
  return `brochures/${safeName}-${Date.now()}.${extension}`;
};

const uploadBrochureToSupabase = async (file: File) => {
  const supabaseAdmin = getSupabaseAdmin();
  const filePath = getSafeStoragePath(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Unable to generate public URL for brochure.");
  }

  return publicUrlData.publicUrl;
};

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const brochureId = request.nextUrl.searchParams.get("id");
  const userId = request.nextUrl.searchParams.get("userId");

  let query = supabaseAdmin.from("brochures").select(brochureSelect).order("created_at", { ascending: false });

  if (brochureId) {
    const { data, error } = await query.eq("id", brochureId).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || null);
  }

  if (userId) {
    query = query.eq("uploaded_by", userId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  console.log('[brochures POST] start');
  const formData = await request.formData();
  console.log('[brochures POST] formData received');

  const id = (formData.get("id") as string) || null;
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || null;
  const fileValue = formData.get("file");
  const pdfUrlFromForm = (formData.get("pdf_url") as string) || null;
  const uploadedBy = (formData.get("uploaded_by") as string) || null;
  const isActive = formData.get("is_active") === "false" ? false : true;

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  let pdf_url = pdfUrlFromForm;

  if (fileValue && isFileObject(fileValue)) {
    try {
      pdf_url = await uploadBrochureToSupabase(fileValue);
    } catch (uploadError: any) {
      return NextResponse.json({ error: uploadError?.message || "Supabase storage upload failed." }, { status: 500 });
    }
  }

  if (!pdf_url) {
    return NextResponse.json({ error: "A PDF upload or existing URL is required." }, { status: 400 });
  }

  const values: any = {
    title: title.trim(),
    description: description?.trim() || null,
    pdf_url,
    uploaded_by: uploadedBy,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await supabaseAdmin.from("brochures").update(values).eq("id", id).select(brochureSelect);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] ?? null);
  }

  values.created_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin.from("brochures").insert([values]).select(brochureSelect);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? null);
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const brochureId = request.nextUrl.searchParams.get("id");

  if (!brochureId) {
    return NextResponse.json({ error: "Missing brochure id." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("brochures").delete().eq("id", brochureId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
