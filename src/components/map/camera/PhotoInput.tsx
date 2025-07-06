"use client";
import React, { useRef, useState } from "react";
import type { UserPosition } from "@/components/map/types";
import CameraIcon from "@/components/Icons/CameraIcon";

type Photo = {
  id: string;
  blob: Blob;
  description: string;
  position: UserPosition;
  timestamp: number;
};

type PhotoInputProps = {
  isTracking: boolean;
  userPosition: UserPosition | null;
  onAddPhoto: (photo: Photo) => void;
};

export default function PhotoInput({ isTracking, userPosition, onAddPhoto }: PhotoInputProps) {
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !userPosition) return;

  const photo: Photo = {
    id: crypto.randomUUID(),
    blob: file,
    description: description.trim(),
    position: userPosition,
    timestamp: Date.now(),
  };
  onAddPhoto(photo);
  setDescription("");
  if (fileInputRef.current) fileInputRef.current.value = "";
};

  return (
    <div className="fixed bottom-2 right-2 z-50 flex gap-2 items-center my-2 shadow-lg shadow-gray-800 rounded-full hover:shadow-xl transition-shadow duration-150">
  <input
    type="file"
    accept="image/*"
    capture="environment"
    style={{ display: "none" }}
    ref={fileInputRef}
    onChange={handleFileChange}
    disabled={!isTracking}
  />
  {/* Jeśli chcesz pole opisu, odkomentuj poniżej */}
  {/* <input
    type="text"
    placeholder="Opis zdjęcia"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    disabled={!isTracking}
    className="border rounded px-2 py-1 flex-grow"
  /> */}
  <button
    onClick={() => fileInputRef.current?.click()}
    disabled={!isTracking}
    className={`
      bg-orange-400 text-white
      w-16 h-16 rounded-full flex items-center justify-center
      shadow-lg transition-transform duration-150
      hover:scale-110 active:scale-90
      hover:bg-orange-500
      disabled:opacity-50
      focus:outline-none focus:ring-4 focus:ring-red-500
    `}
    aria-label="Dodaj zdjęcie"
  >
    <CameraIcon className="w-8 h-8" />
  </button>
</div>

  );
}
