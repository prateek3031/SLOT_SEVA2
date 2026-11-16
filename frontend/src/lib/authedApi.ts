import { useAuth } from "@clerk/react";
import { apiGet, apiPatch, apiPost } from "./api";

// Clerk-authenticated variants of the typed fetch layer: the session token rides as a
// Bearer header (require_user accepts it); Clerk dev-instance cookies don't reach us.
export function useAuthedApi() {
  const { getToken } = useAuth();
  const h = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  return {
    get: async <T>(path: string): Promise<T> => apiGet<T>(path, await h()),
    post: async <T>(path: string, body?: unknown): Promise<T> => apiPost<T>(path, body, await h()),
    patch: async <T>(path: string, body?: unknown): Promise<T> => apiPatch<T>(path, body, await h()),
  };
}
