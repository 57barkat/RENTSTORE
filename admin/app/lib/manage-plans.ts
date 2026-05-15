import { Crown, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

type PlanKey = "free" | "standard" | "pro" | "unknown";

type ManagedPlan = {
  key: PlanKey;
  label: string;
  badgeLabel: string;
  description: string;
  icon: LucideIcon;
};

export const managePlans = (plan: unknown): ManagedPlan => {
  const normalizedPlan = String(plan || "")
    .trim()
    .toLowerCase();

  if (normalizedPlan === "free") {
    return {
      key: "free",
      label: "Free",
      badgeLabel: "Free plan",
      description: "Basic access for browsing and saving property listings.",
      icon: ShieldCheck,
    };
  }

  if (normalizedPlan === "standard" || normalizedPlan === "standerd") {
    return {
      key: "standard",
      label: "Standard",
      badgeLabel: "Standard plan",
      description: "More tools for managing property listings.",
      icon: Sparkles,
    };
  }

  if (normalizedPlan === "pro" || normalizedPlan === "premium") {
    return {
      key: "pro",
      label: "Premium",
      badgeLabel: "Premium plan",
      description: "Advanced visibility and listing management features.",
      icon: Crown,
    };
  }

  return {
    key: "unknown",
    label: "Standard",
    badgeLabel: "Account plan",
    description: "Your current account plan.",
    icon: ShieldCheck,
  };
};
