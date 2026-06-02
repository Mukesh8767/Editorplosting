"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const [post, setPost] = useState<any | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setPost(d))
      .catch(() => setPost(null));
  }, [slug]);

  if (!post) {
    return <div className="app-shell grid min-h-screen place-items-center p-8 text-slate-600">Loading article...</div>;
  }

  const authorName = post.author?.full_name || post.author?.username || post.authorName || "Unknown author";
  const authorAvatar = post.author?.avatar_url || post.author?.author_image_url || post.authorAvatarUrl || post.authorImageUrl || "/default-avatar.png";
  const extractText = (value: any) => {
    if (!value && value !== "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "object" && item !== null ? item.text || "" : String(item))).join("");
    }
    return String(value);
  };

  return (
    <div className="app-shell min-h-screen px-5 py-10">
      <main className="mx-auto max-w-4xl">
        <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(post.tags) && post.tags.length > 0
                ? post.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {tag}
                    </span>
                  ))
                : null}
            </div>

            <h1 className="responsive-heading mt-5 text-5xl font-bold leading-tight text-slate-950">{post.title}</h1>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
              <img src={authorAvatar} alt={authorName} className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
              <div>
                <div className="font-semibold text-slate-950">By {authorName}</div>
                <div className="text-sm text-slate-500">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</div>
              </div>
            </div>
          </div>

          {post.cover_image_url ? (
            post.cover_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={post.cover_image_url} controls className="max-h-[520px] w-full bg-slate-100 object-cover" />
            ) : (
              <img src={post.cover_image_url} alt={post.title} className="max-h-[520px] w-full object-cover" />
            )
          ) : null}

          <div className="article-prose px-7 py-8 sm:px-10">
            {Array.isArray(post.content) ? (
              post.content.map((b: any) => {
                if (b.type === "heading") return <h2 key={b.id}>{extractText(b.data?.text)}</h2>;
                if (b.type === "text" || b.type === "paragraph") return <p key={b.id}>{extractText(b.data?.text)}</p>;
                if (b.type === "image") return <img key={b.id} src={b.data.url} alt={extractText(b.data?.caption) || b.data.alt || ""} className="my-6 w-full" />;
                if (b.type === "video") return <video key={b.id} controls src={b.data.url} className="my-6 w-full" />;
                return null;
              })
            ) : (
              <p>{post.content_text || ""}</p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
