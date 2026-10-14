import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapCenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);

  return null;
}
