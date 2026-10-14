import { Marker } from "react-leaflet";
import { icons } from "./icons";

type PinProps = {
  position: { lat: number; lng: number };
  type: "user" | "event";
};

export function Pin({ position, type }: PinProps) {
  return <Marker icon={icons[type]} position={[position.lat, position.lng]} />;
}
