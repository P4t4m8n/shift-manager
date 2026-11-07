"use client";

import { useState, useTransition } from "react";
import { leaveShift, signUpForShift } from "@/app/actions/signup";
import { buttonClass, smallButtonClass } from "@/app/ui/styles";
import type { CalendarShift, FormState } from "@/lib/interfaces";
import { formatFullDate, weekdayName } from "@/lib/time";

interface ShiftDialogContentProps {
  shift: CalendarShift;
  onDone: () => void;
  onClose: () => void;
}

export function ShiftDialogContent({
  shift,
  onDone,
  onClose,
}: ShiftDialogContentProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  const run = (action: (shiftId: string) => Promise<FormState>) => {
    setMessage(undefined);
    startTransition(async () => {
      const result = await action(shift.id);
      if (result.success) onDone();
      else setMessage(result.message);
    });
  };

  const workers = shift.workers ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-bold">
          {weekdayName(shift.date)} {formatFullDate(shift.date)}
        </span>
        <span dir="ltr" className="self-start">
          {shift.startTime}–{shift.endTime}
        </span>
        {shift.label && <span>{shift.label}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">רשומים ({workers.length})</span>
        {workers.length === 0 ? (
          <span className="text-sm">אין רשומים עדיין</span>
        ) : (
          <ul className="flex flex-col gap-0.5 text-sm">
            {workers.map((name, index) => (
              <li key={`${name}-${index}`}>{name}</li>
            ))}
          </ul>
        )}
      </div>

      {shift.signedUp ? (
        <p className="text-sm">נרשמת למשמרת זו.</p>
      ) : (
        shift.blockedReason && (
          <p className="text-sm text-red-600">{shift.blockedReason}</p>
        )
      )}
      {message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {shift.signedUp ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(leaveShift)}
            className={smallButtonClass}
          >
            {pending ? "מבטל..." : "ביטול הרשמה"}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending || !!shift.blockedReason}
            onClick={() => run(signUpForShift)}
            className={buttonClass}
          >
            {pending ? "נרשם..." : "הרשמה"}
          </button>
        )}
        <button type="button" onClick={onClose} className="text-sm underline">
          סגירה
        </button>
      </div>
    </div>
  );
}
