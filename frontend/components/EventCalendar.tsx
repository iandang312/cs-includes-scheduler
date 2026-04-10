"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  rsvpStatus: "going" | "not_going" | null;
};

type EventCalendarProps = {
  events: CalendarEvent[];
  role: "admin" | "mentor" | "mentee";
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
}

function endOfWeek(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - date.getDay()));
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startLabel = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endLabel = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateLabel} • ${startLabel} - ${endLabel}`;
}

export function EventCalendar({ events, role }: EventCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => today);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    const sortedEvents = [...events].sort(
      (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    );

    for (const event of sortedEvents) {
      const key = dateKey(new Date(event.startAt));
      const current = grouped.get(key) ?? [];
      current.push(event);
      grouped.set(key, current);
    }

    return grouped;
  }, [events]);

  const monthDays = useMemo(() => {
    const firstVisibleDay = startOfWeek(startOfMonth(visibleMonth));
    const lastVisibleDay = endOfWeek(endOfMonth(visibleMonth));
    const days: Date[] = [];

    for (
      let current = firstVisibleDay;
      current <= lastVisibleDay;
      current = addDays(current, 1)
    ) {
      days.push(current);
    }

    return days;
  }, [visibleMonth]);

  const selectedEvents = eventsByDay.get(dateKey(selectedDate)) ?? [];

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.9fr)_minmax(20rem,0.85fr)]">
      <div className="app-panel-strong overflow-hidden rounded-[1.75rem]">
        <div className="flex flex-col gap-4 border-b px-5 py-5 app-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Month View</div>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--ou-ink)]">
              {visibleMonth.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="app-button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="app-button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
              onClick={() => {
                setVisibleMonth(startOfMonth(today));
                setSelectedDate(today);
              }}
              type="button"
            >
              Today
            </button>
            <button
              className="app-button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b app-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="border-r px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] app-text-muted last:border-r-0 app-border"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthDays.map((day) => {
            const key = dateKey(day);
            const dayEvents = eventsByDay.get(key) ?? [];
            const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={key}
                className={`min-h-44 overflow-hidden border-r border-b px-2 py-2 text-left align-top transition last:border-r-0 app-border ${
                  isSelected ? "bg-[rgba(152,43,47,0.09)]" : "bg-transparent hover:bg-white/50"
                }`}
                onClick={() => setSelectedDate(day)}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? "bg-[color:var(--ou-red)] text-white"
                        : isCurrentMonth
                          ? "text-[color:var(--ou-ink)]"
                          : "text-[color:var(--ou-muted)]"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="text-[11px] font-semibold app-text-muted">{dayEvents.length}</span>
                  ) : null}
                </div>

                <div className="mt-2 grid gap-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`min-w-0 rounded-xl px-2 py-1 text-xs font-medium ${
                        event.rsvpStatus === "going"
                          ? "app-badge-going"
                          : event.rsvpStatus === "not_going"
                            ? "app-badge-muted"
                            : "app-badge-strong"
                      }`}
                    >
                      <div className="truncate whitespace-nowrap">
                        {new Date(event.startAt).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        {event.title}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <div className="px-1 text-[11px] font-semibold app-text-muted">
                      +{dayEvents.length - 3} more
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-panel rounded-[1.75rem] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Selected Day</div>
        <h3 className="mt-2 text-xl font-semibold text-[color:var(--ou-ink)]">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <p className="mt-2 text-sm app-text-muted">
          {selectedEvents.length === 0
            ? "No sessions scheduled for this day."
            : role === "mentee"
              ? "Open a session to review details and update your RSVP."
              : "Open a session to review details, attendees, or make changes."}
        </p>

        <div className="mt-5 grid gap-3">
          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl border bg-white/45 px-4 py-5 text-sm app-text-muted app-border">
              Nothing on the calendar here yet.
            </div>
          ) : (
            selectedEvents.map((event) => (
              <Link
                key={event.id}
                className="app-panel-strong rounded-[1.25rem] px-4 py-4 transition hover:-translate-y-0.5"
                href={`/events/${encodeURIComponent(event.id)}`}
              >
                <div className="text-base font-semibold text-[color:var(--ou-ink)]">{event.title}</div>
                <div className="mt-1 text-sm app-text-muted">{formatTimeRange(event.startAt, event.endAt)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.rsvpStatus ? (
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        event.rsvpStatus === "going" ? "app-badge-going" : "app-badge-muted"
                      }`}
                    >
                      {event.rsvpStatus === "going" ? "Going" : "Not going"}
                    </span>
                  ) : (
                    <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold">
                      {role === "mentee" ? "No RSVP" : "Your event"}
                    </span>
                  )}
                  {event.location ? (
                    <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold">
                      {event.location}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
