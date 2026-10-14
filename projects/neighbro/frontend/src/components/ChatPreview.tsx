import ChatPreviewMessage from "./ChatPreviewMessage";

type message = React.ComponentProps<typeof ChatPreviewMessage>["message"];
export default function ChatPreview({
  messages,
  title,
  highlighted,
}: {
  messages: message[];
  title: string;
  highlighted?: boolean;
}) {
  const [message1, message2, ...rest] = messages;

  const highlightedClass = highlighted
    ? "border-4 border-transparent bg-neighbro-radial-white py-3.75 rounded-4xl"
    : "bg-white py-2.5 rounded-full";
  return (
    <div className={`grid gap-2.5 rounded-4xl px-5 shadow ${highlightedClass}`}>
      <div className="grid gap-1.25">
        {message1 && <ChatPreviewMessage message={message1} title={title} />}
        {message2 && (
          <>
            <div className="border-b border-b-black/30" />
            <ChatPreviewMessage message={message2} />
            <div className="border-b border-b-black/30" />
          </>
        )}
      </div>
      {rest.length > 0 && (
        <div className="flex items-center justify-center gap-1.25">
          {/*Chat icon svg*/}
          <svg fill="none" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg">
            <title>chat icon</title>
            <g clip-path="url(#clip0_1212_927)">
              <path
                d="M7.50058 0.260651C3.36509 0.260651 0 2.91692 0 6.18147C0 8.02421 1.07671 9.73475 2.95349 10.8741C3.24473 11.0503 3.44489 11.3429 3.5052 11.6772C3.6903 12.7099 3.44142 13.7978 3.07024 14.7393C4.3085 14.1514 5.58447 13.2486 6.59726 12.3818C6.84692 12.1685 7.18006 12.0792 7.50393 12.1015H7.50541C11.6368 12.1015 15 9.44602 15 6.18109C15 2.91692 11.6361 0.260651 7.50058 0.260651Z"
                fill="black"
                fillOpacity="0.9"
              />
            </g>
            <defs>
              <clipPath id="clip0_1212_927">
                <rect fill="white" height="15" width="15" />
              </clipPath>
            </defs>
          </svg>

          <p className="font-bold text-sm">{rest.length} more messages!</p>
        </div>
      )}
    </div>
  );
}
