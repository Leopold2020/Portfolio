import { createFileRoute } from "@tanstack/react-router";
import ChatPreviewList from "@/components/ChatPreviewList";

export const Route = createFileRoute("/(app)/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const demoMessagesActiveEvents = [
    {
      highlighted: true,
      messages: [
        {
          avatar: "/assets/fake-users/tom.png",
          displayName: "Tom",
          text: "Can someone go and grab some plastic cups from ICA?",
          timestamp: "19:32",
          username: "tomtom",
        },

        {
          avatar: "/assets/fake-users/kim.png",
          displayName: "Kim",
          text: "Ey we need some cups!",
          timestamp: "19:28",
          username: "kpossible",
        },

        {
          avatar: "/assets/fake-users/sandra.png",
          displayName: "Hidden",
          text: "I'm not gonna show up in preview",
          timestamp: "33:33",
          username: "hidden",
        },
      ],
      title: "Pizza party",
    },
    {
      messages: [
        {
          avatar: "/assets/fake-users/sandra.png",
          displayName: "Sandra",
          text: "someone forgot their scarf",
          timestamp: "17:59",
          username: "samsam",
        },
      ],
      title: "Bowling night",
    },
  ];

  const demoMessagesPastEvents = [
    {
      highlighted: false,
      messages: [
        {
          avatar: "/assets/fake-users/kim.png",
          displayName: "Kim",
          text: "Nice meeting y’all! gn",
          timestamp: "Sunday",
          username: "kpossible",
        },
      ],
      title: "Movie marathon",
    },
  ];

  return (
    <div className="grid content-start justify-center gap-2.5">
      <h2 className="text-center font-bold text-4xl">Active events</h2>
      <ChatPreviewList events={demoMessagesActiveEvents} />
      <h2 className="text-center font-bold text-4xl">Past events</h2>
      <ChatPreviewList events={demoMessagesPastEvents} />
    </div>
  );
}
