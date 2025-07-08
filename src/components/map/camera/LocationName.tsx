import React, { useEffect, useState } from "react";

function LocationName({ lat, lon }: { lat: number; lon: number }) {
  const [location, setLocation] = useState<string>("Ładowanie...");

  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`
        );
        const data = await response.json();
        // Wybierz najbardziej odpowiednie pola z data.address
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          data.address.road ||
          "";
        const state = data.address.state || "";
        const road = data.address.road || "";
        setLocation(city ? `${city}${state ? ", " + state : ""}${road ? ", ulica: " + road : ""}` : "Nieznana lokalizacja");
      } catch {
        setLocation("Nieznana lokalizacja");
      }
    }
    fetchLocation();
  }, [lat, lon]);

  return <small className="text-gray-400 block">Lokalizacja: {location}</small>;
}
export default LocationName;