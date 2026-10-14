import useAuthStore from "@/stores/authStore";

// Join an event (add current user as participant)
export async function joinEvent(eventId: string): Promise<{ message: string; success: boolean }> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/events/${eventId}/join`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to join event");
  }

  return parsed;
}

// Leave an event (remove current user as participant)
export async function leaveEvent(eventId: string): Promise<{ message: string; success: boolean }> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/events/${eventId}/join`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to leave event");
  }

  return parsed;
}
