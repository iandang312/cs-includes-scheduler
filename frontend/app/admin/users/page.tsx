import Link from "next/link";
import { api } from "@/lib/api";
import { env } from "@/lib/env";

export default async function AdminUsersPage() {
  let me: Awaited<ReturnType<typeof api.me>> | null = null;
  let users: Array<{ id: string; email: string; displayName: string | null; role: string }> = [];
  try {
    me = await api.me();
    if (me.role === "admin") {
      users = await fetch(`${env.apiBaseUrl}/admin/users`, {
        credentials: "include",
        cache: "no-store",
      }).then((r) => r.json());
    }
  } catch {}

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="app-panel w-full max-w-xl rounded-[2rem] p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Sign in required</div>
          <div className="mt-2 text-sm app-text-muted">Please sign in to manage users.</div>
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

  if (me.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="app-panel w-full max-w-xl rounded-[2rem] p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Admin access required</div>
          <div className="mt-2 text-sm app-text-muted">Your role is {me.role}.</div>
          <Link className="app-button-ghost mt-6 inline-flex text-sm font-semibold" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link className="app-button-ghost text-sm font-semibold" href="/dashboard">
            Back
          </Link>
          <div className="rounded-xl border app-border bg-white/45 px-3 py-2 text-xs app-text-muted">
            {me.email} · {me.role}
          </div>
        </div>

        <div className="app-panel mt-6 rounded-[2rem] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] app-text-muted">Admin</div>
          <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ou-ink)]">Manage users</h1>
          <p className="mt-1 text-sm app-text-muted">Promote mentees to mentors or revert access when needed.</p>

          <div className="mt-6 grid gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="app-panel-strong flex flex-col gap-3 rounded-[1.5rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[color:var(--ou-ink)]">{u.email}</div>
                  <div className="mt-1 truncate text-xs app-text-muted">
                    {u.displayName ?? "No display name"} · {u.role}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await fetch(`${env.apiBaseUrl}/admin/users/${encodeURIComponent(u.id)}/role`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ role: "mentor" }),
                      });
                    }}
                  >
                    <button className="app-button-primary inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold">
                      Make mentor
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await fetch(`${env.apiBaseUrl}/admin/users/${encodeURIComponent(u.id)}/role`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ role: "mentee" }),
                      });
                    }}
                  >
                    <button className="app-button-secondary inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold">
                      Make mentee
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {users.length === 0 ? (
              <div className="rounded-2xl border app-border bg-white/45 px-4 py-5 text-sm app-text-muted">No users yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
