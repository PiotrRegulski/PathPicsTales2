import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Brak zapytania" }, { status: 400 });
  }

  // 1. Najpierw wyszukaj tytuł artykułu
  const searchUrl = `https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    return NextResponse.json({ error: "Błąd wyszukiwania" }, { status: 500 });
  }
  const searchData = await searchRes.json();
  const firstHit = searchData?.query?.search?.[0];
  if (!firstHit) {
    return NextResponse.json({ error: "Nie znaleziono artykułu" }, { status: 404 });
  }
  const title = firstHit.title;

  // 2. Pobierz podsumowanie po tytule
  const summaryUrl = `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) {
    return NextResponse.json({ error: "Nie znaleziono podsumowania" }, { status: 404 });
  }
  const data = await summaryRes.json();
  return NextResponse.json({
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page || "",
  });
}
