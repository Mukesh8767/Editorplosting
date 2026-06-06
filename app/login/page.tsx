"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
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
    <div className="app-shell grid min-h-screen place-items-center px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[1.04fr_0.96fr]">
          <form onSubmit={handleSubmit} className="space-y-6 p-8 sm:p-12">
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
                Welcome back
              </span>
              <h1 className="text-4xl font-medium tracking-tight text-slate-950">Sign in</h1>
              <p className="text-sm leading-6 text-slate-600">
                Access your workspace to manage sustainability content.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                Email / Username
              </label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="field w-full rounded-xl px-4 py-3.5 text-sm text-black placeholder-slate-400 outline-none"
                placeholder="admin or email address"
                required
              />
            </div>

            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field w-full rounded-xl px-4 py-3.5 text-sm text-black placeholder-slate-400 outline-none"
              placeholder="Enter password"
              required
            />

            {forgotMessage ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-800">
                {forgotMessage}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="grid gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary w-full cursor-pointer rounded-xl py-4 text-sm font-medium transition"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="btn-muted w-full cursor-pointer rounded-xl py-3.5 text-xs font-medium transition disabled:opacity-60"
              >
                {sendingReset ? "Sending reset email..." : "Forgot password?"}
              </button>
            </div>
          </form>

          <div className="hidden flex-col justify-between border-l border-slate-200 bg-[#eef4f0] p-12 text-slate-900 lg:flex">
            <div className="space-y-4">
              <span className="w-fit rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-800">
                Editor Portal
              </span>
              <h2 className="pt-2 text-3xl font-medium leading-tight tracking-tight text-slate-950">
                Empowering <br />Sustainable Voices.
              </h2>
              <p className="max-w-sm pt-1 text-sm leading-7 text-slate-600">
                Write impactful articles, upload brochures, and manage platform resources inside our clean content workspace.
              </p>
            </div>

            <div className="mt-12 border-t border-emerald-100 pt-6">
              <blockquote className="space-y-3">
                <p className="text-xs italic leading-relaxed text-slate-600">
                  &quot;Action is the foundational key to all success. Every story we write builds awareness for a healthier future.&quot;
                </p>
                <footer className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-800">
                  The Editor Studio Team
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
