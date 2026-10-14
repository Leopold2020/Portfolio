import { createFileRoute } from "@tanstack/react-router";
import { MapView } from "@/components/map/MapView";

export const Route = createFileRoute("/(app)/map")({
  component: MapPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      eventId: search["eventId"] as string | undefined,
    };
  },
});

function MapPage() {
  const { eventId } = Route.useSearch();

  return (
    <div className="fixed inset-0">
      <MapView eventId={eventId} />
    </div>
  );
}
