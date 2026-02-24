"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-4 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors text-xs font-medium"
      suppressHydrationWarning
    >
      {typeof window === "undefined"
        ? "Theme"
        : theme === "dark"
          ? "🌙 Dark"
          : "☀️ Light"}
    </button>
  );
}
