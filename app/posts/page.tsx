"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  cover_image_url?: string | null;
  author?: {
    full_name?: string;
    username?: string;
    avatar_url?: string | null;
    author_image_url?: string | null;
  };
  authorName?: string;
  published_at?: string | null;
  tags?: string[];
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/blogs?status=published")
      .then((r) => r.json())
      .then((d) => setPosts(d || []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="app-shell min-h-screen px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl border border-white/70 bg-white/75 p-7 shadow-xl backdrop-blur sm:p-10">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-700">Sustainability Journal</p>
          <h1 className="responsive-heading mt-3 text-5xl font-bold text-slate-950">Articles</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Latest published content from our authors.</p>
        </header>

        {posts.length === 0 ? (
          <div className="studio-panel rounded-3xl p-10 text-center">
            <p className="text-lg font-medium text-slate-600">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {posts.map((p) => (
              <article key={p.id} className="subtle-card grid overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl md:grid-cols-[220px_1fr]">
                <div className="min-h-48 bg-slate-100 md:min-h-full">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full min-h-48 place-items-center bg-emerald-50 text-sm font-semibold text-emerald-700">Article</div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-950 transition hover:text-emerald-700">
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h2>
                  {p.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-3 line-clamp-2 text-slate-600">{p.excerpt}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <img
                      src={p.author?.avatar_url || p.author?.author_image_url || "/default-avatar.png"}
                      alt={p.author?.full_name || p.author?.username || "Author"}
                      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                    />
                    <span className="font-semibold text-slate-700">
                      {p.author?.full_name || p.author?.username || p.authorName || "Unknown author"}
                    </span>
                    <span>•</span>
                    <span>{p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
