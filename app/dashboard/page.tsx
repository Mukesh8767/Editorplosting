"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "../components/BlogEditor";
import {
  clearSession,
  createBlog,
  deleteBlog,
  getSession,
  getUserBlogs,
  getBlogById,
  type Blog as BlogType,
  type User,
} from "@/lib/blog-store";

export default function DashboardPage() {
  const [session, setSession] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const currentUser = getSession();
      if (!currentUser || currentUser.role === "admin") {
        router.push("/login");
        return;
      }
      setSession(currentUser);
      const blogs = await getUserBlogs(currentUser.id);
      setBlogs(blogs);
      setLoading(false);
    };

    load();
  }, [router]);

  const refreshBlogs = async (user: User) => {
    const updated = await getUserBlogs(user.id);
    setBlogs(updated);
  };

  const handleSave = async (title: string, content: string, tags: string[], id?: string) => {
    if (!session) return;
    const savedBlog = await createBlog(title, content, session, { id, tags });
    await refreshBlogs(session);
    setSelectedBlog(savedBlog);
  };

  const handleDelete = async (id: string) => {
    await deleteBlog(id);
    if (selectedBlog?.id === id) {
      setSelectedBlog(null);
    }
    if (session) {
      await refreshBlogs(session);
    }
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Author dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Create & Preview Content</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Write and edit your blogs. See live preview as you create. Only your content is visible.
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

        {session ? (
          <BlogEditor
            session={session}
            blogs={blogs}
            selectedBlog={selectedBlog}
            onSaved={handleSave}
            onSelect={(blog) => setSelectedBlog(blog)}
            onDelete={handleDelete}
            onNew={() => setSelectedBlog(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
