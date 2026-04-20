"use client";

import { useEffect, useState } from "react";
import { destroyCookie, setCookie } from "nookies";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

import apiClient from "@/app/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reauth") !== "1") {
      return;
    }

    destroyCookie(null, "admin_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post("/users/login", {
        emailOrPhone: email,
        password,
      });
      const { accessToken, refreshToken } = response.data;

      setCookie(null, "admin_token", accessToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      setCookie(null, "refresh_token", refreshToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      router.push("/dashboard");
    } catch {
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[var(--admin-primary-soft)] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-[var(--admin-primary-soft)] blur-[120px]" />

      <div className="z-10 grid w-full max-w-[1100px] overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-sidebar p-12 lg:flex">
          <div className="z-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-background)] shadow-lg shadow-[var(--admin-shadow)]">
              <span className="text-xl font-bold text-[var(--admin-primary)]">A</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight text-[var(--admin-background)]">
              Manage your <br />
              <span className="text-[var(--admin-accent)]">Rental Empire</span> <br />
              from here.
            </h2>
            <p className="mt-4 max-w-sm text-lg text-[rgba(255,255,255,0.78)]">
              The world&#39;s most powerful dashboard for property managers and
              owners.
            </p>
          </div>

          <div className="z-10 rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] p-6 backdrop-blur-md">
            <p className="font-medium italic text-[var(--admin-background)]">
              This platform has transformed how we handle our 500+ properties
            </p>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.7)]">
              - Ammar Baig, Operations Director
            </p>
          </div>

          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(var(--admin-secondary)_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-[var(--admin-muted)]">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-semibold text-foreground/80">
                Email Address
              </label>
              <div className="group relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)] transition-colors group-focus-within:text-[var(--admin-primary)]"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="admin-input w-full rounded-2xl py-4 pl-12 pr-4 text-[var(--admin-text)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-semibold text-foreground/80">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--admin-primary)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="group relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)] transition-colors group-focus-within:text-[var(--admin-primary)]"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="admin-input w-full rounded-2xl py-4 pl-12 pr-4 text-[var(--admin-text)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="admin-button-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--admin-muted)]">
            Don&#39;t have an account?{" "}
            <span className="cursor-pointer font-bold text-[var(--admin-primary)] hover:underline">
              Contact Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
