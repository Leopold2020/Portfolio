import { Circle } from "react-leaflet";

export function RadiusCircle({ center, radiusKm }: { center: { lat: number; lng: number }; radiusKm: number }) {
  return (
    <Circle
      center={[center.lat, center.lng]}
      pathOptions={{
        color: "white",
        fillOpacity: 0.15,
      }}
      radius={radiusKm * 1000}
    />
  );
}
