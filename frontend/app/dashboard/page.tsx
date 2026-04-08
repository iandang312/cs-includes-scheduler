import Link from "next/link";
import { api } from "@/lib/api";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let events: Awaited<ReturnType<typeof api.events>> = [];
  let myRsvps: Awaited<ReturnType<typeof api.myRsvps>> = [];
  let googleCalendar: Awaited<ReturnType<typeof api.googleCalendar>> | null = null;

  try {
    me = await api.me();
    [events, myRsvps, googleCalendar] = await Promise.all([
      api.events(),
      api.myRsvps(),
      api.googleCalendar(),
    ]);
  } catch {
    // Not signed in yet (or backend not running). We'll show a CTA.
  }

  const rsvpByEventId = new Map(myRsvps.map((rsvp) => [rsvp.eventId, rsvp.status]));

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
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
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Events</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Upcoming sessions</h2>
                  <p className="mt-2 text-sm app-text-muted">
                    RSVP to reserve a spot. Mentors can view attendees for events they own.
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

              <div className="mt-6 grid gap-4">
                {events.length === 0 ? (
                  <div className="rounded-2xl border app-border bg-white/45 px-4 py-5 text-sm app-text-muted">
                    No events yet.
                  </div>
                ) : (
                  events.map((e) => {
                    const rsvpStatus = rsvpByEventId.get(e.id);
                    return (
                      <Link
                        key={e.id}
                        href={`/events/${encodeURIComponent(e.id)}`}
                        className="app-panel-strong rounded-[1.5rem] px-5 py-5 transition hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold text-[color:var(--ou-ink)]">{e.title}</div>
                            <div className="mt-1 truncate text-sm app-text-muted">
                              {new Date(e.startAt).toLocaleString()} - {new Date(e.endAt).toLocaleString()}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  rsvpStatus === "going"
                                    ? "app-badge-going"
                                    : rsvpStatus === "not_going"
                                      ? "app-badge-muted"
                                      : "app-badge"
                                }`}
                              >
                                {rsvpStatus === "going"
                                  ? "Going"
                                  : rsvpStatus === "not_going"
                                    ? "Not going"
                                    : "No RSVP"}
                              </span>
                              {e.location ? (
                                <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold">
                                  {e.location}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] app-text-muted">View</div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            <section className="app-panel rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Calendar</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Live Google Calendar</h2>
                  <p className="mt-2 text-sm app-text-muted">
                    Upcoming events pulled directly from the shared Google Calendar.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {!googleCalendar ? (
                  <div className="rounded-2xl border app-border bg-white/45 px-4 py-5 text-sm app-text-muted">
                    Unable to load the Google Calendar feed.
                  </div>
                ) : !googleCalendar.enabled || !googleCalendar.connected ? (
                  <div className="rounded-2xl border app-border border-dashed bg-white/45 px-4 py-5 text-sm app-text-muted">
                    {googleCalendar.message ?? "Google Calendar is not connected yet."}
                  </div>
                ) : googleCalendar.events.length === 0 ? (
                  <div className="rounded-2xl border app-border bg-white/45 px-4 py-5 text-sm app-text-muted">
                    No upcoming Google Calendar events found.
                  </div>
                ) : (
                  googleCalendar.events.map((event) => (
                    <div key={event.id} className="app-panel-strong rounded-[1.5rem] px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold text-[color:var(--ou-ink)]">
                            {event.title}
                          </div>
                          <div className="mt-1 text-sm app-text-muted">
                            {new Date(event.startAt).toLocaleString()}
                            {event.endAt ? ` - ${new Date(event.endAt).toLocaleString()}` : ""}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold">
                              {event.status}
                            </span>
                            {event.location ? (
                              <span className="app-badge rounded-full px-3 py-1 text-[11px] font-semibold">
                                {event.location}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {event.htmlLink ? (
                          <a
                            className="app-button-ghost inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
                            href={event.htmlLink}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))
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
