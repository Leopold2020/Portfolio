import { useEffect, useState } from "react";
import { EventCarousel } from "@/components/Carousel";
import { EventCard } from "@/components/EventCard";
import ShadyBorder from "@/components/ShadyBorder";
import type { AppEvent } from "@/types/event";

interface EventsPageProps {
  ownEvents: AppEvent[];
  attendingEvents: AppEvent[];
}

export function EventsPage({ ownEvents, attendingEvents }: EventsPageProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location_geo = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        setUserLocation(location_geo);
      },
      (error) => {
        console.error("geolocation error", error);
        setUserLocation({ lat: 0, lon: 0 });
      },
    );
  }, []);

  return (
    <div className="max-w-s rounded-2xl p-3">
      <div className="space-y-8">
        <div>
          <h2 className="mb-4 flex items-center justify-center gap-2 text-center font-bold text-2xl">
            {" "}
            <ShadyBorder overlayClassname="rounded-full border-3" size={32}>
              <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-r from-[#f525d2] to-[#fa3737]">
                <span className="font-bold text-sm text-white">{ownEvents.length}</span>
              </div>
            </ShadyBorder>
            Your Events
          </h2>
          <EventCarousel
            events={ownEvents}
            renderEventCard={(event) => <EventCard event={event} userLocation={userLocation} />}
          />
        </div>

        <div>
          <h2 className="mb-4 text-center font-bold text-2xl">Participating</h2>
          <EventCarousel
            events={attendingEvents}
            renderEventCard={(event) => <EventCard event={event} userLocation={userLocation} />}
          />
        </div>
      </div>
    </div>
  );
}
