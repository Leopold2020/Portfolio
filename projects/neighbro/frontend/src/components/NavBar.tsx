import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchMe } from "@/api/me";
import useAuthStore from "@/stores/authStore";

export default function NavBar() {
  const token = useAuthStore((state) => state.token);

  const { data: user } = useQuery({
    enabled: !!token && typeof token === "string",
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return fetchMe(token);
    },
    queryKey: ["user", "me"],
  });

  let profileImg: string;
  if (user?.avatarId) {
    profileImg = `/avatars/${user.avatarId}.jpg`;
  } else {
    profileImg = "/assets/navbar/profile.svg";
  }

  const navItems = [
    {
      alt: "Discover events and friends nearby",
      icon: "/assets/navbar/discovery.svg",
      label: "Discover",
      to: "/map",
      type: "regular" as const,
    },
    {
      alt: "View your messages and conversations",
      icon: "/assets/navbar/chat.svg",
      label: "Chat",
      to: "/chat",
      type: "regular" as const,
    },
    {
      alt: "Create a new event",
      icon: "/assets/navbar/create-event.svg",
      label: "Create",
      to: "/create-event",
      type: "special" as const,
    },
    {
      alt: "View your upcoming events",
      icon: "/assets/navbar/event.svg",
      label: "Events",
      to: "/events",
      type: "regular" as const,
    },
    {
      alt: "View and edit your profile",
      icon: profileImg,
      label: "Profile",
      to: `/profile/${user?.id}`,
      type: "image" as const,
    },
  ];

  const renderIcon = (item: (typeof navItems)[0]) => {
    switch (item.type) {
      case "special":
        return (
          <img
            alt={item.alt}
            className="absolute -top-2/5 size-22 drop-shadow-lg transition-transform hover:scale-105"
            src={item.icon}
          />
        );
      case "image":
        return <img alt={item.alt} className="size-8 rounded-full object-cover" src={item.icon} />;
      default:
        return <img alt={item.alt} className="size-8" src={item.icon} />;
    }
  };

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-1100 grid justify-items-center p-3">
      <div className="max-inline-md inline-full grid min-h-21 grid-cols-5 rounded-3xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        {navItems.map((item) => (
          <Link
            activeProps={{ className: "text-blue-600 font-bold border-blue-600" }}
            className="grid items-end justify-items-center gap-1 text-gray-600 hover:text-gray-900"
            key={item.label}
            to={item.to}
          >
            {renderIcon(item)}
            <p className="text-xs">{item.label}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
