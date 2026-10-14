import type { GetEventCategoriesResponse } from "../types/event";

export const fetchCategories = async (token: string) => {
  const response = await fetch("/api/event-categories", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data as GetEventCategoriesResponse;
};
