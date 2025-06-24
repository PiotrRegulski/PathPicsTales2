import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Upload do Vercel Blob, folder "photos"
  const blob = await put(`photos/${file.name}`, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
