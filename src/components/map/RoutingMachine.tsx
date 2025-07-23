"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import L from "leaflet";
import "leaflet-routing-machine";

// Typ dla propów - lista punktów, które wyznaczają trasę
type RoutingMachineProps = {
  waypoints: Array<{ lat: number; lon: number }>;
};

const RoutingMachine = ({ waypoints }: RoutingMachineProps) => {
  // Pobieramy referencję do mapy Leaflet z kontekstu React Leaflet
  const map = useMap();

  useEffect(() => {
    // Sprawdzamy, czy mamy mapę oraz minimum dwa punkty do wyznaczenia trasy
    if (!map || waypoints.length < 2) return;

    // Mapujemy punkty na format Leaflet LatLng - wymagany przez Routing Machine
    const leafletWaypoints = waypoints.map((pt) => L.latLng(pt.lat, pt.lon));

    // Tworzymy kontrolkę routingu z ustawieniami
    const routingControl = L.Routing.control({
      waypoints: leafletWaypoints,       // punkty do wyznaczenia trasy
      lineOptions: {
        // Styl linii na mapie (kolor i szerokość)
        styles: [{ color: "#3388ff", weight: 5 }],
        extendToWaypoints: true,         // rozciągnij linię do punktów końcowych
        missingRouteTolerance: 10,       // tolerancja dla brakujących fragmentów trasy
      },
      addWaypoints: false,                // wyłącz możliwość dodawania waypointów przez użytkownika
      fitSelectedRoutes: true,           // automatycznie dopasuj widok mapy do trasy
      showAlternatives: false,            // wyłącz alternatywne trasy
      routeWhileDragging: false,         // wyłącz wyznaczanie trasy w trakcie przeciągania
    }).addTo(map);                       // dodaj kontrolkę na mapę

    // Funkcja sprzątająca - usunięcie kontrolki gdy komponent się odmontuje
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints]); // efekt uruchamia się przy każdej zmianie mapy lub punktów trasy

  // Komponent nic nie renderuje w JSX, bo kontrolka jest zarządzana bezpośrednio przez Leaflet
  return null;
};

export default RoutingMachine;
