import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("filename") || "";
  const folder = request.nextUrl.searchParams.get("folder") || "brochures";

  if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
  }

  const safeFilename = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 150);

  const timestamp = Math.floor(Date.now() / 1000);
  const public_id = `${safeFilename}-${timestamp}`;
  const params: Record<string, string> = {
    folder,
    overwrite: "true",
    public_id,
    timestamp: String(timestamp),
  };

  const paramsToSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&") + config.cloudinaryApiSecret;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  return NextResponse.json({
    cloudName: config.cloudinaryCloudName,
    apiKey: config.cloudinaryApiKey,
    timestamp,
    signature,
    folder,
    public_id,
  });
}
