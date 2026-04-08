"use client";

import { useTransition } from "react";
import { api } from "@/lib/api";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[color:var(--ou-ink)] transition hover:bg-black/5 disabled:opacity-60"
      onClick={() => {
        start(async () => {
          await api.auth.logout();
          window.location.href = "/";
        });
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

