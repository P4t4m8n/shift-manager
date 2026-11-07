"use client";

import { useActionState, useEffect } from "react";
import { createBlocks } from "@/app/actions/blocks";
import { BlockFields } from "@/app/ui/admin/block-fields";
import { RepeatWeeksField } from "@/app/ui/admin/schedule-fields";
import { FormFooter } from "@/app/ui/admin/shift-fields";
import type { LocalDate } from "@/lib/types";

interface CreateBlockFormProps {
  date: LocalDate;
  startTime?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function CreateBlockForm({
  date,
  startTime,
  onDone,
  onCancel,
}: CreateBlockFormProps) {
  const [state, action, pending] = useActionState(createBlocks, {});

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        משמרות שמתחילות בטווח הזה יהיו סגורות להרשמה.
      </p>
      <BlockFields
        values={state.values}
        defaults={{ startDate: date, endDate: date, startTime }}
      />
      <RepeatWeeksField value={state.values?.repeatWeeks} />
      <FormFooter
        state={state}
        pending={pending}
        submitLabel="יצירת חסימה"
        onCancel={onCancel}
      />
    </form>
  );
}
