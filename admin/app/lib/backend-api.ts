const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const getApiBaseUrlFromRequest = (request: Request | URL | string) => {
  const requestUrl =
    typeof request === "string"
      ? new URL(request)
      : request instanceof URL
        ? request
        : new URL(request.url);

  const candidates = [
    process.env.API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    new URL("/api/v1", requestUrl).toString(),
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .map((value) => trimTrailingSlash(value!));

  return candidates[0] || trimTrailingSlash(new URL("/api/v1", requestUrl).toString());
};
