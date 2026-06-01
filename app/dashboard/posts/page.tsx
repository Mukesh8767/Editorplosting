"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUserBlogs,
  getSession,
  getTopics,
  deleteBlog,
  type Blog,
  type Topic,
  type User,
} from "@/lib/blog-store";

export default function AuthorPostsPage() {
  const [session, setSession] = useState<User | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async (userId: string) => {
    try {
      const allTopics = await getTopics();
      setTopics(allTopics || []);
      const userPosts = await getUserBlogs(userId);
      setPosts(userPosts || []);
    } catch (error) {
      console.error("Failed to load author posts data", error);
      setMessage("Unable to load your posts. Please refresh.");
    }
  };

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.push("/login");
      return;
    }
    setSession(current);
    loadData(current.id).then(() => setLoading(false));
  }, [router]);

  const refreshPosts = async () => {
    if (session) {
      const userPosts = await getUserBlogs(session.id);
      setPosts(userPosts || []);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBlog(id);
      setMessage("Post deleted successfully.");
      await refreshPosts();
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="px-6 py-10 text-white min-h-screen font-sans">
      <header className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur p-8 shadow-xl mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-400 font-bold">Manage Content</p>
            <h1 className="mt-3 text-4xl font-bold text-white font-sans">My Blog Posts</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-400">
              Browse, view, edit, or delete the articles you have created. You can see only your own articles.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition border border-slate-700"
            >
              ← Back to Overview
            </Link>
            <Link
              href="/dashboard/posts/create"
              className="inline-flex items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-sm font-semibold text-slate-950 transition font-bold shadow-lg"
            >
              + Create New Post
            </Link>
          </div>
        </div>
      </header>

      {message && (
        <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-700 rounded-xl text-emerald-300 text-sm">
          ✓ {message}
        </div>
      )}

      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center pb-6 border-b border-slate-850 mb-6">
          <h2 className="text-2xl font-bold text-white font-sans">Articles</h2>
          <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-sm font-semibold text-emerald-400">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </span>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
              <p className="text-slate-500 text-lg mb-4">No posts written yet. Start your first article now!</p>
              <Link
                href="/dashboard/posts/create"
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold transition inline-block text-sm"
              >
                Write Post
              </Link>
            </div>
          ) : (
            posts.map((post) => {
              const topic = topics.find((t) => t.id === post.topic_id);
              const publishedDate = post.published_at
                ? new Date(post.published_at)
                : new Date(post.createdAt || Date.now());

              return (
                <div
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 shadow-lg hover:border-emerald-500/40 hover:bg-slate-950/70 transition duration-350"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-850">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title || "Post cover"}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-600 text-sm font-semibold bg-slate-900">
                        No cover image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col p-5 justify-between">
                    <div>
                      {/* Topic & Status Tag */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {topic && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-xs text-emerald-400 font-medium">
                            {topic.title}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            post.status === "published"
                              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                              : "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                          }`}
                        >
                          {post.status?.charAt(0).toUpperCase()}{post.status?.slice(1)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug mb-2 hover:text-emerald-400 transition cursor-pointer">
                        {post.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Updated {publishedDate.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-850">
                      <Link
                        href={`/dashboard/posts/${encodeURIComponent(post.slug ?? post.id)}`}
                        className="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-lg text-xs font-bold transition border border-slate-700"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/posts/create?id=${encodeURIComponent(post.id)}`}
                        className="flex-1 text-center py-2 bg-emerald-600/10 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-700/20 rounded-lg text-xs font-bold transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 bg-rose-600/10 hover:bg-rose-600/25 text-rose-450 border border-rose-700/20 rounded-lg transition"
                        title="Delete Post"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
