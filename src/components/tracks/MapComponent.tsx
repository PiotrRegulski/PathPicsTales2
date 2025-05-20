"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔹 Konfiguracja ikony markera
const markerIcon = new L.Icon({
 iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type UserLocation = { lat: number; lon: number };

const MapComponent: React.FC<UserLocation> = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [gpsPermission, setGpsPermission] = useState<string>("checking");
  const [speed, setSpeed] = useState<number>(0);

  useEffect(() => {
    if (!L) {
      console.error("Leaflet nie został poprawnie załadowany.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setGpsPermission("unsupported");
      return;
    }

    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setGpsPermission(result.state);
      });
    }

    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([51.9194, 19.1451], 13); // Polska

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        // 🔹 Obsługa braku `speed`
        setSpeed(speed ?? 0);

        if (mapInstance.current) {
          if (!markerRef.current) {
            markerRef.current = L.marker([latitude, longitude], { icon: markerIcon }) // ✅ Użycie ręcznej ikony
              .addTo(mapInstance.current)
              .bindPopup("📍 Twoja aktualna lokalizacja")
              .openPopup();
          } else {
            markerRef.current.setLatLng([latitude, longitude]);
          }

          mapInstance.current.setView([latitude, longitude], 16);
        }
      },
      (error) => {
        console.error("❌ Błąd GPS:", error.message);
        setGpsPermission("denied");
        alert("🚫 GPS został zablokowany! Włącz lokalizację w ustawieniach.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapInstance.current) {
        // Usuwanie tylko warstw zamiast całkowitego usunięcia mapy
        mapInstance.current.eachLayer((layer) => {
          if (!(layer instanceof L.TileLayer)) {
            mapInstance.current?.removeLayer(layer);
          }
        });
      }
      markerRef.current = null;
    };
  }, []);

  return (
    <div>
      {gpsPermission === "denied" && <p>🚫 Dostęp do GPS został **zablokowany** przez użytkownika.</p>}
      {gpsPermission === "unsupported" && <p>❌ **Urządzenie nie obsługuje GPS!**</p>}
      {gpsPermission === "prompt" && <p>⏳ **Czekamy na zgodę użytkownika...**</p>}

      {userLocation ? (
        <p>📍 Twoja aktualna lokalizacja: {userLocation.lat}, {userLocation.lon}</p>
      ) : (
        gpsPermission === "granted" && <p>🔄 **Oczekiwanie na sygnał GPS...**</p>
      )}

      <p>🚗 Prędkość: {speed.toFixed(2)} m/s</p>

      <button
        onClick={() => {
          navigator.permissions.query({ name: "geolocation" }).then((result) => {
            setGpsPermission(result.state);
            if (result.state === "granted") {
              window.location.reload();
            }
          });
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
      >
        🔄 Sprawdź ponownie dostęp do GPS
      </button>

      <div ref={mapRef} className="container h-[15rem] w-[300px] mx-auto rounded-lg shadow-lg" />
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
