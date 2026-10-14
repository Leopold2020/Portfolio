export interface Category {
  name: string;
  slug: string;
  description: string | null;
}

export interface EventFieldsToUpdate {
  address?: string | null;
  description?: string | null;
  endTime?: Date;
  latitude?: number;
  longitude?: number;
  name?: string;
  startTime?: Date;
}
