import "server-only";

interface ServerApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  cache?: RequestCache;
  includeFrontendSecret?: boolean;
}

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";

const buildUrl = (
  path: string,
  searchParams?: Record<string, string | number | undefined>,
): string => {
  if (!API_BASE_URL) {
    throw new Error("Missing API_URL or NEXT_PUBLIC_API_URL for server requests.");
  }

  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export const serverApiRequest = async <T>(
  path: string,
  options: ServerApiOptions = {},
): Promise<T> => {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.includeFrontendSecret && FRONTEND_SECRET) {
    headers.set("x-frontend-secret", FRONTEND_SECRET);
  }

  const response = await fetch(buildUrl(path, options.searchParams), {
    method: options.method || "GET",
    headers,
    cache: options.cache || "no-store",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Server API request failed with status ${response.status} for ${path}`,
    );
  }

  return (await response.json()) as T;
};
