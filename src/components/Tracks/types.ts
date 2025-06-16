// src/types.ts
export type UserPosition = {
  lat: number;
  lon: number;
};

export type Photo = {
  id: string;
  imageDataUrl: string;
  description: string;
  position: UserPosition;
  timestamp: number;
};

export type Track = {
  id: string;
  track: UserPosition[];
  photos: Photo[];
  // inne pola (opcjonalnie)
};

export type MapViewProps = {
  track: UserPosition[];
  photoMarkers: Photo[];
  selectedPhotoId?: string | null;
  onPhotoMarkerClick?: (photo: Photo) => void;
};
