"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlockEditor, { type Block } from "./BlockEditor";
import {
  getAllBlogs,
  getSession,
  getTopics,
  getUsers,
  type Blog,
  type Topic,
  type User,
} from "@/lib/blog-store";

type FormTopic = Topic & { parent_id: string | null };

export default function AdminPostsPage() {
  const [session, setSession] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<FormTopic[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [status, setStatus] = useState("draft");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const current = getSession();
      if (!current || current.role !== "admin") {
        router.push("/login");
        return;
      }
      setSession(current);
      setUsers(await getUsers());
      setTopics(await getTopics());
      setPosts(await getAllBlogs());
    };
    load();
  }, [router]);

  const refreshPosts = async () => {
    setPosts(await getAllBlogs());
  };

  const mainCategories = topics.filter((t) => !t.parent_id);
  const subCategories = topics.filter((t) => t.parent_id === topicId);

  const getPreviewText = (post: Blog) => {
    if (post.excerpt) return post.excerpt;
    const raw = typeof post.content === "string" ? post.content : JSON.stringify(post.content || "");
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const text = parsed
          .map((block: any) => {
            if (block.type === "heading" || block.type === "paragraph") return block.data?.text?.map((span: any) => span.text).join(" ");
            if (block.type === "image") return block.data?.caption?.map((span: any) => span.text).join(" ") || "[image]";
            return "";
          })
          .filter(Boolean)
          .join(" ");
        return text.length > 180 ? `${text.slice(0, 180)}...` : text;
      }
    } catch {
      // fall back to raw text
    }
    return raw.length > 180 ? `${raw.slice(0, 180)}...` : raw;
  };

  const handleSave = async (publish = false) => {
    setMessage("");
    if (!title.trim() || blocks.length === 0 || !authorId) {
      setMessage("Title, content and author are required.");
      return;
    }

    const payload: any = {
      title: title.trim(),
      content: JSON.stringify(blocks),
      excerpt: excerpt || null,
      slug: slug || null,
      topic_id: subtopicId || topicId,
      authorId,
      status: publish ? "published" : status,
      published_at: publish ? new Date().toISOString() : null,
    };

    const res = await fetch("/api/blogs", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Saved post successfully.");
      setTitle("");
      setBlocks([]);
      setExcerpt("");
      setSlug("");
      await refreshPosts();
    } else {
      setMessage(data?.error || "Unable to save post.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Admin Posts</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Manage All Posts</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-400">
                Browse, preview, edit, and manage all blog posts. Create new content from the admin editor.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/admin/posts/create"
                className="inline-flex items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition shadow-lg"
              >
                + Create Post
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">All Posts</h2>
                  <p className="mt-2 text-sm text-slate-400">Click any post to open the full admin preview page or edit.</p>
                </div>
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-400">
                  {posts.length} Posts
                </span>
              </div>

              <div className="mt-6 grid gap-4 grid-cols-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/50 p-6 text-slate-500 col-span-full">
                    No posts available yet.
                  </div>
                ) : (
                  posts.map((post) => {
                    const topic = topics.find((topic) => topic.id === post.topic_id);
                    const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.updatedAt);

                    return (
                      <div key={post.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60 shadow-xl transition hover:border-emerald-500/40 hover:bg-slate-900/80">
                        {post.cover_image_url ? (
                          <div className="relative h-24 overflow-hidden bg-slate-800">
                            <img
                              src={post.cover_image_url}
                              alt={post.title || "Post cover"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-24 items-center justify-center bg-slate-800 text-xs text-slate-500">
                            No cover
                          </div>
                        )}

                        <div className="space-y-2 p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-700 shrink-0 border border-slate-600">
                              <img
                                src={`/default-avatar.png`}
                                alt={post.authorName || "Author"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{post.authorName || "Unknown"}</p>
                              <p className="text-xs text-slate-400">{publishedDate.toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-white line-clamp-2">{post.title || "Untitled"}</h3>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {topic ? (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                                {topic.title}
                              </span>
                            ) : null}
                            {post.status ? (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                post.status === "published"
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                              }`}>
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            <Link
                              href={`/admin/posts/${encodeURIComponent(post.slug ?? post.id)}`}
                              className="rounded-lg border border-blue-700/30 bg-blue-600/20 px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-600/30 transition"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/posts/create?id=${encodeURIComponent(post.id)}`}
                              className="rounded-lg border border-emerald-700/30 bg-emerald-600/20 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={async () => {
                                if (!confirm("Delete post?")) return;
                                await fetch(`/api/blogs?id=${encodeURIComponent(post.id)}`, { method: "DELETE" });
                                await refreshPosts();
                              }}
                              className="rounded-lg border border-rose-700/30 bg-rose-600/20 px-2 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-600/30 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
