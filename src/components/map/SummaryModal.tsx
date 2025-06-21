import React from "react";
import type { Photo } from "@/components/map/types";
type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  trackName: string;
  travelTime: number;
  photos: Photo[];
  onEditDescriptions: () => void;
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
  onSave,
  trackName,
  travelTime,
  photos,
  onEditDescriptions,
}: SummaryModalProps) {
  if (!isOpen) return null;

  const photosWithDescription = photos.filter((p) => p.description && p.description.trim() !== "");
  const missingDescriptions = photos.length - photosWithDescription.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Podsumowanie trasy</h2>
        <p>
          Twoja trasa <b>{trackName}</b> zajęła Ci <b>{formatTime(travelTime)}</b>.
        </p>
        <p>
          Zrobiłeś podczas niej <b>{photos.length}</b> zdjęć.
        </p>
        <p>
          {photosWithDescription.length > 0
            ? `Opisy dodałeś do ${photosWithDescription.length} zdjęć.`
            : "Nie dodałeś jeszcze opisów do zdjęć."}
        </p>
        <p className="mt-2 text-sm text-gray-700">
          Opisy są ważne, by stworzyć opowieść z podróży i mieć piękną pamiątkę. 
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
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onSave}
          >
            Zapisz trasę
          </button>
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
