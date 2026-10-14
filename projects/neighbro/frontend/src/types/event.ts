export interface AppEvent {
  description: string | null;
  endTime: Date;
  id: string;
  latitude: number;
  longitude: number;
  name: string | null;
  ownerId: string;
  startTime: Date;
  categories: string[];
  address: string;
}

export interface EventQueryParams {
  description?: string;
  endTime?: string;
  id?: string;
  latitude?: string;
  longitude?: string;
  name?: string;
  ownerId?: string;
  startTime?: string;
  categories?: string;
  address?: string;
  radius?: string;
  attending?: string;
  owned?: string;
}

export type PartialEvent = Partial<AppEvent>;
export type FormattedEvent = Omit<PartialEvent, "categories"> & { category: string };

export interface GetEventsResponse {
  result: AppEvent[];
  success: boolean;
  message: string;
}

export interface EventCategory {
  id: string;
  name: string;
  createdAt: string;
  slug: string;
  description: string;
}

export interface GetEventCategoriesResponse {
  data: EventCategory[];
  success: boolean;
  message: string;
}
