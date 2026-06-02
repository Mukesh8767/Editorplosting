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
      setError("Enter your email first, then use forgot password.");
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
    <div className="app-shell grid min-h-screen place-items-center px-5 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/70 bg-white/65 shadow-2xl backdrop-blur lg:grid-cols-[1.08fr_0.92fr]">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-7 sm:p-10">
            <div className="mb-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-700">Welcome back</p>
              <h1 className="responsive-heading text-4xl font-bold text-slate-950">Sign in</h1>
              <p className="text-slate-600">Access your workspace to manage sustainability content.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email / Username</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="field w-full rounded-xl px-4 py-3 text-base text-slate-950 placeholder-slate-400 outline-none"
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field w-full rounded-xl px-4 py-3 text-base text-slate-950 placeholder-slate-400 outline-none"
                placeholder="Enter password"
              />
            </div>

            {forgotMessage ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{forgotMessage}</p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
            ) : null}

            <button type="submit" className="btn-primary w-full rounded-xl px-6 py-3 text-sm font-semibold transition">
              Sign in
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingReset}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
            >
              {sendingReset ? "Sending reset email..." : "Forgot password?"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
