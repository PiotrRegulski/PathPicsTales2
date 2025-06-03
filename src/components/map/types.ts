// types.ts
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
