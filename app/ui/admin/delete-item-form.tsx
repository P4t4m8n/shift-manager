"use client";

import { smallButtonClass } from "@/app/ui/styles";

interface DeleteItemFormProps {
  action: () => Promise<void>;
  label: string;
  confirmMessage: string;
  onDone: () => void;
}

export function DeleteItemForm({
  action,
  label,
  confirmMessage,
  onDone,
}: DeleteItemFormProps) {
  return (
    <form
      action={async () => {
        await action();
        onDone();
      }}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
      className="border-t border-gray-200 pt-3"
    >
      <button type="submit" className={smallButtonClass}>
        {label}
      </button>
    </form>
  );
}
