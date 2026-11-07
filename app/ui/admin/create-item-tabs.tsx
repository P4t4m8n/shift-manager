"use client";

import { useState } from "react";
import { CreateBlockForm } from "@/app/ui/admin/create-block-form";
import { CreateEventForm } from "@/app/ui/admin/create-event-form";
import { CreateShiftsForm } from "@/app/ui/admin/create-shifts-form";
import type { LocalDate } from "@/lib/types";

const ITEM_KINDS = [
  { kind: "shift", label: "משמרת" },
  { kind: "block", label: "חסימה" },
  { kind: "event", label: "אירוע" },
] as const;

type ItemKind = (typeof ITEM_KINDS)[number]["kind"];

interface CreateItemTabsProps {
  date: LocalDate;
  startTime?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function CreateItemTabs({
  date,
  startTime,
  onDone,
  onCancel,
}: CreateItemTabsProps) {
  const [kind, setKind] = useState<ItemKind>("shift");
  const formProps = { date, startTime, onDone, onCancel };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex overflow-hidden rounded border border-gray-300 text-sm">
        {ITEM_KINDS.map((option) => (
          <button
            key={option.kind}
            type="button"
            aria-pressed={option.kind === kind}
            onClick={() => setKind(option.kind)}
            className={`flex-1 px-3 py-1 ${option.kind === kind ? "bg-foreground text-background" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {kind === "shift" && <CreateShiftsForm {...formProps} />}
      {kind === "block" && <CreateBlockForm {...formProps} />}
      {kind === "event" && <CreateEventForm {...formProps} />}
    </div>
  );
}
