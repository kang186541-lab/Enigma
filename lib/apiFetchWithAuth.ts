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

export async function apiFetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: await withAuthHeaders(init.headers),
  });
}
