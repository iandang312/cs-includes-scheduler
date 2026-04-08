import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let event: Awaited<ReturnType<typeof api.event>> | null = null;
  let message: string | null = null;

  try {
    [me, event] = await Promise.all([api.me(), api.event(id)]);
  } catch (e) {
    const err = e as unknown;
    message =
      err instanceof ApiError
        ? `API error (${err.status}): ${String(err.message)}`
        : "Unable to load event (are you signed in and is the backend running?)";
  }

  if (!me || !event) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Event</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">{message ?? "Unable to load."}</div>
          <div className="mt-6 flex gap-3">
            <Link className="text-sm font-semibold text-[color:var(--ou-red)]" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="text-sm font-semibold text-[color:var(--ou-red)]" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function rsvpGoing() {
    "use server";
    await api.rsvp(id, "going");
  }

  async function rsvpNotGoing() {
    "use server";
    await api.rsvp(id, "not_going");
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-sm font-semibold text-[color:var(--ou-red)]" href="/dashboard">
            ← Back
          </Link>
          <div className="text-xs text-[color:var(--ou-muted)]">
            Signed in as {me.email} · {me.role}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-2xl font-semibold tracking-tight text-[color:var(--ou-ink)]">{event.title}</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">
            {new Date(event.startAt).toLocaleString()} – {new Date(event.endAt).toLocaleString()}
          </div>
          {event.location ? (
            <div className="mt-2 text-sm text-[color:var(--ou-muted)]">Location: {event.location}</div>
          ) : null}
          {event.description ? (
            <div className="mt-4 text-sm leading-6 text-[color:var(--ou-ink)]">{event.description}</div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action={rsvpGoing}>
              <button className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white sm:w-auto">
                RSVP Going
              </button>
            </form>
            <form action={rsvpNotGoing}>
              <button className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[color:var(--ou-ink)] sm:w-auto">
                Can&apos;t make it
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

