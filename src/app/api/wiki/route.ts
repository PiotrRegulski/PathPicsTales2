// app/api/wiki/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Brak zapytania" }, { status: 400 });
  }

  // Pobierz z polskiej Wikipedii
  const wikiUrl = `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const res = await fetch(wikiUrl);

  if (!res.ok) {
    return NextResponse.json({ error: "Nie znaleziono artykułu" }, { status: 404 });
  }

  const data = await res.json();
  return NextResponse.json({
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page || "",
  });
}
