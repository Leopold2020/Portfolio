import ChatPreview from "@/components/ChatPreview";

type EventList = {
  title: string;
  messages: React.ComponentProps<typeof ChatPreview>["messages"];
  highlighted?: boolean;
};
export default function ChatPreviewList({ events }: { events: EventList[] }) {
  return (
    <div className="grid content-start gap-2.5">
      {events.map((event) => (
        <ChatPreview
          highlighted={event.highlighted ?? false}
          key={event.title}
          messages={event.messages}
          title={event.title}
        />
      ))}
    </div>
  );
}
