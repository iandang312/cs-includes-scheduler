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
      <main className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-[color:var(--ou-ink)]">
            {mode === "login" ? "Sign in" : "Create account"}
          </div>
          <Link className="text-sm font-semibold text-[color:var(--ou-red)]" href="/">
            Home
          </Link>
        </div>

        <p className="mt-2 text-sm text-[color:var(--ou-muted)]">
          {mode === "login"
            ? "Use your email + password."
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
                const msg =
                  e instanceof ApiError ? String(e.message) : "Something went wrong";
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
                className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--ou-ink)] outline-none focus:ring-2 focus:ring-black/10"
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
              className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--ou-ink)] outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[color:var(--ou-ink)]">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[color:var(--ou-ink)] outline-none focus:ring-2 focus:ring-black/10"
            />
            <span className="text-xs text-[color:var(--ou-muted)]">Minimum 8 characters.</span>
          </label>

          {err ? <div className="text-sm font-semibold text-red-700">{err}</div> : null}

          <button
            disabled={pending}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--ou-red)] px-5 text-sm font-semibold text-white disabled:opacity-60"
            type="submit"
          >
            {pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[color:var(--ou-muted)]">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button className="font-semibold text-[color:var(--ou-red)]" onClick={() => setMode("register")}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="font-semibold text-[color:var(--ou-red)]" onClick={() => setMode("login")}>
                Sign in
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

