import ProfilePicture from "./ProfilePicture";

export default function ChatPreviewMessage({
  message,
  title,
}: {
  message: { avatar: string; text: string; timestamp: string; displayName: string; username: string };
  title?: string;
}) {
  const avatarSize = title ? "size-15.75" : "size-10";
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-2">
      <ProfilePicture alt={message.displayName} className={`shadow ${avatarSize}`} imageUrl={message.avatar} />
      <div className="grid">
        {title && <h3 className="font-medium text-2xl">{title}</h3>}
        <div className="block-full grid grid-cols-[auto_1fr] items-center gap-2">
          <div>
            <p className="text-sm">{message.displayName}</p>
            <p className="text-black/70 text-xs">@{message.username}</p>
            <p className="text-black/70 text-xs">{message.timestamp}</p>
          </div>
          <p className="text-black/80 text-xs">{message.text}</p>
        </div>
      </div>
    </div>
  );
}
