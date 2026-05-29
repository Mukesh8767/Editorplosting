"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, setSession } from "@/lib/blog-store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <div className="space-y-4 mb-6">
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Welcome back</p>
              <h1 className="text-4xl font-bold text-white">Sign In</h1>
              <p className="text-slate-400">Access your account to manage content</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Email / Username</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-base text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="text-sm text-rose-400 bg-rose-900/20 border border-rose-800/30 rounded-lg p-3">{error}</p> : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition shadow-lg"
            >
              Sign in
            </button>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 text-white shadow-xl">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Demo credentials</p>
            <h2 className="mt-4 text-2xl font-bold">Try signing in</h2>
            <div className="mt-6 space-y-3 rounded-lg bg-slate-950/50 border border-slate-700 p-5 text-slate-100">
              <div>
                <p className="text-xs text-slate-400">Admin Email</p>
                <p className="font-mono text-sm">admin</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Admin Password</p>
                <p className="font-mono text-sm">admin123</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-400">
              <span className="text-emerald-400 font-semibold">Admins:</span> Create and manage author accounts, view all posts.<br/>
              <span className="text-emerald-400 font-semibold">Authors:</span> Manage your own blog posts and profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
