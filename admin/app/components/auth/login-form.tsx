"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import apiClient from "@/app/lib/api-client";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post("/users/login", {
        emailOrPhone: email,
        password: password,
      });
      const { accessToken, refreshToken, user, role } = response.data;

      setCookie(null, "admin_token", accessToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      setCookie(null, "refresh_token", refreshToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white dark:bg-card rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden z-10">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
          <div className="z-10">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your <br />
              <span className="text-primary">Rental Empire</span> <br />
              from here.
            </h2>
            <p className="text-slate-400 mt-4 max-w-sm text-lg">
              The world&#39;s most powerful dashboard for property managers and
              owners.
            </p>
          </div>

          <div className="z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <p className="text-white font-medium italic">
              This platform has transformed how we handle our 500+ properties
            </p>
            <p className="text-slate-400 text-sm mt-2">
              — Ammar Baig, Operations Director
            </p>
          </div>

          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-600 disabled:bg-primary/50 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&#39;t have an account?{" "}
            <span className="text-primary font-bold cursor-pointer hover:underline">
              Contact Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
