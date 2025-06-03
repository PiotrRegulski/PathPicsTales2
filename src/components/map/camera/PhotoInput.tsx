"use client";
import React, { useRef, useState } from "react";
import type { UserPosition } from "@/components/map/types";

type PhotoInputProps = {
  isTracking: boolean;
  userPosition: UserPosition | null;
  onAddPhoto: (imageDataUrl: string, description: string) => void;
};

export default function PhotoInput({ isTracking, userPosition, onAddPhoto }: PhotoInputProps) {
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userPosition) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;
      onAddPhoto(imageDataUrl, description.trim());
      setDescription("");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="photo-input flex gap-2 items-center">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={!isTracking}
      />
      <input
        type="text"
        placeholder="Opis zdjęcia"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!isTracking}
        className="border rounded px-2 py-1 flex-grow"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={!isTracking}
        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
      >
        Zrób zdjęcie
      </button>
    </div>
  );
}
