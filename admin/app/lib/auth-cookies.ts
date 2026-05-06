const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;

const isSecureCookie = () => process.env.NODE_ENV === "production";

export const getAccessTokenCookieOptions = () => ({
  path: "/",
  maxAge: FIFTEEN_MINUTES_IN_SECONDS,
  sameSite: "lax" as const,
  secure: isSecureCookie(),
});

export const getRefreshTokenCookieOptions = () => ({
  path: "/",
  maxAge: THIRTY_DAYS_IN_SECONDS,
  sameSite: "strict" as const,
  secure: isSecureCookie(),
  httpOnly: true,
});
