import { useEffect, useLayoutEffect, useRef } from "react";

interface ModalProps {
  id: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Modal({ id, children, isOpen, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !onClose) return;
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || isOpen === undefined) return;
    try {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    } catch {
      // To not crash
    }
  }, [isOpen]);

  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current.close();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") dialogRef.current?.close();
  }

  return (
    <dialog
      className="m-auto overflow-hidden rounded-xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/50"
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={dialogRef}
    >
      {children}
    </dialog>
  );
}
