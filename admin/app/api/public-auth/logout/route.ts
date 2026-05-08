import { NextResponse } from "next/server";

import {
  PUBLIC_ACCESS_COOKIE,
  PUBLIC_REFRESH_COOKIE,
} from "@/app/lib/public-auth-config";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(PUBLIC_ACCESS_COOKIE);
  response.cookies.delete(PUBLIC_REFRESH_COOKIE);
  return response;
}
