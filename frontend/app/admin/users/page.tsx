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
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Sign in required</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">Please sign in to manage users.</div>
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

  if (me.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">Admin access required</div>
          <div className="mt-2 text-sm text-[color:var(--ou-muted)]">Your role is {me.role}.</div>
          <Link className="mt-6 inline-flex text-sm font-semibold text-[color:var(--ou-red)]" href="/dashboard">
            Back to dashboard →
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-xl font-semibold text-[color:var(--ou-ink)]">Manage users</h1>
          <p className="mt-1 text-sm text-[color:var(--ou-muted)]">
            Promote mentees to mentors.
          </p>

          <div className="mt-6 grid gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[color:var(--ou-ink)]">{u.email}</div>
                  <div className="truncate text-xs text-[color:var(--ou-muted)]">
                    {u.displayName ?? "—"} · {u.role}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await fetch(
                        `${env.apiBaseUrl}/admin/users/${encodeURIComponent(u.id)}/role`,
                        {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ role: "mentor" }),
                        },
                      );
                    }}
                  >
                    <button className="inline-flex h-9 items-center justify-center rounded-xl bg-black px-3 text-xs font-semibold text-white">
                      Make mentor
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await fetch(
                        `${env.apiBaseUrl}/admin/users/${encodeURIComponent(u.id)}/role`,
                        {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ role: "mentee" }),
                        },
                      );
                    }}
                  >
                    <button className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-[color:var(--ou-ink)]">
                      Make mentee
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {users.length === 0 ? <div className="text-sm text-[color:var(--ou-muted)]">No users yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

