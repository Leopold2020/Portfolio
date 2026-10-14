import { useId } from "react";
import Modal from "@/components/Modal";

// Duplicating this right now since we don't have a clear
// definition of what the profile page should look like
// or where this data comes from
interface ProfileEditorProps {
  user: {
    displayName: string;
    profilePicture: string;
  };
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const modalId = useId();
  return (
    <>
      <button className="rounded border border-gray-300 px-4 py-2" popoverTarget={modalId} type="button">
        Edit Profile
      </button>
      {/* Dialog Element for modal */}
      <Modal id={modalId}>
        <div className="flex min-h-full items-center justify-center">
          <div className="rounded border border-gray-300 bg-gray-100 p-4">
            <form>
              {/* I don't know how to handle editing a profile picture yet */}
              {/*<img alt={user.displayName} src={user.profilePicture} />*/}

              <label>
                <span>Display Name:</span>
                <input defaultValue={user.displayName} name="displayName" type="text" />
              </label>

              {/*Cancel and save button, though only Cancel is implemented yet*/}
              <div className="grid grid-cols-2 gap-2">
                <button popoverTarget={modalId} type="button">
                  Cancel
                </button>
                <button onClick={() => console.log("saved")} popoverTarget="profile-editor-modal" type="button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
