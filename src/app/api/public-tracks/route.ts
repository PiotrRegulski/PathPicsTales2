import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Pobierz trasy (GET)
export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM public_tracks ORDER BY created_at DESC LIMIT 100
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET API error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Zapisz trasę (POST)
export async function POST(req: NextRequest) {
  try {
    const { trackName, track, distance, travelTime, elapsedTime, photos } = await req.json();

    // Walidacja podstawowa
    if (
      typeof trackName !== "string" ||
      trackName.trim().length === 0 ||
      !Array.isArray(track) ||
      !Array.isArray(photos) ||
      typeof distance !== "number" ||
      typeof travelTime !== "number" ||
      typeof elapsedTime !== "number"
    ) {
      return NextResponse.json({ error: "Brak lub niepoprawne dane" }, { status: 400 });
    }

    await sql`
      INSERT INTO public_tracks (track_name, track, distance, travel_time, elapsed_time, photos)
      VALUES (
        ${trackName.trim()},
        ${JSON.stringify(track)},
        ${distance},
        ${travelTime},
        ${elapsedTime},
        ${JSON.stringify(photos)}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST API error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Usuń trasę (DELETE)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("DELETE request body:", body);

    let { id } = body;

    // Akceptuj string lub number
    if ((typeof id !== "string" && typeof id !== "number") || id === null || id === undefined) {
      return NextResponse.json({ error: "Brak ID trasy lub niepoprawny typ" }, { status: 400 });
    }

    // Zamień na string i obetnij spacje
    id = String(id).trim();

    if (id === "") {
      return NextResponse.json({ error: "Puste ID trasy" }, { status: 400 });
    }

    await sql`
      DELETE FROM public_tracks WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE API error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

