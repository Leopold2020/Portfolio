import L from "leaflet";

export const icons = {
  event: new L.Icon({
    iconAnchor: [20, 20],
    iconUrl: "/event-pin.svg",
  }),
  user: new L.Icon({
    iconAnchor: [12, 12],
    iconUrl: "/user-pin.svg",
  }),
};
