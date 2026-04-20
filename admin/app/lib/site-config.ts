const FALLBACK_SITE_URL = "http://localhost:3000";

export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  FALLBACK_SITE_URL
).replace(/\/$/, "");

export const SITE_ORIGIN = new URL(SITE_URL);

export const toAbsoluteUrl = (path: string): string => {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(?:data|blob|mailto|tel):/i.test(path)) {
    return path;
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_ORIGIN).toString();
};
