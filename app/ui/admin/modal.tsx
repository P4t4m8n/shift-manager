"use client";

import { useEffect, useRef } from "react";

// Native <dialog>: gives focus trapping, Esc to close and a backdrop for free.
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded border border-gray-300 bg-background p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
