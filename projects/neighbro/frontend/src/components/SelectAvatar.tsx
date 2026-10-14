import { useState } from "react";
import { CancelButton } from "@/components/CancelButton";
import { CreateButton } from "@/components/CreateButton";

interface SelectModalProps {
  AvatarChangeIsOpen: boolean;
  onClose: () => void;
  updateImage: (value: number) => void;
}

const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export default function SelectAvatar({ AvatarChangeIsOpen, onClose, updateImage }: SelectModalProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!AvatarChangeIsOpen) return null;

  return (
    <div className="fixed inset-0 z-[6969] flex flex-col" data-avatar-picker="">
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto">
        <div className="w-full max-w-md px-6 pt-6 pb-4">
          <h1 className="mb-6 text-center font-extrabold text-3xl text-black">
            Change profile
            <br />
            picture
          </h1>

          <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-5">
            {options.map((option) => (
              <button
                className={`relative h-[160px] w-[160px] rounded-full transition-all duration-200 ${
                  selected === option ? "bg-neighbro-radial-full p-[6px]" : "p-[3px]"
                }`}
                key={option}
                onClick={() => setSelected(option)}
                type="button"
              >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  <img
                    alt={`Profile option ${option}`}
                    className="h-full w-full object-cover"
                    src={`/avatars/${option}.jpg`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 pt-6 pb-10">
        <CancelButton onClick={onClose} type="button">
          Cancel
        </CancelButton>
        <CreateButton disabled={!selected} onClick={() => selected && updateImage(selected)} type="button">
          Update
        </CreateButton>
      </div>
    </div>
  );
}
