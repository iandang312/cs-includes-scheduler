import Link from "next/link";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let event: Awaited<ReturnType<typeof api.event>> | null = null;
  let myRsvp: Awaited<ReturnType<typeof api.myRsvps>>[number] | null = null;
  let attendees: Awaited<ReturnType<typeof api.attendees>> = [];
  let canViewAttendees = false;
  let message: string | null = null;

  try {
    [me, event] = await Promise.all([api.me(), api.event(id)]);
    const rsvps = await api.myRsvps();
    myRsvp = rsvps.find((rsvp) => rsvp.eventId === id) ?? null;
    if (me.role === "mentor" || me.role === "admin") {
      canViewAttendees = me.role === "admin" || event.mentorUserId === me.id;
      if (canViewAttendees) {
        attendees = await api.attendees(id);
      }
    }
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
        <div className="app-panel w-full max-w-xl rounded-[2rem] p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Event</div>
          <div className="mt-2 text-sm app-text-muted">{message ?? "Unable to load."}</div>
          <div className="mt-6 flex gap-3">
            <Link className="app-button-ghost text-sm font-semibold" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="app-button-ghost text-sm font-semibold" href="/login">
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
    revalidatePath(`/events/${id}`);
    revalidatePath("/dashboard");
  }

  async function rsvpNotGoing() {
    "use server";
    await api.rsvp(id, "not_going");
    revalidatePath(`/events/${id}`);
    revalidatePath("/dashboard");
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="app-button-ghost text-sm font-semibold" href="/dashboard">
            Back
          </Link>
          <div className="rounded-xl border app-border bg-white/45 px-3 py-2 text-xs app-text-muted">
            Signed in as {me.email} · {me.role}
          </div>
        </div>

        <div className="app-panel mt-6 rounded-[2rem] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Event</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--ou-ink)]">{event.title}</div>
          <div className="mt-3 text-sm app-text-muted">
            {new Date(event.startAt).toLocaleString()} - {new Date(event.endAt).toLocaleString()}
          </div>
          {event.location ? <div className="mt-2 text-sm app-text-muted">Location: {event.location}</div> : null}
          {event.description ? <div className="mt-5 text-sm leading-7 text-[color:var(--ou-ink)]">{event.description}</div> : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="app-badge rounded-full px-3 py-1">Your RSVP: {myRsvp ? myRsvp.status.replace("_", " ") : "no response"}</span>
            {canViewAttendees && event.capacity !== null ? (
              <span className="app-badge rounded-full px-3 py-1">
                {attendees.length}/{event.capacity} going
              </span>
            ) : canViewAttendees && attendees.length > 0 ? (
              <span className="app-badge rounded-full px-3 py-1">{attendees.length} going</span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action={rsvpGoing}>
              <button
                className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold sm:w-auto ${
                  myRsvp?.status === "going" ? "app-button-secondary" : "app-button-primary"
                }`}
              >
                {myRsvp?.status === "going" ? "Going" : "RSVP Going"}
              </button>
            </form>
            <form action={rsvpNotGoing}>
              <button
                className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold sm:w-auto ${
                  myRsvp?.status === "not_going" ? "app-button-secondary" : "app-button-secondary"
                }`}
              >
                {myRsvp?.status === "not_going" ? "Not going" : "Can't make it"}
              </button>
            </form>
          </div>

          {attendees.length > 0 ? (
            <div className="mt-8 border-t pt-6 app-border">
              <div className="text-sm font-semibold text-[color:var(--ou-ink)]">Attendees</div>
              <div className="mt-3 grid gap-2">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.userId}
                    className="app-panel-strong rounded-2xl px-4 py-3 text-sm app-text-muted"
                  >
                    {attendee.displayName ?? attendee.email}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
