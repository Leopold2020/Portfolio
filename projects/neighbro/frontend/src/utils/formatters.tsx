import { differenceInDays, format, isToday, isTomorrow } from "date-fns";

export function formatEventTime(startTime: Date): string {
  const timeString = format(startTime, "HH:mm");

  let dayText = "";
  if (isToday(startTime)) {
    dayText = "today";
  } else if (isTomorrow(startTime)) {
    dayText = "tomorrow";
  } else {
    const daysDiff = differenceInDays(startTime, new Date());
    if (daysDiff <= 7 && daysDiff > 0) {
      // Within next week
      dayText = `this ${format(startTime, "EEEE")}`;
    } else {
      // Further out
      dayText = `on ${format(startTime, "MMM d")}`;
    }
  }

  return `Starts at ${timeString} ${dayText}`;
}

interface Location {
  lat: number;
  lon: number;
}

/**
 * Format distance from user to event
 * @param eventLocation - Event's coordinates
 * @param userLocation - User's coordinates (optional)
 * @returns Formatted distance string or null
 *
 * @example
 * formatDistanceAway(
 *   { lat: 40.7128, lon: -74.0060 },
 *   { lat: 40.7580, lon: -73.9855 }
 * ) // returns "5.2 km away"
 */
export function formatDistanceAway(eventLocation: Location, userLocation?: Location): string | null {
  if (!userLocation) {
    return null;
  }

  // Haversine formula
  const R = 6371;
  const toRadians = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRadians(userLocation.lat - eventLocation.lat);
  const dLon = toRadians(userLocation.lon - eventLocation.lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(eventLocation.lat)) * Math.cos(toRadians(userLocation.lat)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // Format
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
