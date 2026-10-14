interface ProfileImageProps {
  avatarId: number | undefined;
  ownerName?: string;
  size?: number; // Custom size in pixels
  className?: string;
}

const ProfileImage = ({ avatarId, ownerName, size = 192, className = "" }: ProfileImageProps) => {
  let profileImg: string;
  if (avatarId) {
    profileImg = `/avatars/${avatarId}.jpg`;
  } else {
    profileImg = "/assets/navbar/profile.svg";
  }

  return (
    <div className={`relative rounded-full ${className}`} style={{ height: size, width: size }}>
      <img
        alt={ownerName || "owner profile"}
        className="h-full w-full rounded-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/default-avatar.png";
        }}
        src={profileImg}
      />
      {/* Overlay border */}
      <div className="pointer-events-none absolute inset-0 rounded-full border-5 border-white/50" />
    </div>
  );
};

export default ProfileImage;
