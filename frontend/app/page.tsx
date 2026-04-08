import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="app-panel w-full max-w-6xl overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
          <section className="flex flex-col justify-between gap-10">
            <div className="flex flex-col gap-5">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border app-border bg-white/45 px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-[color:var(--ou-gold)]" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] app-text-muted">
                  CS-INCLUDES Scheduler
                </span>
              </div>
              <div className="max-w-3xl">
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-[color:var(--ou-ink)] sm:text-6xl">
                  Scheduling that feels deliberate, not improvised.
                </h1>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-7 app-text-muted sm:text-lg">
                  Mentors publish sessions, mentees RSVP privately, and admins manage access without the usual
                  spreadsheet drift. The interface now leans into a warmer editorial palette instead of generic
                  white-on-beige boxes.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="app-button-primary inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="app-button-secondary inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold"
                href="/dashboard"
              >
                Continue to dashboard
              </Link>
            </div>
          </section>

          <section className="app-panel-strong rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] app-text-muted">System View</div>
                <div className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Role-aware workflow</div>
              </div>
              <div className="rounded-2xl bg-[color:var(--ou-red)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--ou-red-deep)]">
                Live
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <FeatureCard title="Mentors post events" body="Create sessions with time, location, and optional capacity in one form." />
              <FeatureCard title="Private RSVP state" body="Mentees can immediately see whether they are going, not going, or still undecided." />
              <FeatureCard title="Admin control" body="Promote users to mentor and manage the event pipeline without leaving the app." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function FeatureCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border app-border bg-white/58 p-5">
      <div className="text-sm font-semibold text-[color:var(--ou-ink)]">{props.title}</div>
      <div className="mt-2 text-sm leading-6 app-text-muted">{props.body}</div>
    </div>
  );
}
