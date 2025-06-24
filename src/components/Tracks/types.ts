// src/types.ts
export type UserPosition = {
  lat: number;
  lon: number;
};

export type Photo = {
  id: string;
  blob: Blob;
  description: string;
  position: UserPosition;
  timestamp: number;
};

export type Track = {
 id: string;
  trackName: string;
  travelTime: number;
  distance: number;
  elapsedTime: number;
  track: UserPosition[];
  photos: Photo[];
};

export type MapViewProps = {
  track: UserPosition[];
  photoMarkers: Photo[];
  selectedPhotoId?: string | null;
  onPhotoMarkerClick?: (photo: Photo) => void;
};
