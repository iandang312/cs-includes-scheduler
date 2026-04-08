import Link from "next/link";
import { api } from "@/lib/api";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let events: Awaited<ReturnType<typeof api.events>> = [];

  try {
    me = await api.me();
    events = await api.events();
  } catch {
    // Not signed in yet (or backend not running). We'll show a CTA.
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <Header me={me} />

        {!me ? (
          <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8">
            <h2 className="text-xl font-semibold text-[color:var(--ou-ink)]">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ou-muted)]">
              Your RSVPs are private. We require sign-in to view events and RSVP.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--ou-ink)]">Upcoming events</h2>
                  <p className="mt-1 text-sm text-[color:var(--ou-muted)]">
                    RSVP to reserve a spot. Mentors can view attendees for their events.
                  </p>
                </div>
                {me.role === "mentor" ? (
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white"
                    href="/mentor/events/new"
                  >
                    New event
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3">
                {events.length === 0 ? (
                  <div className="text-sm text-[color:var(--ou-muted)]">No events yet.</div>
                ) : (
                  events.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${encodeURIComponent(e.id)}`}
                      className="rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:bg-black/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[color:var(--ou-ink)]">
                            {e.title}
                          </div>
                          <div className="mt-1 truncate text-xs text-[color:var(--ou-muted)]">
                            {new Date(e.startAt).toLocaleString()} – {new Date(e.endAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-[color:var(--ou-muted)]">View</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {me.role === "admin" ? (
              <section className="rounded-3xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-semibold text-[color:var(--ou-ink)]">Admin</h2>
                <p className="mt-1 text-sm text-[color:var(--ou-muted)]">Promote users to Mentor.</p>
                <Link className="mt-4 inline-flex text-sm font-semibold text-[color:var(--ou-red)]" href="/admin/users">
                  Manage users →
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
        <div className="text-sm font-semibold text-[color:var(--ou-muted)]">CS-INCLUDES Scheduler</div>
        <div className="text-2xl font-semibold tracking-tight text-[color:var(--ou-ink)]">Dashboard</div>
      </div>
      <div className="flex items-center gap-3">
        {me ? (
          <div className="hidden rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-[color:var(--ou-muted)] sm:block">
            {me.email} · {me.role}
          </div>
        ) : null}
        {me ? <LogoutButton /> : null}
        <Link
          className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--ou-ink)] transition hover:bg-black/5"
          href="/"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

