"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getUsers,
  deleteUser,
  createUser,
  updateUser,
  type User,
} from "@/lib/blog-store";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [authorImageUrl, setAuthorImageUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await getUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const uploadAuthorImage = async (file: File) => {
    try {
      setPhotoError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-author-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Upload failed.");
      }

      const { url } = await response.json();
      setAuthorImageUrl(url);
    } catch (uploadError) {
      setPhotoError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload author photo."
      );
      console.error(uploadError);
    }
  };

  const handleCreateOrUpdateUser = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      if (!displayName.trim()) {
        setError("Please fill in all fields.");
        setMessage("");
        return;
      }

      if (editingUser) {
        // Update mode
        if (!password) {
          setError("Please enter a new password to update the user.");
          return;
        }
        await updateUser(
          editingUser.id,
          displayName.trim(),
          password,
          authorImageUrl
        );
        setMessage(`Updated user ${displayName} successfully.`);
      } else {
        // Create mode
        if (!username.trim() || !password) {
          setError("Please fill in all fields.");
          setMessage("");
          return;
        }
        await createUser(
          username.trim(),
          displayName.trim(),
          password,
          authorImageUrl || null
        );
        setMessage(`Created user ${displayName} successfully.`);
      }

      setUsername("");
      setDisplayName("");
      setPassword("");
      setAuthorImageUrl(null);
      setError("");
      setEditingUser(null);

      // Refresh users list
      const allUsers = await getUsers();
      setUsers(allUsers);

      // Close form after 2 seconds
      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("");
      setError(
        error instanceof Error ? error.message : "Unable to save user."
      );
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDisplayName(user.displayName);
    setUsername(user.username);
    setPassword("");
    setAuthorImageUrl(user.avatarUrl || null);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);
      const allUsers = await getUsers();
      setUsers(allUsers);
      setMessage("User deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete user."
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setUsername("");
    setDisplayName("");
    setPassword("");
    setAuthorImageUrl(null);
    setError("");
    setMessage("");
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setUsername("");
    setDisplayName("");
    setPassword("");
    setAuthorImageUrl(null);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Bar */}
      <div className="w-full bg-slate-900 border-b-2 border-emerald-500 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Sustainability Studio</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
              Admin
            </Link>
            <Link href="/login" className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Author Users</h2>
            <p className="text-slate-400">Manage all authors and their accounts</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition"
          >
            + Create User
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <p className="text-slate-300">Total Authors: <span className="text-emerald-400 font-bold text-xl">{users.length}</span></p>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-lg border-2 border-dashed border-slate-700">
              <p className="text-slate-400 text-lg mb-4">No authors yet</p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition"
              >
                Create First Author
              </button>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-emerald-500 transition">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{user.displayName}</h3>
                    <p className="text-slate-400 text-sm">{user.username} • {user.role}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-8 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-2">
              {editingUser ? "Edit Author" : "Create New Author"}
            </h3>
            <p className="text-slate-400 mb-6">
              {editingUser ? "Update author details" : "Add a new author to the system"}
            </p>

            <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-white font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-white font-bold mb-2">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  {editingUser ? "New Password" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAuthorImage(file);
                  }}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-400"
                />
                {photoError && <p className="text-rose-400 text-sm mt-1">{photoError}</p>}
              </div>

              {message && (
                <div className="p-3 bg-emerald-900 border border-emerald-700 rounded text-emerald-200 text-sm">
                  ✓ {message}
                </div>
              )}
              {error && (
                <div className="p-3 bg-rose-900 border border-rose-700 rounded text-rose-200 text-sm">
                  ✕ {error}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-semibold transition"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
