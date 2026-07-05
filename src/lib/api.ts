import { createClient } from './supabase';

const API_BASE_URL = "https://school-0b66.onrender.com/api"; // Forced for production

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(`Fetch failed for URL ${API_BASE_URL}${endpoint}: ${err.message}`);
  }

  if (!res.ok) {
    let errorBody = "";
    try {
      const errorJson = await res.json();
      errorBody = errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      errorBody = res.statusText || res.status.toString();
    }
    throw new Error(`API error: ${errorBody}`);
  }

  return res.json();
}
