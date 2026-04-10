import Link from "next/link";
import { api } from "@/lib/api";
import { LogoutButton } from "@/components/LogoutButton";
import { EventCalendar } from "@/components/EventCalendar";

export default async function DashboardPage() {
  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let events: Awaited<ReturnType<typeof api.events>> = [];
  let myRsvps: Awaited<ReturnType<typeof api.myRsvps>> = [];

  try {
    me = await api.me();
    [events, myRsvps] = await Promise.all([api.events(), api.myRsvps()]);
  } catch {
    // Not signed in yet (or backend not running). We'll show a CTA.
  }

  const rsvpByEventId = new Map(myRsvps.map((rsvp) => [rsvp.eventId, rsvp.status]));
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    rsvpStatus: rsvpByEventId.get(event.id) ?? null,
  }));

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-[92rem]">
        <Header me={me} />

        {!me ? (
          <div className="app-panel mt-8 rounded-[2rem] p-8">
            <h2 className="text-xl font-semibold text-[color:var(--ou-ink)]">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 app-text-muted">
              Your RSVPs are private. We require sign-in to view events and RSVP.
            </p>
            <Link
              className="app-button-primary mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="app-panel rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Calendar</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Session calendar</h2>
                  <p className="mt-2 text-sm app-text-muted">
                    Browse the month, open a day, and jump straight into session details.
                  </p>
                </div>
                {me.role === "mentor" ? (
                  <Link
                    className="app-button-primary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
                    href="/mentor/events/new"
                  >
                    New event
                  </Link>
                ) : null}
              </div>

              <div className="mt-6">
                {calendarEvents.length === 0 ? (
                  <div className="rounded-2xl border app-border bg-white/45 px-4 py-5 text-sm app-text-muted">
                    No events yet.
                  </div>
                ) : (
                  <EventCalendar events={calendarEvents} role={me.role} />
                )}
              </div>
            </section>

            {me.role === "admin" ? (
              <section className="app-panel rounded-[2rem] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Admin</div>
                <h2 className="mt-2 text-xl font-semibold text-[color:var(--ou-ink)]">Manage access</h2>
                <p className="mt-1 text-sm app-text-muted">Promote users to mentor and control who can create events.</p>
                <Link className="app-button-ghost mt-4 inline-flex text-sm font-semibold" href="/admin/users">
                  Manage users
                </Link>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ me }: { me: { email: string; role: string } | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.18em] app-text-muted">CS-INCLUDES Scheduler</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--ou-ink)]">Dashboard</div>
      </div>
      <div className="flex items-center gap-3">
        {me ? (
          <div className="hidden rounded-xl border app-border bg-white/45 px-3 py-2 text-xs app-text-muted sm:block">
            {me.email} · {me.role}
          </div>
        ) : null}
        {me ? <LogoutButton /> : null}
        <Link
          className="app-button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
          href="/"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
