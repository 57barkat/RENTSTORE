import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAuthToken, type AuthTokenPayload } from "@/app/lib/auth-token";

export interface AdminSession extends AuthTokenPayload {
  token: string;
}

const getJwtSecret = (): string | undefined => {
  return process.env.MY_APP_SECRET;
};

export const getAdminSession = async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get("admin_token")?.value;
  const payload = await verifyAuthToken(token, getJwtSecret());

  if (!token || !payload || payload.role !== "admin") {
    return null;
  }

  return {
    ...payload,
    token,
  };
};

export const requireAdminSession = async (): Promise<AdminSession> => {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
};
