"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
};

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle({
  className = "",
  compact = false,
  showLabel = true,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const activeTheme = mounted ? (resolvedTheme ?? theme) : undefined;
  const isDark = activeTheme === "dark";
  const label = mounted ? (isDark ? "Dark" : "Light") : "Theme";
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] text-sm font-semibold text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary)]/10 ${compact ? "w-11" : "gap-2 px-3.5"} ${className}`}
      data-theme-toggle
      suppressHydrationWarning
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {!compact && showLabel ? (
        <span suppressHydrationWarning>{label}</span>
      ) : (
        <span className="sr-only" suppressHydrationWarning>
          {label}
        </span>
      )}
    </button>
  );
}
