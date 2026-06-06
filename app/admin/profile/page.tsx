"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { clearSession, getSession, setSession, type User } from "@/lib/blog-store";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function AdminProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.push("/login");
      return;
    }
    setUser(current);
    setDisplayName(current.displayName);
    setAvatarUrl(current.avatarUrl ?? null);
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setMessage("");
    setError("");

    const payload: any = {
      id: user.id,
      displayName: displayName.trim() || user.displayName,
      avatarUrl: avatarUrl ?? null,
    };

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Unable to update profile.");
      return;
    }

    const updatedUser: User = {
      ...user,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl ?? null,
    };
    setUser(updatedUser);
    setSession(updatedUser);
    setMessage("Profile updated successfully.");
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError("Current password and new password are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const res = await fetch("/api/password/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        email: user.username,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Unable to change password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(data?.message || "Password changed successfully.");
  };

  const handleSendResetEmail = async () => {
    if (!user?.username) return;
    setMessage("");
    setError("");

    const res = await fetch("/api/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Unable to send reset email.");
      return;
    }
    setMessage(data?.message || "Password reset email sent.");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-author-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      setAvatarUrl(json?.url || null);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Profile</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Your Account</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Update your profile, change display name, upload avatar, and manage your account settings.
              </p>
            </div>
            <button
              type="button"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
            className="rounded-lg bg-rose-600 hover:bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition shadow-lg"
          >
            Sign out
          </button>
        </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_0.85fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-500 text-2xl font-bold">A</div>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-400">Logged in as</p>
                <p className="mt-2 text-xl font-bold text-white">{user?.displayName}</p>
                <p className="text-sm text-slate-400">{user?.username}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white">Display Name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white">Email (read-only)</label>
                <input
                  value={user?.username ?? ""}
                  readOnly
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-400 outline-none"
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <h2 className="text-lg font-bold text-white">Password security</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Change your password by confirming the current password, or send yourself a Supabase reset email.
                </p>

                <div className="mt-5 grid gap-4">
                  <PasswordInput
                    label="Current Password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                    >
                      Send Reset Email
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">Profile Photo</label>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 file:text-white"
                  />
                  {uploading ? <span className="text-sm text-emerald-400">Uploading…</span> : null}
                </div>
              </div>

              {message ? <p className="rounded-lg bg-emerald-900/20 border border-emerald-700/30 px-4 py-3 text-sm text-emerald-400">{message}</p> : null}
              {error ? <p className="rounded-lg bg-rose-900/20 border border-rose-700/30 px-4 py-3 text-sm text-rose-400">{error}</p> : null}

              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition shadow-lg"
              >
                Save Profile
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Manage your account information and keep your profile up to date.
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
                <p className="font-semibold text-white">Display Name</p>
                <p className="mt-1 text-slate-400">This name appears across the admin and author dashboards.</p>
              </div>
              <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
                <p className="font-semibold text-white">Email / Username</p>
                <p className="mt-1 text-slate-400">Your sign-in email cannot be changed here.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Password</p>
                <p className="mt-1 text-slate-600">Set a new password if you want to update your login security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
