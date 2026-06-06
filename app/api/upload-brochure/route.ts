import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-client";

const BUCKET_NAME = "sustainwheelsolutions";

const safeFileName = (name: string) =>
  name
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 150);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "pdf";
  const filePath = `brochures/${safeFileName(file.name)}-${Date.now()}.${extension}`;
  const supabaseAdmin = getSupabaseAdmin();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    return NextResponse.json({ error: "Unable to generate public URL." }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
