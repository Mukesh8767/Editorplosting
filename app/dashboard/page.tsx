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
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const totalPublished = blogs.filter((blog) => blog.status === "published").length;
  const totalDrafts = blogs.filter((blog) => blog.status === "draft").length;
  const latestPosts = blogs.slice(0, 5);

  return (
    <div className="min-h-screen px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/92 p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">Author dashboard</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-slate-950">Sustainability Editor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Welcome back, {session?.displayName}. Review your content, continue drafts, and publish new articles from one focused workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              {session?.displayName}
            </span>
            <Link
              href="/dashboard/posts/create"
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
            >
              New Post
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Posts", value: blogs.length, hint: "Articles in your workspace", tone: "text-slate-950" },
          { label: "Published", value: totalPublished, hint: "Live on the public site", tone: "text-emerald-700" },
          { label: "Drafts", value: totalDrafts, hint: "Ready to continue", tone: "text-amber-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white/92 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
            <p className={`mt-3 text-4xl font-medium tracking-tight ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
        <section className="rounded-2xl border border-slate-200 bg-white/92 p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium text-slate-950">Recent Content</h2>
              <p className="mt-1 text-sm text-slate-600">Latest articles from your workspace.</p>
            </div>
            <Link href="/dashboard/posts" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all posts
            </Link>
          </div>

          {message ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}

          {latestPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-sm text-slate-600">You have not written any posts yet.</p>
              <Link
                href="/dashboard/posts/create"
                className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {latestPosts.map((blog) => {
                const publishedDate = blog.published_at
                  ? new Date(blog.published_at)
                  : new Date(blog.createdAt || blog.updatedAt);

                return (
                  <div
                    key={blog.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {blog.cover_image_url ? (
                          <img src={blog.cover_image_url} alt={blog.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs text-slate-500">Cover</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-medium text-slate-950">{blog.title || "Untitled"}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {publishedDate.toLocaleDateString()} -{" "}
                          <span className={blog.status === "published" ? "text-emerald-700" : "text-amber-700"}>
                            {blog.status || "draft"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/posts/${encodeURIComponent(blog.slug ?? blog.id)}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        View
                      </Link>
                      <Link href={`/dashboard/posts/create?id=${encodeURIComponent(blog.id)}`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(blog.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/92 p-6 shadow-sm">
          <h2 className="text-xl font-medium text-slate-950">Workspace Shortcuts</h2>
          <p className="mt-1 text-sm text-slate-600">Common actions without crowding the navigation.</p>

          <div className="mt-5 space-y-3">
            {[
              { href: "/dashboard/posts", title: "My Blog Posts", text: "Browse, edit, preview, or remove existing articles." },
              { href: "/dashboard/posts/create", title: "Write New Article", text: "Open the editor with metadata, blocks, and preview." },
              { href: "/dashboard/topics", title: "Categories", text: "Review topics and subtopics for organizing articles." },
              { href: "/dashboard/brochures", title: "Brochures", text: "Upload and manage supporting documents." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.text}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <Link href="/dashboard/profile" className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Profile Settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
