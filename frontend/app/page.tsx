import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="app-panel w-full max-w-6xl overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
          <section className="flex flex-col justify-between gap-10">
            <div className="flex flex-col gap-5">
              <div className="max-w-3xl">
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-[color:var(--ou-ink)] sm:text-6xl">
                  CS-INCLUDES Scheduler
                </h1>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-7 app-text-muted sm:text-lg">
                  Easily manage and schedule event sessions for CS-INCLUDES Mentors and Mentees.
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
