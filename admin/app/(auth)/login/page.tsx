import type { Metadata } from "next";
import LoginForm from "@/app/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin login | AnganStay",
  description: "Sign in to the AnganStay administration dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#020617]">
      <LoginForm />
    </div>
  );
}
