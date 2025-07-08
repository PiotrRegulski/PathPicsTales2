// Funkcje pomocnicze
import { openDB } from "idb";
export function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}


export async function getDB() {
  return openDB("TravelDB", 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("tempTracks")) {
        db.createObjectStore("tempTracks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tracks")) {
        const store = db.createObjectStore("tracks", { keyPath: "id" });
        store.createIndex("by-date", "date");
      }
    },
  });
}

// Maksymalna liczba próbek prędkości do uśredniania
const MAX_SPEED_BUFFER_SIZE = 5;

// Maksymalna realistyczna prędkość w km/h (np. dla pieszych)
// Prędkości powyżej tej wartości będą odrzucane jako błędne
const MAX_REALISTIC_SPEED = 50;

// Bufor przechowujący ostatnie wartości prędkości
const speedBuffer: number[] = [];

/**
 * Aktualizuje prędkość, dodając nową próbkę do bufora,
 * a następnie oblicza i ustawia średnią prędkość na podstawie bufora.
 * 
 * @param newSpeed - nowa zmierzona prędkość (km/h)
 * @param setSpeed - funkcja ustawiająca prędkość w stanie komponentu
 */
export function updateSpeed(newSpeed: number, setSpeed: (val: number) => void) {
  speedBuffer.push(newSpeed);

  // Usuwamy najstarszą próbkę, jeśli przekroczono rozmiar bufora
  if (speedBuffer.length > MAX_SPEED_BUFFER_SIZE) {
    speedBuffer.shift();
  }

  // Obliczamy średnią prędkość z próbek w buforze
  const avgSpeed = speedBuffer.reduce((a, b) => a + b, 0) / speedBuffer.length;

  // Ustawiamy uśrednioną prędkość w stanie komponentu
  setSpeed(avgSpeed);
}

/**
 * Oblicza prędkość na podstawie przebytej odległości i czasu.
 * Odrzuca nierealistyczne prędkości (np. z powodu błędów GPS).
 * 
 * @param dist - odległość w metrach między dwoma punktami
 * @param timeDelta - czas w sekundach między dwoma pomiarami
 * @returns prędkość w km/h lub 0 jeśli prędkość jest nierealistyczna
 */
export function calculateSpeed(dist: number, timeDelta: number): number {
  if (timeDelta <= 0) return 0;

  // Przeliczamy prędkość z m/s na km/h
  const speedKmh = (dist / timeDelta) * 3.6;

  // Odrzucamy prędkości powyżej maksymalnej realistycznej wartości
  if (speedKmh > MAX_REALISTIC_SPEED) return 0;

  return speedKmh;
}
