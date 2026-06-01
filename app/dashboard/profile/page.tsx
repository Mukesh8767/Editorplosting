"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession, setSession, type User } from "@/lib/blog-store";

export default function AuthorProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
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

    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

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
    setNewPassword("");
    setMessage("Profile updated successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-author-photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed.");
      }
      setAvatarUrl(data.url || null);
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="px-6 py-10 text-white min-h-screen font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400 font-bold">Profile Settings</p>
              <h1 className="mt-3 text-4xl font-bold text-white font-sans font-sans">My Account</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Configure your writer settings, set display names, upload your profile avatar, and set passwords.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition shadow-lg shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Edit Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-800 mb-6">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-800 border border-slate-700 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-500 text-2xl font-bold font-sans">A</div>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-400 font-bold">Uploader Account</p>
                <p className="mt-1 text-xl font-bold text-white">{user?.displayName}</p>
                <p className="text-sm text-slate-450">{user?.username}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-205">Display Name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-205">Email / Username (read-only)</label>
                <input
                  value={user?.username ?? ""}
                  readOnly
                  className="mt-3 w-full rounded-lg border border-slate-750 bg-slate-950/60 px-4 py-3 text-slate-500 outline-none text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-205">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-550 outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-205">Profile Photo</label>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-emerald-500 file:text-slate-950 file:font-bold file:text-xs hover:file:bg-emerald-450 transition cursor-pointer"
                  />
                  {uploading ? <span className="text-xs text-emerald-450 font-bold">Uploading…</span> : null}
                </div>
              </div>

              {message ? <p className="rounded-lg bg-emerald-950/60 border border-emerald-800 px-4 py-3 text-sm text-emerald-350">✓ {message}</p> : null}
              {error ? <p className="rounded-lg bg-rose-955/20 border border-rose-900/30 px-4 py-3 text-sm text-rose-350">✕ {error}</p> : null}

              <button
                type="button"
                onClick={handleSave}
                className="w-full mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-bold text-slate-950 transition shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Account Details / Stats Cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white font-sans">Account Details</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your account is configured with Author level permissions. This lets you contribute stories and brochures to the Sustainability platform.
              </p>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="rounded-lg bg-slate-950/40 border border-slate-800 p-4">
                  <p className="font-semibold text-white">Public Profile</p>
                  <p className="mt-1 text-slate-450 text-xs">Your display name and photo are shown on published articles.</p>
                </div>
                <div className="rounded-lg bg-slate-950/40 border border-slate-800 p-4">
                  <p className="font-semibold text-white">Security</p>
                  <p className="mt-1 text-slate-455 text-xs">Always use a strong, unique password to prevent unauthorized login.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500 font-medium">Platform Role: AUTHOR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
