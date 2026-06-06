import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSupabaseAdmin } from "../../../lib/supabase-client";
import { config } from "../../../lib/config";

const brochureSelect = `id, title, description, pdf_url, uploaded_by, is_active, created_at, updated_at, uploader:profiles!uploaded_by(id, full_name, username, avatar_url)`;

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const isFileObject = (value: FormDataEntryValue): value is File => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).arrayBuffer === "function" &&
    typeof (value as any).name === "string"
  );
};

const uploadToCloudinary = async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFilename = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  console.log('[uploadToCloudinary] file:', file.name, 'sizeBytes:', buffer.length);
  const start = Date.now();

  const uploadPromise = new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "brochures",
        resource_type: "raw",
        type: "upload",
        public_id: safeFilename, // keep .pdf extension so Cloudinary serves correct MIME type
        overwrite: true,
      },
      (error, result) => {
        console.log('Cloudinary Result:', result);
        if (error) return reject(error);
        resolve(result?.secure_url || result?.url || "");
      }
    );
    try {
      stream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });

  const timeoutMs = 60000; // 60s
  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error(`Cloudinary upload timed out after ${timeoutMs}ms`)), timeoutMs)
  );

  try {
    const url = await Promise.race([uploadPromise, timeoutPromise]);
    console.log('[uploadToCloudinary] finished in', Date.now() - start, 'ms, url:', url);
    return url;
  } catch (err: any) {
    console.error('[uploadToCloudinary] error after', Date.now() - start, 'ms:', err);
    throw err;
  }
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
    console.log('[brochures POST] file detected:', (fileValue as File).name);
    if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
      return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
    }
    try {
      console.log('[brochures POST] starting Cloudinary upload');
      pdf_url = await uploadToCloudinary(fileValue);
      console.log('[brochures POST] Cloudinary upload finished, url:', pdf_url);
    } catch (uploadError: any) {
      console.error('[brochures POST] Cloudinary upload error:', uploadError);
      return NextResponse.json({ error: uploadError?.message || "Cloudinary upload failed." }, { status: 500 });
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
