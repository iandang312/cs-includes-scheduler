import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-5xl rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur sm:p-12">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[color:var(--ou-red)]" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-wide text-[color:var(--ou-muted)]">
                CS-INCLUDES
              </span>
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-[color:var(--ou-ink)] sm:text-5xl">
              Mentor + Mentee scheduling, without the chaos.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-7 text-[color:var(--ou-muted)] sm:text-lg">
              Mentors post events. Mentees RSVP privately. Admins manage roles. Optionally sync mentor
              events to Outlook via Microsoft Graph.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[color:var(--ou-ink)] transition hover:bg-black/5"
              href="/dashboard"
            >
              Continue to dashboard
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard title="Mentors post events" body="Create sessions with time, location, and capacity." />
            <FeatureCard title="Private RSVPs" body="Mentees only see their own RSVPs and schedule." />
            <FeatureCard title="Role-based access" body="Admin promotes mentors; mentors see attendees for their events." />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-[color:var(--ou-ink)]">{props.title}</div>
      <div className="mt-2 text-sm leading-6 text-[color:var(--ou-muted)]">{props.body}</div>
    </div>
  );
}
