import { env } from "@/lib/env";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function serverCookieHeader(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  // Only available in Next.js server runtime.
  const mod = await import("next/headers");
  const store = await mod.cookies();
  const all = store.getAll();
  if (all.length === 0) return null;
  return all.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookie = await serverCookieHeader();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message = (() => {
      if (typeof body === "object" && body && "detail" in body) {
        const detail = (body as { detail?: unknown }).detail;
        if (typeof detail === "string") return detail;
      }
      return `Request failed (${res.status})`;
    })();
    throw new ApiError(String(message), res.status, body);
  }

  return body as T;
}

export type Role = "admin" | "mentor" | "mentee";

export type Me = {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
};

export type EventListItem = {
  id: string;
  mentorUserId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  location: string | null;
  capacity: number | null;
};

export const api = {
  me: () => request<Me>("/me"),
  events: () => request<EventListItem[]>("/events"),
  event: (id: string) => request<EventListItem>(`/events/${encodeURIComponent(id)}`),
  createEvent: (payload: {
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    location: string | null;
    capacity: number | null;
    syncToGraph?: boolean;
  }) =>
    request<EventListItem>("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  rsvp: (id: string, status: "going" | "not_going") =>
    request<{ ok: true }>(`/events/${encodeURIComponent(id)}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  myRsvps: () => request<{ eventId: string; status: "going" | "not_going" }[]>("/me/rsvps"),
  auth: {
    login: (email: string, password: string) =>
      request<{ ok: true }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, displayName?: string) =>
      request<{ ok: true }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName: displayName ?? null }),
      }),
    logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  },
};
