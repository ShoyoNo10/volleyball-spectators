import { NextResponse } from "next/server";
import cloudinary from "@/src/lib/cloudinary";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const upload = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json(upload);
}
