import useAuthStore from "@/stores/authStore";
import type { User } from "@/types/backend";

export async function fetchUserById(userId: string, token: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || "Failed to fetch user");
  }
  return parsed.user as User;
}

type ApiResponse = { success: boolean };

export async function updateImage(newAvatarId: number, userId: string): Promise<ApiResponse | undefined> {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("No auth in localStorage");
    return;
  }

  const response = await fetch(`/api/users/${userId}`, {
    body: JSON.stringify({
      avatarId: newAvatarId,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  console.log(data);
  return data;
}

export async function updatebio(newBio: string | null, userId: string): Promise<void> {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("No auth in localStorage");
    return;
  }

  const response = await fetch(`/api/users/${userId}`, {
    body: JSON.stringify({
      bio: newBio,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to update user data");
  }
  const data = await response.json();
  return data;
}

export async function updateDisplayName(newDisplayName: string, userId: string): Promise<ApiResponse | undefined> {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("No auth in localStorage");
    return;
  }

  console.log(
    JSON.stringify({
      displayName: newDisplayName,
    }),
  );
  console.log(userId);
  const response = await fetch(`/api/users/${userId}`, {
    body: JSON.stringify({
      displayName: newDisplayName,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to update user data");
  }
  const data = await response.json();
  return data;
}

export async function updateUsername(newUsername: string | null, userId: string): Promise<ApiResponse | undefined> {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("No auth in localStorage");
    return;
  }

  const response = await fetch(`/api/users/${userId}`, {
    body: JSON.stringify({
      username: newUsername,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to update user data");
  }
  const data = await response.json();
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn("No auth in localStorage");
    return;
  }

  const response = await fetch(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user data");
  }
  const data = await response.json();
  return data;
}
