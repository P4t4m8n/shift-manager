import Link from "next/link";
import {
  CALENDAR_VIEWS,
  VIEW_LABEL,
  calendarHref,
  stepDate,
  type CalendarView,
} from "@/lib/calendar";
import {
  formatDayMonth,
  formatFullDate,
  monthTitle,
  startOfWeek,
  addDays,
  weekdayName,
} from "@/lib/time";
import type { LocalDate } from "@/lib/types";

function title(view: CalendarView, date: LocalDate) {
  if (view === "month") return monthTitle(date);
  if (view === "week") {
    const start = startOfWeek(date);
    return `${formatDayMonth(start)} – ${formatDayMonth(addDays(start, 6))}`;
  }
  return `${weekdayName(date)} ${formatFullDate(date)}`;
}

const linkClass = "rounded border border-gray-300 px-2 py-1 text-sm";

export function CalendarToolbar({
  basePath,
  view,
  date,
  today,
  actions,
}: {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Link
          href={calendarHref(basePath, view, stepDate(view, date, -1))}
          className={linkClass}
          aria-label="הקודם"
        >
          →
        </Link>
        <Link
          href={calendarHref(basePath, view, stepDate(view, date, 1))}
          className={linkClass}
          aria-label="הבא"
        >
          ←
        </Link>
        <Link href={calendarHref(basePath, view, today)} className={linkClass}>
          היום
        </Link>
      </div>

      <h2 className="text-lg font-bold">{title(view, date)}</h2>

      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded border border-gray-300 text-sm">
          {CALENDAR_VIEWS.map((option) => (
            <Link
              key={option}
              href={calendarHref(basePath, option, date)}
              aria-current={option === view ? "page" : undefined}
              className={`px-3 py-1 ${option === view ? "bg-foreground text-background" : ""}`}
            >
              {VIEW_LABEL[option]}
            </Link>
          ))}
        </div>
        {actions}
      </div>
    </div>
  );
}
