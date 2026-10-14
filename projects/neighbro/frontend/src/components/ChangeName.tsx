import { useState } from "react";
import Button from "./Button";

interface SelectModalProps {
  ChangeNameIsOpen: boolean;
  onClose: () => void;
  changeName: (value: string) => void;
  name: string;
}

export default function ChangeName({ ChangeNameIsOpen, onClose, changeName, name }: SelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!ChangeNameIsOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
      <div className="w-xs max-w-full rounded-lg bg-white p-6 shadow-lg">
        <input
          defaultValue={name}
          onChange={(event) => {
            setSelected(event.target.value);
          }}
          type="text"
        />

        <div className="mt-4 flex justify-end space-x-2">
          <Button className="w-auto px-6 py-2 text-base" onClick={onClose} type="reset" variant="primary">
            Cancel
          </Button>
          <Button
            className="w-auto px-6 py-2 text-base disabled:opacity-50"
            disabled={!selected}
            onClick={() => selected && changeName(selected)}
            type="submit"
            variant="secondary"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
