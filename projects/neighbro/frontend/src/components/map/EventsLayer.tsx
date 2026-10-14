import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/api/events";
import { Pin } from "./pins/Pin";

type Props = {
  center: { lat: number; lng: number };
  radiusKm: number;
};

export function EventsLayer({ center, radiusKm }: Props) {
  const {
    data: events = [],
    isPending,
    isError,
  } = useQuery({
    queryFn: () =>
      getEvents({ latitude: center.lat.toString(), longitude: center.lng.toString(), radius: radiusKm.toString() }),
    queryKey: ["events", center.lat, center.lng, radiusKm],
  });

  if (isPending) return <div>loading events...</div>;
  if (isError) return <div>error to load events</div>;

  return (
    <>
      {events.map((e) => (
        <Pin key={e.id} position={{ lat: e.latitude, lng: e.longitude }} type="event" />
      ))}
    </>
  );
}
