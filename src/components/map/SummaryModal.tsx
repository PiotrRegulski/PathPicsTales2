import React from "react";
import type { Photo } from "@/components/map/types";
import SaveTrackButton from "./camera/SaveTrackButton";
type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  trackName: string;
  travelTime: number;
  photos: Photo[];
  onEditDescriptions: () => void;
  track : { lat: number; lon: number }[];
  elapsedTime: number;
    distance: number;
     onResetPhotos: () => void;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export function SummaryModal({
  isOpen,
  onClose,
 track,
 distance,
  elapsedTime,
  trackName,
  travelTime,
  photos,
  onEditDescriptions,
    onResetPhotos,
}: SummaryModalProps) {
  if (!isOpen) return null;

  const photosWithDescription = photos.filter((p) => p.description && p.description.trim() !== "");
  const missingDescriptions = photos.length - photosWithDescription.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Podsumowanie trasy</h2>
        <p>
          Twoja trasa <b>{trackName}</b> zajęła Ci <b>{formatTime(travelTime)}</b>.
        </p>
        <p>
          Ilość zrobionych zdjęć to <b>{photos.length}</b>
        </p>
        <p>
          {photosWithDescription.length > 0
            ? `Opisy dodałeś do ${photosWithDescription.length} zdjęć.`
            : "Nie dodałeś jeszcze opisów do zdjęć."}
        </p>
        <p className="mt-2 text-sm text-gray-700">
          Dzięki opisom Twoja galeria to nie tylko zdjęcia, ale gotowa opowieść z wyjazdu!
        </p>
        {missingDescriptions > 0 && (
          <div className="mt-4 text-red-600">
            <p>Nie wszystkie zdjęcia mają opis.</p>
            <button
              className="mt-2 bg-gray-200 px-3 py-1 rounded"
              onClick={() => {
                onClose();
                onEditDescriptions();
              }}
            >
              Cofnij i dodaj opisy
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
           <SaveTrackButton
                     trackName={trackName}
                     track={track}
                     distance={distance}
                     travelTime={travelTime}
                     elapsedTime={elapsedTime}
                     photos={photos}
                     onReset={onResetPhotos}
                   />
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
