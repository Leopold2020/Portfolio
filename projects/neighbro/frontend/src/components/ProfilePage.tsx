import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { updatebio, updateDisplayName, updateImage, updateUsername } from "@/api/users";
import ChangeName from "@/components/ChangeName";
import SelectAvatar from "@/components/SelectAvatar";
import useAuthStore from "@/stores/authStore";
import Button from "./Button";
import { GradientBorderButton } from "./GradientButton";
import { Input } from "./Input";
import SelectableTag from "./SelectableTag";

const INTERESTS_SELECTED = ["Video games", "Music", "Concerts", "Gym", "Beer", "Bowling"];
const INTERESTS_SUGGESTED = ["Rock", "Baking", "Swimming"];
const SLIDER_TICKS = Array.from({ length: 28 }, (_, i) => ({ id: `tick-${i}`, tall: i % 2 === 0 }));

const LocationIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="currentColor"
    focusable="false"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2a.75.75 0 0 1 .743.648l.007.102v1.788a7.5 7.5 0 0 1 6.713 6.715l.037-.003h1.75a.75.75 0 0 1 .102 1.493l-.102.007-1.788-.001a7.5 7.5 0 0 1-6.715 6.714l.003.037v1.75a.75.75 0 0 1-1.493.102l-.007-.102.001-1.788a7.5 7.5 0 0 1-6.714-6.715l-.037.003H2.75a.75.75 0 0 1-.102-1.493l.102-.007h1.788a7.5 7.5 0 0 1 6.715-6.713L11.25 4.5V2.75A.75.75 0 0 1 12 2m0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12m0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8"
      fillRule="nonzero"
    />
  </svg>
);

interface ProfilePageProps {
  user: {
    avatarId: number | null;
    bio: string | null;
    dateOfBirth?: string;
    displayName: string | null;
    email?: string;
    id: string;
    username: string;
  };
  mode?: "view" | "owner";
}

