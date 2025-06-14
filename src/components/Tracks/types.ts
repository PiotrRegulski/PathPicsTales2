// src/types.ts
export type Photo = {
  id: string;
  lat: number;
  lng: number;
  description: string;
  thumbnailUrl: string;
  dateTime: string; // pole obowiązkowe
};

export type Track = {
  id: string;
  track: [number, number][];
  photos: Photo[];
};
export type MapViewProps = {
  track: [number, number][];
  photoMarkers: Photo[];
  selectedPhotoId?: string | null;
  onPhotoMarkerClick?: (photo: Photo) => void;
};
