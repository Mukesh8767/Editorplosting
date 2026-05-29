"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  clearSession,
  getAllBlogs,
  getSession,
  getUsers,
  deleteUser,
  createUser,
  updateUser,
  type Blog,
  type User,
} from "@/lib/blog-store";

export default function AdminPage() {
  const [session, setSession] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const currentUser = getSession();
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login");
        return;
      }
      setSession(currentUser);
      setBlogs(await getAllBlogs());
      setUsers(await getUsers());
    };

    load();
  }, [router]);

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!displayName.trim()) {
        setError("Display name is required.");
        return;
      }

      if (editingUser) {
        if (!password) {
          setError("Password is required to update user.");
          return;
        }
        await updateUser(editingUser.id, displayName.trim(), password);
        setMessage("User updated successfully!");
      } else {
        if (!username.trim() || !password) {
          setError("Email and password are required.");
          return;
        }
        await createUser(username.trim(), displayName.trim(), password);
        setMessage("User created successfully!");
      }

      setUsername("");
      setDisplayName("");
      setPassword("");
      setError("");
      setEditingUser(null);

      const allUsers = await getUsers();
      setUsers(allUsers);

      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(userId);
      const allUsers = await getUsers();
      setUsers(allUsers);
      setMessage("User deleted successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDisplayName(user.displayName);
    setUsername(user.username);
    setPassword("");
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  const totalPublished = blogs.filter((blog) => blog.status === "published").length;
  const totalDrafts = blogs.filter((blog) => blog.status === "draft").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Sustainability Studio</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm font-semibold">
              {session?.displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Total Posts</p>
            <p className="text-5xl font-bold text-white mt-4">{blogs.length}</p>
            <p className="text-slate-400 text-sm mt-2">All articles in system</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/30 rounded-xl p-6 shadow-lg">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Published</p>
            <p className="text-5xl font-bold text-emerald-400 mt-4">{totalPublished}</p>
            <p className="text-slate-400 text-sm mt-2">Live on website</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-700/30 rounded-xl p-6 shadow-lg">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Drafts</p>
            <p className="text-5xl font-bold text-amber-400 mt-4">{totalDrafts}</p>
            <p className="text-slate-400 text-sm mt-2">Being edited</p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Author Users</h2>
              <p className="text-slate-400 mt-1">Manage author accounts and permissions</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setUsername("");
                setDisplayName("");
                setPassword("");
                setError("");
                setMessage("");
                setShowForm(true);
              }}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition shadow-lg"
            >
              + Add Author
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-slate-300">
              Total Authors: <span className="text-emerald-400 font-bold text-lg">{users.length}</span>
            </p>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No authors yet. Create one to get started.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
                >
                  Create First Author
                </button>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition group"
                >
                  <div className="flex-1">
                    <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {user.username} • <span className="capitalize text-slate-300">{user.role}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/posts"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800/50 transition"
            >
              <p className="text-emerald-400 font-bold">Manage Posts</p>
              <p className="text-xs text-slate-400 mt-1">Edit, create, and publish content</p>
            </Link>
            <Link
              href="/admin/topics"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800/50 transition"
            >
              <p className="text-emerald-400 font-bold">Categories</p>
              <p className="text-xs text-slate-400 mt-1">Organize content by topics</p>
            </Link>
            <Link
              href="/admin/profile"
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800/50 transition"
            >
              <p className="text-emerald-400 font-bold">My Profile</p>
              <p className="text-xs text-slate-400 mt-1">Manage your account settings</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 w-full max-w-md max-h-screen overflow-y-auto shadow-2xl">
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
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-white font-bold mb-2">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
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
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              {message && (
                <div className="p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-200 text-sm">
                  ✓ {message}
                </div>
              )}
              {error && (
                <div className="p-3 bg-rose-900/50 border border-rose-700 rounded-lg text-rose-200 text-sm">
                  ✕ {error}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
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
