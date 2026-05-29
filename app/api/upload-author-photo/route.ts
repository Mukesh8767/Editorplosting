import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { config } from "@/lib/config";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const upload = () =>
    new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "author-avatars",
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

  try {
    const result = await upload();
    return NextResponse.json({ url: result.secure_url || result.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Cloudinary upload failed." }, { status: 500 });
  }
}
