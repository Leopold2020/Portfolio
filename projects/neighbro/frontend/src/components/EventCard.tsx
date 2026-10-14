import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchUserById } from "@/api/users";
import ProfileImage from "@/components/ProfileImage";
import ShadyBorder from "@/components/ShadyBorder";
import useAuthStore from "@/stores/authStore";
import type { AppEvent } from "@/types/event";
import { formatDistanceAway, formatEventTime } from "@/utils/formatters";

interface EventCardProps {
  event: AppEvent;
  userLocation: { lat: number; lon: number };
}

export function EventCard({ event, userLocation }: EventCardProps) {
  const token = useAuthStore.getState().token;

  const { data: user } = useQuery({
    enabled: !!token && !!event.ownerId,
    queryFn: () => {
      if (!token) {
        throw new Error("Authentication required");
      }
      return fetchUserById(event.ownerId, token);
    },
    queryKey: ["user", event.ownerId],
    retry: 1,
  });

  return (
    <ShadyBorder overlayClassname="border-6 rounded-4xl ">
      <div className="rounded-4xl bg-linear-to-r from-[#f525d2] to-[#fa3737] shadow-md">
        <ShadyBorder overlayClassname="rounded-[30px] border-6 -bottom-1.5 top-0">
          <div className="grid grid-cols-[3fr_1fr] rounded-4xl bg-white p-4">
            <div className="min-w-0">
              <h1 className="truncate font-bold text-2xl">
                {event.name ? event.name.charAt(0).toUpperCase() + event.name.slice(1) : ""}
              </h1>
              <p className="font-medium text-xl">
                {formatDistanceAway(userLocation, { lat: event.latitude, lon: event.longitude })}{" "}
              </p>
              <p className="truncate text-sm">
                Address: <span className="italic underline">{event.address}</span>
              </p>
              <p className="text-sm">{formatEventTime(event.startTime)}</p>
            </div>
            <div className="flex flex-col align-center">
              <ProfileImage
                avatarId={user?.avatarId === null ? undefined : user?.avatarId}
                className="mx-auto"
                ownerName={user?.username ?? "User"}
                size={70}
              />
              <p className="my-0 py-0 text-center text-sm italic">Host:</p>
              <p className="my-0 whitespace-nowrap py-0 text-center text-sm">{user?.displayName}</p>
            </div>
          </div>
        </ShadyBorder>
        <Link className="flex w-full items-center justify-center gap-3 py-3 text-white" to={`/map?eventId=${event.id}`}>
          <img alt="info-icon" className="text-white" src="/info.svg" /> View event details
        </Link>
      </div>
    </ShadyBorder>
  );
}
