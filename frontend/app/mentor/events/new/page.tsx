import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export default async function NewEventPage() {
  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  try {
    me = await api.me();
  } catch {}

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="app-panel w-full max-w-xl rounded-[2rem] p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Sign in required</div>
          <div className="mt-2 text-sm app-text-muted">Please sign in to create events.</div>
          <Link
            className="app-button-primary mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (me.role !== "mentor" && me.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="app-panel w-full max-w-xl rounded-[2rem] p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Mentor access required</div>
          <div className="mt-2 text-sm app-text-muted">
            Your account is currently <span className="font-semibold">{me.role}</span>. Ask an admin to promote you.
          </div>
          <Link className="app-button-ghost mt-6 inline-flex text-sm font-semibold" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  async function createEvent(formData: FormData) {
    "use server";
    await api.createEvent({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      startAt: String(formData.get("startAt") ?? ""),
      endAt: String(formData.get("endAt") ?? ""),
      location: String(formData.get("location") ?? "") || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      syncToGraph: false,
    });
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="app-button-ghost text-sm font-semibold" href="/dashboard">
            Back
          </Link>
          <div className="rounded-xl border app-border bg-white/45 px-3 py-2 text-xs app-text-muted">
            {me.email} · {me.role}
          </div>
        </div>

        <div className="app-panel mt-6 rounded-[2rem] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Mentor</div>
          <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Create an event</h1>
          <p className="mt-1 text-sm app-text-muted">Publish a session with clear timing, location, and optional capacity.</p>

          <form action={createEvent} className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Title</span>
              <input name="title" required className="app-input h-11 rounded-xl px-4 text-sm" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Description</span>
              <textarea name="description" rows={4} className="app-input rounded-xl px-4 py-3 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Start</span>
                <input name="startAt" type="datetime-local" required className="app-input h-11 rounded-xl px-4 text-sm" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">End</span>
                <input name="endAt" type="datetime-local" required className="app-input h-11 rounded-xl px-4 text-sm" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Location</span>
                <input name="location" className="app-input h-11 rounded-xl px-4 text-sm" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Capacity (optional)</span>
                <input name="capacity" type="number" min={1} className="app-input h-11 rounded-xl px-4 text-sm" />
              </label>
            </div>
            <div className="rounded-2xl border app-border bg-white/45 px-4 py-3 text-sm app-text-muted">
              Calendar sync is disabled in this build.
            </div>

            <button className="app-button-primary mt-2 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold">
              Create event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