export function ProfilePage({ user, mode = "view" }: ProfilePageProps) {
  const [biography, setBiography] = useState(user.bio);
  const [avatarChangeIsOpen, setAvatarChangeIsOpen] = useState(false);
  const [changeUsernameIsOpen, setChangeUsernameIsOpen] = useState(false);
  const [changeDisplayNameIsOpen, setChangeDisplayNameIsOpen] = useState(false);
  const router = useRouter();

  const handleAvatarSelect = async (value: number) => {
    const response = await updateImage(value, user.id);
    if (response?.success === true) {
      user.avatarId = value;
    }
    setAvatarChangeIsOpen(false);
  };

  const handleChangeDisplayName = async (value: string) => {
    const response = await updateDisplayName(value, user.id);
    if (response?.success === true) {
      user.displayName = value;
    }
    setChangeDisplayNameIsOpen(false);
  };

  const handleChangeUsername = async (value: string) => {
    const response = await updateUsername(value, user.id);
    if (response?.success === true) {
      user.username = value;
    }
    setChangeUsernameIsOpen(false);
  };

  return (
    <>
      <div className={`flex w-full flex-col items-center gap-4 pt-10 ${avatarChangeIsOpen ? "collapse" : ""}`}>
        {/* Avatar */}
        {mode === "owner" ? (
          <img
            alt={user.displayName ?? ""}
            className="h-40 w-40 cursor-pointer rounded-full object-cover shadow-xl"
            onClick={() => setAvatarChangeIsOpen(true)}
            onKeyDown={() => setAvatarChangeIsOpen(true)}
            src={`/avatars/${user.avatarId}.jpg`}
          />
        ) : (
          <img
            alt={user.displayName ?? ""}
            className="h-40 w-40 rounded-full object-cover shadow-xl"
            src={`/avatars/${user.avatarId}.jpg`}
          />
        )}

        {/* Display name */}
        {mode === "owner" ? (
          <button
            className="flex items-center gap-2 rounded-full bg-black/40 px-5 py-2 text-white shadow-lg backdrop-blur-xs"
            onClick={() => setChangeDisplayNameIsOpen(true)}
            type="button"
          >
            <img alt="" className="h-5 w-5 invert" src="/icons/icon-edit.png" />
            <span className="font-medium text-2xl">{user.displayName}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-black/40 px-5 py-2 text-white shadow-lg backdrop-blur-xs">
            <span className="font-medium text-2xl">{user.displayName}</span>
          </div>
        )}

        {/* Username */}
        {mode === "owner" ? (
          <button
            className="-mt-2 flex items-center gap-2 rounded-full bg-black/40 px-4 py-1 text-white shadow backdrop-blur-xs"
            onClick={() => setChangeUsernameIsOpen(true)}
            type="button"
          >
            <img alt="" className="h-4 w-4 invert" src="/icons/icon-edit.png" />
            <span className="font-medium text-base">{user.username}</span>
          </button>
        ) : (
          <div className="-mt-2 flex items-center gap-2 rounded-full bg-black/40 px-4 py-1 text-white shadow backdrop-blur-xs">
            <span className="font-medium text-base">{user.username}</span>
          </div>
        )}

        {/* Discovery radius */}
        <div className="w-full">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-2xl text-black">Discovery radius</span>
            <span className="font-semibold text-2xl text-black">8 km</span>
          </div>
          <div className="mb-2 flex justify-between px-1 font-medium text-sm">
            <span className="text-pink-500">1 km</span>
            <span className="text-zinc-600">8 km</span>
            <span className="text-zinc-600">15 km</span>
          </div>
          <div className="w-full rounded-full border-4 border-white/40 bg-black/40 px-3 py-2 backdrop-blur-xs">
            <div className="relative flex items-center" style={{ height: "40px" }}>
              <div className="absolute inset-x-0 flex items-center justify-between">
                {SLIDER_TICKS.map((tick) => (
                  <div className={`w-[2px] rounded-full bg-white/80 ${tick.tall ? "h-4" : "h-2"}`} key={tick.id} />
                ))}
              </div>
              <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center">
                <div className="h-10 w-2 rounded-full bg-pink-500 shadow-lg" />
                <div className="mt-1 h-4 w-4 rounded-full border-4 border-pink-300 bg-pink-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Current position */}
        <div className="flex w-full items-center justify-between rounded-full border-4 border-white/40 bg-black/40 px-5 py-3 text-white backdrop-blur-xs">
          <span className="text-[16px]">Current position</span>
          <LocationIcon />
        </div>

        {/* Bio */}
        <h2 className="font-medium text-3xl text-black">Bio</h2>
        {mode === "owner" ? (
          <>
            <textarea
              className="h-32 w-full rounded-4xl border-4 border-white/40 bg-black/40 px-5 py-3 text-[16px] text-white backdrop-blur-xs"
              defaultValue={biography ?? undefined}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Write something about yourself..."
            />
            <Button
              className="w-xs max-w-full"
              onClick={() => updatebio(biography, user.id)}
              type="button"
              variant="secondary"
            >
              Save bio
            </Button>
          </>
        ) : (
          <div className="h-32 w-full rounded-4xl border-4 border-white/40 bg-black/40 px-5 py-3 text-[16px] text-white backdrop-blur-xs">
            <p>{biography}</p>
          </div>
        )}

        {/* Interests */}
        <h2 className="font-medium text-3xl text-black">Interests</h2>
        <div className="flex w-full flex-wrap justify-center gap-3">
          {INTERESTS_SELECTED.map((interest) => (
            <SelectableTag defaultChecked key={interest} text={interest} />
          ))}
          {INTERESTS_SUGGESTED.map((interest) => (
            <SelectableTag key={interest} text={interest} />
          ))}
        </div>

        {/* Email and date of birth (owner only) */}
        {mode === "owner" && (
          <>
            <Input readOnly type="text" value={user.email ?? ""} />
            <Input readOnly type="text" value={user.dateOfBirth ?? ""} />
          </>
        )}

        {/* Action buttons (owner only) */}
        {mode === "owner" && (
          <div className="flex w-full flex-col items-center gap-3 pt-2">
            <GradientBorderButton type="button">Notification preferences</GradientBorderButton>
            <GradientBorderButton type="button">Blocked</GradientBorderButton>
            <Button
              onClick={() => {
                useAuthStore.getState().signOut();
                router.invalidate();
              }}
              type="button"
              variant="secondary"
            >
              Log out
            </Button>
          </div>
        )}

        {/* Legal footer */}
        <div className="mt-4 flex items-center justify-center gap-5 pb-4">
          <a className="border-black border-b text-sm" href="#about">
            About
          </a>
          <a className="border-black border-b text-sm" href="#privacy">
            Privacy
          </a>
        </div>
      </div>

      <SelectAvatar
        AvatarChangeIsOpen={avatarChangeIsOpen}
        onClose={() => setAvatarChangeIsOpen(false)}
        updateImage={handleAvatarSelect}
      />
      <ChangeName
        ChangeNameIsOpen={changeDisplayNameIsOpen}
        changeName={handleChangeDisplayName}
        name={user.displayName || ""}
        onClose={() => setChangeDisplayNameIsOpen(false)}
      />
      <ChangeName
        ChangeNameIsOpen={changeUsernameIsOpen}
        changeName={handleChangeUsername}
        name={user.username}
        onClose={() => setChangeUsernameIsOpen(false)}
      />
    </>
  );
}
