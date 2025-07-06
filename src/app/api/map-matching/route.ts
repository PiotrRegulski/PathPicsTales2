// app/api/map-matching/route.ts
import type { NextRequest } from "next/server";
import type { UserPosition } from "@/components/map/types";

export async function POST(request: NextRequest) {
  try {
    // Parsowanie i walidacja danych wejściowych
    const body = await request.json();

    if (!body.points || !Array.isArray(body.points)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'points' must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const points: UserPosition[] = body.points;

    if (points.length === 0) {
      return new Response(
        JSON.stringify({ error: "Empty points array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tworzenie ciągu współrzędnych do OSRM
    const coords = points.map((p: UserPosition) => `${p.lon},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/match/v1/driving/${coords}?geometries=geojson&overview=full`;

    // Wywołanie OSRM
    const res = await fetch(url);

    if (!res.ok) {
      // Obsługa błędów HTTP
      const errorText = await res.text();
      return new Response(
        JSON.stringify({ error: `OSRM API error: ${res.status} ${res.statusText}`, details: errorText }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

   

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Obsługa błędów parsowania JSON i innych wyjątków
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({ error: "Internal server error", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
