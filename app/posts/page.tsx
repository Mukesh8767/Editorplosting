"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  cover_image_url?: string | null;
  author?: { full_name?: string };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 mb-8">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-4xl font-bold text-white">Articles</h1>
          <p className="mt-2 text-slate-400">Latest published content from our authors</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-lg">No articles published yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((p) => (
              <article key={p.id} className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 hover:border-emerald-500/50 transition group">
                <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition">
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                {p.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-slate-400 line-clamp-2">{p.excerpt}</p>
                <div className="mt-4 text-sm text-slate-500">
                  <span className="text-slate-300">{p.author?.full_name}</span> • {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
