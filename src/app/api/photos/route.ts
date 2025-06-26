import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "photos/" });
    const photos = blobs.map(blob => ({
      url: blob.url,
      name: blob.pathname.split("/").pop() || blob.pathname,
    }));
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Błąd pobierania zdjęć z Vercel Blob:", error);
    return NextResponse.json({ error: "Błąd pobierania zdjęć" }, { status: 500 });
  }
}
