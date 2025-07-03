import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    // Pobranie danych formularza przesłanego w żądaniu POST
    const formData = await req.formData();

    // Wyciągnięcie pliku o nazwie "file" z danych formularza
    const file = formData.get("file");
    console.log("UPLOAD API: file=", file);

    // Sprawdzenie, czy plik w ogóle został przesłany
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Walidacja, czy przesłany obiekt jest instancją Blob (plików w JS)
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Ustalenie nazwy pliku:
    // jeśli obiekt jest instancją File i ma nazwę, użyj jej,
    // w przeciwnym razie generuj unikalną nazwę na podstawie timestampu
    const fileName = (file instanceof File && file.name) ? file.name : "upload-" + Date.now();

    // Konwersja Blob na Buffer (wymagane przez @vercel/blob)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sprawdzenie, czy token jest dostępny
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Upload pliku do Vercel Blob Storage w folderze "photos"
    const blob = await put(`photos/${fileName}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log("Upload successful, blob URL:", blob.url);

    // Zwrócenie w odpowiedzi JSON z adresem URL przesłanego pliku
    return NextResponse.json({ url: blob.url });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
