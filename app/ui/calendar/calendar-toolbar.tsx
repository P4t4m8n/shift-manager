import Link from "next/link";
import { calendarHref, stepDate } from "@/lib/calendar";
import {
  formatDayMonth,
  formatFullDate,
  monthTitle,
  startOfWeek,
  addDays,
  weekdayName,
} from "@/lib/time";
import { CALENDAR_VIEWS, VIEW_LABEL } from "@/lib/consts/calendar.const";

import type { CalendarView } from "@/lib/types/calendar.type";
import type { LocalDate } from "@/lib/types";

const title = (view: CalendarView, date: LocalDate) => {
  if (view === "month") return monthTitle(date);
  if (view === "week") {
    const start = startOfWeek(date);
    return `${formatDayMonth(start)} – ${formatDayMonth(addDays(start, 6))}`;
  }
  return `${weekdayName(date)} ${formatFullDate(date)}`;
};

const linkClass = "rounded border border-gray-300 px-2 py-1 text-sm";

interface CalendarToolbarProps {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  actions?: React.ReactNode;
}

export const CalendarToolbar = ({
  basePath,
  view,
  date,
  today,
  actions,
}: CalendarToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <CalendarToolbarNav
        basePath={basePath}
        view={view}
        date={date}
        today={today}
      />

      <h2 className="text-lg font-bold">{title(view, date)}</h2>

      <CalendarToolbarActions
        basePath={basePath}
        view={view}
        date={date}
        actions={actions}
      />
    </div>
  );
};

interface CalendarToolbarNavProps {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
}

const CalendarToolbarNav = ({
  basePath,
  view,
  date,
  today,
}: CalendarToolbarNavProps) => {
  const links = [
    {
      label: "הקודם",
      href: calendarHref(basePath, view, stepDate(view, date, -1)),
    },
    {
      label: "הבא",
      href: calendarHref(basePath, view, stepDate(view, date, 1)),
    },
    {
      label: "היום",
      href: calendarHref(basePath, view, today),
    },
  ];
  return (
    <nav className="flex items-center gap-2">
      {links.map((link) => (
        <Link key={link.label} href={link.href} className={linkClass}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

interface CalendarToolbarActionsProps {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  actions?: React.ReactNode;
}

const CalendarToolbarActions = ({
  basePath,
  view,
  date,
  actions,
}: CalendarToolbarActionsProps) => {
  return (
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
  );
};
