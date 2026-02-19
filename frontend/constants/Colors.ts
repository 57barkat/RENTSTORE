// A Deep Navy for Trust and a Forest Green for Growth/Money
const tintColorLight = "#2563EB"; // Professional Blue
const tintColorDark = "#60A5FA"; // Accessible Light Blue

export const Colors = {
  light: {
    text: "#0F172A",
    background: "#FFFFFF",
    card: "#F8FAFC", // Slightly cooler gray for a premium feel
    border: "#E2E8F0",
    muted: "#64748B",

    tint: tintColorLight,
    primary: "#10B981", // Deep Navy (Trust)
    secondary: "#10B981", // Emerald Green (Success/Growth)
    accent: "#F59E0B", // Amber for "New" or "Featured" tags
    danger: "#E11D48",

    success: "#059669",
    error: "#DC2626",
    warning: "#D97706",
    info: "#2563EB",

    icon: "#475569",
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorLight,
    placeholder: "#94A3B8",
    shadow: "rgba(0, 0, 0, 0.05)",
  },

  dark: {
    placeholder: "#64748B",
    text: "#F8FAFC",
    background: "#0F172A", // Deep Navy background instead of pure black
    card: "#1E293B",
    border: "#334155",
    muted: "#94A3B8",

    tint: tintColorDark,
    primary: "#34D399",
    secondary: "#34D399", // Softer green for dark mode
    accent: "#FBBF24",

    success: "#10B981",
    error: "#FB7185",
    warning: "#FBBF24",
    info: "#60A5FA",
    danger: "#F43F5E",

    icon: "#94A3B8",
    tabIconDefault: "#475569",
    shadow: "rgba(0, 0, 0, 0.4)",
    tabIconSelected: tintColorDark,
  },
};
