"use client";

import { useTransition } from "react";
import { api } from "@/lib/api";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="app-button-secondary inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold disabled:opacity-60"
      onClick={() => {
        start(async () => {
          await api.auth.logout();
          window.location.href = "/";
        });
      }}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
