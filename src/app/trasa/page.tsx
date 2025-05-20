"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/tracks/MapComponent"), { ssr: false });

export default function Trasa() {
  const [location, setLocation] = useState<{ lat:number; lon: number }>({ lat: 0, lon: 0 });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => console.error("❌ Błąd GPS:", error.message), // Poprawna obsługa błędów
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []); // Dodana pusta zależność `[]` do `useEffect`, aby uruchomić tylko raz

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-lime-300">
      <h1 className="text-2xl font-bold mb-4 text-center">Zaczynamy! Powodzenia!</h1>

      {location.lat !== null && location.lon !== null ? (
        <div className="flex flex-col bg-lime-500  h-[40rem] w-full">
          <p className="text-center text-blue-950">Lokalizacja: {location.lat}, {location.lon}</p> {/* Poprawione formatowanie */}
          <MapComponent lat={location.lat} lon={location.lon} />
        </div>
      ) : (
        <p>Oczekiwanie na sygnał GPS...</p>
      )}
      
    </div>
  );
}
