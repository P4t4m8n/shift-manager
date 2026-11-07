"use client";

import { useActionState, useEffect } from "react";
import { deleteBlock, updateBlock } from "@/app/actions/blocks";
import { BlockFields } from "@/app/ui/admin/block-fields";
import { DeleteItemForm } from "@/app/ui/admin/delete-item-form";
import { FormFooter } from "@/app/ui/admin/shift-fields";
import type { CalendarBlock } from "@/lib/interfaces";

interface EditBlockFormProps {
  block: CalendarBlock;
  onDone: () => void;
  onCancel: () => void;
}

export function EditBlockForm({ block, onDone, onCancel }: EditBlockFormProps) {
  const [state, action, pending] = useActionState(
    updateBlock.bind(null, block.id),
    {},
  );

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <BlockFields
          values={state.values}
          defaults={{
            startDate: block.startAt.slice(0, 10),
            startTime: block.startAt.slice(11),
            endDate: block.endAt.slice(0, 10),
            endTime: block.endAt.slice(11),
            reason: block.reason ?? "",
          }}
        />
        <FormFooter
          state={state}
          pending={pending}
          submitLabel="שמירה"
          onCancel={onCancel}
        />
      </form>

      <DeleteItemForm
        action={deleteBlock.bind(null, block.id)}
        label="מחיקת החסימה"
        confirmMessage="למחוק את החסימה?"
        onDone={onDone}
      />
    </div>
  );
}
