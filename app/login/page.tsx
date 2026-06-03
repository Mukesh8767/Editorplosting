"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, setSession } from "@/lib/blog-store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [error, setError] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const user = await authenticate(username.trim(), password);
    if (!user) {
      setError("Invalid username or password.");
      return;
    }
    setSession(user);
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  };

  const handleForgotPassword = async () => {
    const email = username.trim();
    setError("");
    setForgotMessage("");

    if (!email) {
      setError("Enter your email/username first, then use forgot password.");
      return;
    }

    setSendingReset(true);
    try {
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to send reset email.");
        return;
      }
      setForgotMessage(data?.message || "If this email exists, a password reset link has been sent.");
    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 grid place-items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-400/5 blur-[150px] -z-10" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/30 shadow-2xl backdrop-blur-md lg:grid-cols-[1.08fr_0.92fr]">
          
          {/* Left Column: Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-8 sm:p-12 bg-slate-900/40">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.32em] text-emerald-400 font-bold">Welcome Back</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Sign In</h1>
              <p className="text-sm text-slate-400">
                Access your workspace to manage sustainability content.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Email / Username
              </label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
                placeholder="admin or email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
                placeholder="Enter password"
                required
              />
            </div>

            {forgotMessage ? (
              <p className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-xs text-emerald-300 leading-relaxed">
                ✓ {forgotMessage}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-rose-900/30 bg-rose-955/20 p-4 text-xs text-rose-350 leading-relaxed">
                ✕ {error}
              </p>
            ) : null}

            <div className="grid gap-3 pt-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 text-sm transition shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/45 py-3.5 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-slate-900 hover:text-emerald-400 disabled:opacity-60 cursor-pointer"
              >
                {sendingReset ? "Sending reset email..." : "Forgot password?"}
              </button>
            </div>
          </form>

          {/* Right Column: Branded Panel */}
          <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-12 text-white lg:flex relative overflow-hidden">
            {/* Ambient glows inside the panel */}
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-emerald-500/15 blur-[80px]" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-400/5 blur-[120px]" />

            <div className="relative space-y-4">
              <span className="text-[10px] uppercase tracking-[0.32em] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
                Editor Portal
              </span>
              <h2 className="text-3xl font-black leading-tight text-white tracking-tight pt-2">
                Empowering <br />Sustainable Voices.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 pt-1">
                Write impactful articles, upload brochures, and manage platform resources inside our clean content workspace.
              </p>
            </div>

            <div className="relative border-t border-white/10 pt-6 mt-12">
              <blockquote className="space-y-3">
                <p className="text-xs italic text-slate-300 leading-relaxed">
                  "Action is the foundational key to all success. Every story we write builds awareness for a healthier future."
                </p>
                <footer className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  — The Editor Studio Team
                </footer>
              </blockquote>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
