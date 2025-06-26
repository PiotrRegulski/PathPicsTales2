import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    console.log("UPLOAD API: file=", file);
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const fileName = (file instanceof File && file.name) ? file.name : "upload-" + Date.now();

    // Upload do Vercel Blob, folder "photos"
    const blob = await put(`photos/${fileName}`, file, { access: "public",addRandomSuffix: true });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

