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
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Sign in required</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">Please sign in to create events.</div>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white"
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
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Mentor access required</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">
            Your account is currently <span className="font-semibold">{me.role}</span>. Ask an admin to promote you.
          </div>
          <Link className="mt-6 inline-flex text-sm font-semibold text-[color:var(--ou-red)]" href="/dashboard">
            Back to dashboard →
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
          <Link className="text-sm font-semibold text-[color:var(--ou-red)]" href="/dashboard">
            ← Back
          </Link>
          <div className="text-xs text-[color:var(--ou-muted)]">{me.email} · {me.role}</div>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold text-[color:var(--ou-ink)]">Create an event</h1>
          <p className="mt-1 text-sm text-[color:var(--ou-muted)]">This creates the event in the platform; Graph sync is optional.</p>

          <form action={createEvent} className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Title</span>
              <input name="title" required className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Description</span>
              <textarea name="description" rows={4} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Start</span>
                <input name="startAt" type="datetime-local" required className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">End</span>
                <input name="endAt" type="datetime-local" required className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Location</span>
                <input name="location" className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Capacity (optional)</span>
                <input name="capacity" type="number" min={1} className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/10" />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <span className="text-sm text-[color:var(--ou-muted)]">
                Calendar sync is disabled in this build (Microsoft SSO removed).
              </span>
            </label>

            <button className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white">
              Create event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
