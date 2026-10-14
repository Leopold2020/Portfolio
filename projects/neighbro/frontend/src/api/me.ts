import type { User } from "@/types/backend";

export const fetchMe = async (token: string) => {
  const response = await fetch("/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data.user as User;
};
