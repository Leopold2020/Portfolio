import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Overlay from "../Overlay";
import { EventsLayer } from "./EventsLayer";
import { MapCenter } from "./MapCenter";
import { Pin } from "./pins/Pin";
import { RadiusCircle } from "./RadiusCircle";

const DEFAULT_CENTER = {
  lat: 0,
  lng: 0,
};

interface MapViewProps {
  eventId?: string;
}

export function MapView({ eventId }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<null | { lat: number; lng: number }>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isOpen, setIsOpen] = useState(!!eventId);
  const navigate = useNavigate();

  const radiusKm = 20;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location_geo = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setUserLocation(location_geo);
        setMapCenter(location_geo);
      },
      (error) => {
        console.error("geolocation error", error);
        setUserLocation(null);
        setMapCenter(DEFAULT_CENTER);
      },
    );
  }, []);

  //TODO: if redirect from my events page, center map on that events id

  return (
    <MapContainer center={[mapCenter.lat, mapCenter.lng]} style={{ height: "100vh" }} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapCenter center={mapCenter} />
      {userLocation && <Pin position={userLocation} type="user" />}
      {userLocation && <RadiusCircle center={mapCenter} radiusKm={radiusKm} />}
      {userLocation && <EventsLayer center={mapCenter} radiusKm={radiusKm} />}
      <Overlay
        isForm={false}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          navigate({ to: "/map" });
          console.log("should close");
        }}
        title="Event Details"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-xl">Summer Music Festival</h3>
            <h3 className="font-bold text-gray-900 text-xl">Event with id: {eventId}</h3>
            <p className="mt-2 text-gray-600">Join us for an amazing day of music, food, and fun!</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                aria-label="date"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>December 25, 2024</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="Close"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>Central Park, NYC</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="attendees"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>45 attendees</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                aria-label="date"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>December 25, 2024</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="Close"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>Central Park, NYC</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="attendees"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>45 attendees</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                aria-label="date"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>December 25, 2024</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="Close"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>Central Park, NYC</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                aria-label="attendees"
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>45 attendees</span>
            </div>
          </div>

          <button
            className="w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
            type="button"
          >
            Join Event
          </button>
        </div>
      </Overlay>
    </MapContainer>
  );
}
