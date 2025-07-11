"use client";
import React, { useState } from "react";
import type { Photo } from "@/components/map/types";
import WikiFactFetcher from "@/components/WikiFactFetcher";
import PhotoBlobImage from "@/components/map/camera/PhotoBlobToImage";
import LocationName from "./LocationName";
type PhotoListProps = {
  photos: Photo[];
  onEditDescription: (photoId: string, newDescription: string) => void;
};

export default function PhotoList({
  photos,
  onEditDescription,
}: PhotoListProps) {
  // Przechowuj ID zdjęcia, które jest aktualnie edytowane
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempDesc, setTempDesc] = useState<string>("");

  if (photos.length === 0) return null;

  return (
    <div className="photo-list mt-4 grid grid-cols-1 gap-2 my-4">
      {photos.map(({ id, blob, description, timestamp,position }) => (
        <div key={id} className="border rounded shadow p-2">
          <PhotoBlobImage
            blob={blob}
            alt="Zdjęcie z trasy"
            width={400}
            height={400}
            className="rounded"
          />
          {/* Tryb edycji */}
          {editingId === id ? (
            <div className="flex flex-col gap-2 mt-2">
              <textarea
                placeholder="Dodaj opis..."
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                className="border p-1 rounded resize-y w-full min-h-[60px]"
                autoFocus
                rows={3} // domyślna wysokość textarea
              />
              <WikiFactFetcher
                initialKeyword={tempDesc}
                onSave={(fact) =>
                  setTempDesc((prev) => (prev ? prev + "\n" + fact : fact))
                }
              />
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    onEditDescription(id, tempDesc);
                    setEditingId(null);
                  }}
                >
                  Zapisz
                </button>
                <button
                  className="bg-gray-300 px-2 py-1 rounded"
                  onClick={() => setEditingId(null)}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 mt-2 w-full ">
              <div>
                {" "}
                <p className="text-sm flex-1">
                  {description && description.trim() !== ""
                    ? description
                    : "Brak opisu"}
                </p>
              </div>

              <button
                className="text-blue-600 underline text-xs"
                onClick={() => {
                  setEditingId(id);
                  setTempDesc(description || "");
                }}
              >
                Edytuj Opis
              </button>
            </div>
          )}
          <small className="text-gray-500 block">
            {new Date(timestamp).toLocaleString()}
          </small>
          {position && (
            <small className="text-gray-400 block">
              {position && <LocationName lat={position.lat} lon={position.lon} />}
            </small>
          )}
        </div>
      ))}
    </div>
  );
}
