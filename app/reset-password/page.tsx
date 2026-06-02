"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

type RecoveryStatus = "checking" | "ready" | "invalid" | "saving" | "success";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking reset link...");
  const [error, setError] = useState("");

  useEffect(() => {
    const prepareRecoverySession = async () => {
      try {
        const supabase = getSupabaseClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type") || url.searchParams.get("type");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          setStatus("invalid");
          setMessage("");
          setError("This reset link is missing recovery credentials. Please request a new password reset email.");
          return;
        }

        if (type && type !== "recovery") {
          setMessage("Reset link verified.");
        } else {
          setMessage("Choose a new password for your account.");
        }
        setStatus("ready");
      } catch (err) {
        setStatus("invalid");
        setMessage("");
        setError(err instanceof Error ? err.message : "This reset link is invalid or expired.");
      }
    };

    prepareRecoverySession();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("ready");
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully. You can now sign in with the new password.");
    setStatus("success");
  };

  return (
    <div className="app-shell grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-white p-7 shadow-2xl sm:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-700">Account recovery</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Reset password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter a new password for your Supabase Auth account.
        </p>

        {message ? <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}

        {status === "ready" || status === "saving" ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">New password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field mt-2 w-full rounded-xl px-4 py-3 text-slate-950 outline-none"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="field mt-2 w-full rounded-xl px-4 py-3 text-slate-950 outline-none"
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" disabled={status === "saving"} className="btn-primary w-full rounded-xl px-6 py-3 text-sm font-semibold transition disabled:opacity-60">
              {status === "saving" ? "Updating password..." : "Update password"}
            </button>
          </form>
        ) : null}

        <div className="mt-6 border-t border-slate-100 pt-5">
          <Link href="/login" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
