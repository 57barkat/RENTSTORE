const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

if (!configuredSiteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be configured to generate canonical URLs.",
  );
}

export const SITE_URL = configuredSiteUrl.replace(/\/$/, "");

export const SITE_ORIGIN = new URL(SITE_URL);

export const toAbsoluteUrl = (path: string): string => {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(?:data|blob|mailto|tel):/i.test(path)) {
    return path;
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_ORIGIN).toString();
};
