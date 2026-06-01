"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  clearSession,
  getUserBlogs,
  getSession,
  deleteBlog,
  type Blog,
  type User,
} from "@/lib/blog-store";

export default function AuthorDashboardPage() {
  const [session, setSession] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const loadBlogs = async (userId: string) => {
    try {
      const authorBlogs = await getUserBlogs(userId);
      setBlogs(authorBlogs || []);
    } catch (err) {
      console.error("Failed to load author blogs", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      const currentUser = getSession();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setSession(currentUser);
      await loadBlogs(currentUser.id);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlog(id);
      setMessage("Post deleted successfully.");
      if (session) {
        await loadBlogs(session.id);
      }
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  const totalPublished = blogs.filter((blog) => blog.status === "published").length;
  const totalDrafts = blogs.filter((blog) => blog.status === "draft").length;

  return (
    <div className="px-6 py-10 text-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur p-8 shadow-xl sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-400 font-bold">Author Dashboard</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Sustainability Editor</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-400">
            Welcome back, {session?.displayName}! Analyze your metrics, write articles, and organize your files.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm font-semibold text-emerald-400">
            {session?.displayName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg bg-rose-600 hover:bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition shadow-lg"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">My Total Posts</p>
          <p className="text-5xl font-bold text-white mt-4">{blogs.length}</p>
          <p className="text-slate-400 text-sm mt-2">Articles you created</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/30 rounded-xl p-6 shadow-lg">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Published</p>
          <p className="text-5xl font-bold text-emerald-400 mt-4">{totalPublished}</p>
          <p className="text-slate-400 text-sm mt-2">Live on the site</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-700/30 rounded-xl p-6 shadow-lg">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Drafts</p>
          <p className="text-5xl font-bold text-amber-400 mt-4">{totalDrafts}</p>
          <p className="text-slate-400 text-sm mt-2">Work in progress</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent Posts Feed */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white font-sans">Recent Content</h2>
              <p className="text-sm text-slate-400 mt-1">Review and manage your latest blog articles</p>
            </div>
            <Link
              href="/dashboard/posts/create"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition shadow-lg text-sm"
            >
              + New Post
            </Link>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-300 text-sm">
              ✓ {message}
            </div>
          )}

          <div className="space-y-4">
            {blogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-950/20">
                <p className="text-slate-400 mb-4">You haven't written any posts yet.</p>
                <Link
                  href="/dashboard/posts/create"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-semibold transition text-sm"
                >
                  Write Your First Post
                </Link>
              </div>
            ) : (
              blogs.slice(0, 5).map((blog) => {
                const publishedDate = blog.published_at
                  ? new Date(blog.published_at)
                  : new Date(blog.createdAt || Date.now());

                return (
                  <div
                    key={blog.id}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-950/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-800 shrink-0 border border-slate-700">
                        {blog.cover_image_url ? (
                          <img
                            src={blog.cover_image_url}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-slate-600">
                            Cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate max-w-sm sm:max-w-md">
                          {blog.title || "Untitled"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {publishedDate.toLocaleDateString()} •{" "}
                          <span
                            className={`capitalize font-semibold ${
                              blog.status === "published"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <Link
                        href={`/dashboard/posts/${encodeURIComponent(blog.slug ?? blog.id)}`}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/posts/create?id=${encodeURIComponent(blog.id)}`}
                        className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/30 text-emerald-400 rounded-lg text-sm font-semibold transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-700/30 text-rose-400 rounded-lg text-sm font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {blogs.length > 5 && (
            <div className="mt-6 text-center">
              <Link
                href="/dashboard/posts"
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                View all my {blogs.length} posts →
              </Link>
            </div>
          )}
        </section>

        {/* Quick Links Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <p className="text-sm text-slate-400 mt-1">Navigate your writer workspace quickly</p>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/posts"
                className="block p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/20 transition group"
              >
                <p className="text-emerald-400 font-bold group-hover:text-emerald-300 transition">My Blog Posts</p>
                <p className="text-xs text-slate-400 mt-1">Browse, view, edit or delete your existing stories.</p>
              </Link>

              <Link
                href="/dashboard/posts/create"
                className="block p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/20 transition group"
              >
                <p className="text-emerald-400 font-bold group-hover:text-emerald-300 transition">Write New Article</p>
                <p className="text-xs text-slate-400 mt-1">Create stories using block editor and check live layout.</p>
              </Link>

              <Link
                href="/dashboard/topics"
                className="block p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/20 transition group"
              >
                <p className="text-emerald-400 font-bold group-hover:text-emerald-300 transition">Categories</p>
                <p className="text-xs text-slate-400 mt-1">Explore all the topics and subtopics for sorting your articles.</p>
              </Link>

              <Link
                href="/dashboard/brochures"
                className="block p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/20 transition group"
              >
                <p className="text-emerald-400 font-bold group-hover:text-emerald-300 transition">My Brochures</p>
                <p className="text-xs text-slate-400 mt-1">Upload and manage PDFs and leaflets you published.</p>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <Link
              href="/dashboard/profile"
              className="block text-center py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
            >
              Configure Profile Settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
