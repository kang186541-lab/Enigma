import { supabase } from "@/lib/supabase";

async function withAuthHeaders(headers?: HeadersInit): Promise<Headers> {
  const next = new Headers(headers);
  if (!next.has("Authorization")) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) next.set("Authorization", `Bearer ${token}`);
  }
  return next;
}

export async function getAuthHeaderRecord(headers?: HeadersInit): Promise<Record<string, string>> {
  const next = await withAuthHeaders(headers);
  const out: Record<string, string> = {};
  next.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export async function apiFetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: await withAuthHeaders(init.headers),
  });
}
