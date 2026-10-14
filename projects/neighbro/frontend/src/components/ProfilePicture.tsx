// TODO: add blur border for profile picture
export default function ProfilePicture({
  imageUrl,
  alt,
  className,
}: {
  imageUrl: string;
  alt: string;
  className?: string;
}) {
  return <img alt={alt} className={`aspect-ratio-square rounded-full ${className}`} src={imageUrl} />;
}
