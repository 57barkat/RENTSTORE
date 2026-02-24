"use client";

import { useHydrateAuth } from "../hooks/useHydrateAuth";

export default function AuthHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  useHydrateAuth();

  return <>{children}</>;
}
