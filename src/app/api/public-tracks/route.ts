import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Zapisz trasę (POST)
export async function POST(req: NextRequest) {
  try {
    const { trackName, track, distance, travelTime, elapsedTime, photos } = await req.json();

    if (
      typeof trackName !== "string" ||
      !Array.isArray(track) ||
      !Array.isArray(photos) ||
      typeof distance !== "number" ||
      typeof travelTime !== "number" ||
      typeof elapsedTime !== "number"
    ) {
      return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
    }

    await sql`
      INSERT INTO public_tracks (track_name, track, distance, travel_time, elapsed_time, photos)
      VALUES (${trackName}, ${JSON.stringify(track)}, ${distance}, ${travelTime}, ${elapsedTime}, ${JSON.stringify(photos)})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Pobierz trasy (GET)
export async function GET() {
  const result =
    await sql`SELECT * FROM public_tracks ORDER BY created_at DESC LIMIT 100`;
  return NextResponse.json(result.rows);
}
