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
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading posts...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/92 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">Manage content</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-slate-950">My Blog Posts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Browse, preview, edit, or delete the articles you have created.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Back to Overview
            </Link>
            <Link href="/dashboard/posts/create" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800">
              Create New Post
            </Link>
          </div>
        </div>
      </header>

      {message ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white/92 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-medium text-slate-950">Articles</h2>
            <p className="mt-1 text-sm text-slate-600">A clean overview of your drafts and published posts.</p>
          </div>
          <span className="w-fit rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <p className="text-sm text-slate-600">No posts written yet. Start your first article now.</p>
            <Link href="/dashboard/posts/create" className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">
              Write Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const topic = topics.find((t) => t.id === post.topic_id);
              const publishedDate = post.published_at
                ? new Date(post.published_at)
                : new Date(post.createdAt || post.updatedAt);

              return (
                <article key={post.id} className="flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title || "Post cover"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-500">No cover image</div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {topic ? (
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          {topic.title}
                        </span>
                      ) : null}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        post.status === "published"
                          ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                          : "border-amber-100 bg-amber-50 text-amber-800"
                      }`}>
                        {post.status?.charAt(0).toUpperCase()}{post.status?.slice(1)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-medium leading-snug text-slate-950">{post.title || "Untitled"}</h3>
                    <p className="mt-2 text-xs text-slate-500">Updated {publishedDate.toLocaleDateString()}</p>

                    <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                      <Link href={`/dashboard/posts/${encodeURIComponent(post.slug ?? post.id)}`} className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50">
                        View
                      </Link>
                      <Link href={`/dashboard/posts/create?id=${encodeURIComponent(post.id)}`} className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-center text-xs font-medium text-emerald-800 hover:bg-emerald-100">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100" title="Delete Post">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
