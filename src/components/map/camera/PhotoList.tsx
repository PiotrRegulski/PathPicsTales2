"use client";
import React, { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/components/map/types";

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
      {photos.map(({ id, imageDataUrl, description, timestamp }) => (
        <div key={id} className="border rounded shadow p-2">
          <Image
            src={imageDataUrl}
            alt="Zdjęcie z trasy"
            width={400}
            height={400}
            className="rounded"
            unoptimized={true}
          />
          {/* Tryb edycji */}
          {editingId === id ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="text"
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                className="border p-1 rounded"
                autoFocus
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
          {/* {position && (
            <small className="text-gray-400 block">
              Pozycja: {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
            </small>
          )} */}
        </div>
      ))}
    </div>
  );
}
