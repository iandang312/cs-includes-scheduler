"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="app-panel w-full max-w-4xl overflow-hidden rounded-[2rem]">
        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <section className="border-b app-border bg-[color:var(--ou-red-deep)] px-8 py-10 text-white md:border-b-0 md:border-r">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Access</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back." : "Create your account."}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/78">
              {mode === "login"
                ? "Sign in with your email and password to manage events or RSVP."
                : "New users begin as mentees unless they are seeded as admins."}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                Mentor events
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                Private RSVPs
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                Admin roles
              </span>
            </div>
          </section>

          <section className="bg-[color:var(--ou-panel-strong)] px-8 py-10">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[color:var(--ou-ink)]">
                {mode === "login" ? "Sign in" : "Create account"}
              </div>
              <Link className="app-button-ghost text-sm font-semibold" href="/">
                Home
              </Link>
            </div>

            <p className="mt-2 text-sm app-text-muted">
              {mode === "login"
                ? "Use your email and password."
                : "Admins are seeded via ADMIN_EMAILS; everyone else starts as a mentee."}
            </p>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                start(async () => {
                  try {
                    if (mode === "login") {
                      await api.auth.login(email, password);
                    } else {
                      await api.auth.register(email, password, displayName || undefined);
                    }
                    window.location.href = "/dashboard";
                  } catch (e) {
                    const msg = e instanceof ApiError ? String(e.message) : "Something went wrong";
                    setErr(msg);
                  }
                });
              }}
            >
              {mode === "register" ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Display name</span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="app-input h-11 rounded-xl px-4 text-sm"
                  />
                </label>
              ) : null}

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="app-input h-11 rounded-xl px-4 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="app-input h-11 rounded-xl px-4 text-sm"
                />
                <span className="text-xs app-text-muted">Minimum 8 characters.</span>
              </label>

              {err ? (
                <div className="rounded-2xl border border-[color:var(--ou-red)]/20 bg-[color:var(--ou-red)]/8 px-4 py-3 text-sm font-medium text-[color:var(--ou-red-deep)]">
                  {err}
                </div>
              ) : null}

              <button
                disabled={pending}
                className="app-button-primary mt-2 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
                type="submit"
              >
                {pending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-sm app-text-muted">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button className="app-button-ghost font-semibold" onClick={() => setMode("register")}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button className="app-button-ghost font-semibold" onClick={() => setMode("login")}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
