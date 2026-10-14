import { createFileRoute } from "@tanstack/react-router";
import { getEvents } from "@/api/events";
import { EventsPage } from "@/components/EventsPage";
import type { AppEvent } from "@/types/event";

export const Route = createFileRoute("/(app)/events")({
  component: RouteComponent,
  // TODO: Need to expand on this later, maybe a generic error component
  errorComponent: ({ error, reset }) => {
    return (
      <div className="grid justify-items-center">
        {error.message}
        <button
          className="border"
          onClick={() => {
            // Reset the router error boundary
            reset();
          }}
          type="button"
        >
          retry
        </button>
      </div>
    );
  },
  loader: async () => {
    // Fetch both sets of events in parallel
    const [ownEvents, attendingEvents] = await Promise.all([
      getEvents({ owned: "true" }), // TODO: add actual filters when implemented
      getEvents({ attending: "true" }), // TODO: add actual filters when implemented
    ]);

    return {
      attendingEvents,
      ownEvents,
    };
  },
  onError: (error) => console.error(error),
  // TODO: replace with a skeleton of events
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  // TanStack Router issue: useLoaderData() returns unknown until routeTree.gen.ts resolves this route's types
  const { ownEvents, attendingEvents } = Route.useLoaderData() as {
    ownEvents: AppEvent[];
    attendingEvents: AppEvent[];
  };
  return <EventsPage attendingEvents={attendingEvents} ownEvents={ownEvents} />;
}
