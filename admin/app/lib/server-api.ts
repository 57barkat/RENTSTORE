import "server-only";

import { redirect } from "next/navigation";

interface ServerApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  cache?: RequestCache;
  includeFrontendSecret?: boolean;
}

const API_BASE_URL = (process.env.API_URL || "").replace(/\/$/, "");
const NEXT_PUBLIC_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";
const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_LOCALHOST_ALIAS_API_BASE_URL = "http://127.0.0.1:3000/api/v1";

const getCandidateBaseUrls = (): string[] => {
  const candidates =
    process.env.NODE_ENV === "production"
      ? [API_BASE_URL, NEXT_PUBLIC_API_URL]
      : [
          API_BASE_URL,
          DEFAULT_LOCAL_API_BASE_URL,
          DEFAULT_LOCALHOST_ALIAS_API_BASE_URL,
          NEXT_PUBLIC_API_URL,
        ];

  return Array.from(
    new Set(candidates.map((value) => value.replace(/\/$/, "")).filter(Boolean)),
  );
};

const buildUrl = (
  baseUrl: string,
  path: string,
  searchParams?: Record<string, string | number | undefined>,
): string => {
  const url = new URL(`${baseUrl}${path}`);

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
  const candidateBaseUrls = getCandidateBaseUrls();

  if (candidateBaseUrls.length === 0) {
    throw new Error("Missing API_URL or NEXT_PUBLIC_API_URL for server requests.");
  }

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

  let lastError: Error | null = null;

  for (const baseUrl of candidateBaseUrls) {
    try {
      const response = await fetch(buildUrl(baseUrl, path, options.searchParams), {
        method: options.method || "GET",
        headers,
        cache: options.cache || "no-store",
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          redirect("/login?reauth=1");
        }

        lastError = new Error(
          `Server API request failed with status ${response.status} for ${path} via ${baseUrl}`,
        );

        if (response.status >= 500 || response.status === 404) {
          continue;
        }

        throw lastError;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(`Server API request failed for ${path}`);
    }
  }

  throw (
    lastError ||
    new Error(`Server API request failed because no API base URL responded for ${path}`)
  );
};
