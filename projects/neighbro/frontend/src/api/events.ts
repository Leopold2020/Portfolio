import useAuthStore from "@/stores/authStore";
import type { AppEvent, EventQueryParams, FormattedEvent, GetEventsResponse, PartialEvent } from "@/types/event";

// Currently querying only by position or nothing
export async function getEvents(params: EventQueryParams): Promise<AppEvent[]> {
  const token = useAuthStore.getState().token;
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const response = await fetch(`/api/events?${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: GetEventsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch events");
  }

  return data.result;
}

export async function fetchEventById(id: string): Promise<AppEvent> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to fetch event");
  }
  return parsed.event;
}

export async function createEvent(event: Omit<AppEvent, "id" | "ownerId">): Promise<AppEvent> {
  const token = useAuthStore.getState().token;

  const formattedEvent = {
    ...event,
    categories: event.categories.length >= 1 ? event.categories.join(",") : undefined,
  };
  const response = await fetch("/api/events/", {
    body: JSON.stringify(formattedEvent),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to create event");
  }
  return parsed;
}

export async function replaceEvent(event: Omit<AppEvent, "ownerId">): Promise<AppEvent> {
  const token = useAuthStore.getState().token;

  const formattedEvent = { ...event, category: event.categories.join(",") };
  const response = await fetch(`/api/events/${event.id}`, {
    body: JSON.stringify(formattedEvent),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to replace event");
  }
  return parsed;
}

export async function updateEvent(eventId: string, event: PartialEvent): Promise<AppEvent> {
  const token = useAuthStore.getState().token;

  let formattedEvent: FormattedEvent;

  if (event.categories) {
    formattedEvent = {
      ...event,
      category: event.categories.join(","),
    };
  } else {
    formattedEvent = event as FormattedEvent;
  }
  const response = await fetch(`/api/events/${eventId}`, {
    body: JSON.stringify(formattedEvent),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to update event");
  }
  return parsed;
}

export async function deleteEvent(eventId: string): Promise<string> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to delete event");
  }
  return parsed.message;
}
