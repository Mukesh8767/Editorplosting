"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const [post, setPost] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setPost(d))
      .catch(() => setPost(null));
  }, [slug]);

  if (!post) return <div className="min-h-screen bg-slate-50 p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-3xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-white">{post.title}</h1>
        <div className="mt-6 flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-3">
            <img
              src={
                post.author?.avatar_url ||
                post.author?.author_image_url ||
                post.authorAvatarUrl ||
                post.authorImageUrl ||
                "/default-avatar.png"
              }
              alt={post.author?.full_name || post.author?.username || post.authorName || "Author"}
              className="h-12 w-12 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="text-white font-semibold">
                By {post.author?.full_name || post.author?.username || post.authorName || "Unknown author"}
              </div>
              <div className="text-slate-400">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</div>
            </div>
          </div>
          {Array.isArray(post.tags) && post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {post.cover_image_url ? (
          post.cover_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={post.cover_image_url} controls className="mt-8 w-full rounded-lg border border-slate-700" />
          ) : (
            <img src={post.cover_image_url} alt={post.title} className="mt-8 w-full rounded-lg border border-slate-700" />
          )
        ) : null}

        <article className="mt-8 prose prose-invert max-w-none space-y-6 text-slate-300">
          {Array.isArray(post.content) ? post.content.map((b: any) => {
            if (b.type === 'heading') return <h2 key={b.id} className="text-2xl font-bold text-white mt-6 mb-4">{b.data.text}</h2>;
            if (b.type === 'text') return <p key={b.id} className="text-slate-300 leading-7">{b.data.text}</p>;
            if (b.type === 'image') return <img key={b.id} src={b.data.url} alt={b.data.alt || ''} className="rounded-lg border border-slate-700 my-6" />;
            if (b.type === 'video') return <video key={b.id} controls src={b.data.url} className="w-full rounded-lg border border-slate-700 my-6" />;
            return null;
          }) : <p className="text-slate-300 leading-7">{post.content_text || ''}</p>}
        </article>
      </div>
    </div>
  );
}
