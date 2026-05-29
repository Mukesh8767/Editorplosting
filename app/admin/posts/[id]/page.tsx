import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-client";

type Props = {
  params: {
    id: string;
  };
};

const postSelect = `id, title, content, excerpt, slug, topic_id, status, reading_time, is_featured, cover_image_url, seo_title, seo_description, canonical_url, published_at, views_count, author_id, created_at, updated_at, author:profiles!author_id(full_name, username, email)`;

const renderBlock = (block: any) => {
  if (!block || typeof block !== "object") return null;

  const extractText = (value: any) => {
    if (!value && value !== "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "object" && item !== null ? item.text || "" : String(item)))
        .join("");
    }
    return String(value);
  };

  if (block.type === "heading") {
    return (
      <h2 key={block.id || Math.random()} className="mt-8 text-2xl font-semibold text-slate-950">
        {extractText(block.data?.text)}
      </h2>
    );
  }

  if (block.type === "paragraph" || block.type === "text") {
    return (
      <p key={block.id || Math.random()} className="mt-4 leading-8 text-slate-700 whitespace-pre-wrap">
        {extractText(block.data?.text)}
      </p>
    );
  }

  if (block.type === "image") {
    const altText = extractText(block.data?.caption) || block.data?.alt || "Blog image";
    return (
      <figure key={block.id || Math.random()} className="my-6">
        <img
          src={block.data?.url}
          alt={altText}
          className="w-full rounded-3xl border border-slate-200 object-cover"
        />
        {altText ? <figcaption className="mt-2 text-sm text-slate-600">{altText}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "video") {
    return (
      <video
        key={block.id || Math.random()}
        src={block.data?.url}
        controls
        className="my-6 w-full rounded-3xl border border-slate-200"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return null;
};

const parseContentBlocks = (content: any) => {
  if (Array.isArray(content)) return content;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [
        {
          id: "raw-content",
          type: "text",
          data: { text: content },
        },
      ];
    }
  }
  if (content && typeof content === "object") {
    return [content];
  }
  return [];
};

export default async function AdminPostDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams?.id === "undefined" ? undefined : resolvedParams?.id;
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <Link href="/admin" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition">
            ← Back to admin
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Invalid blog link</h1>
          <p className="mt-3 text-slate-400">This blog post link is invalid. Return to the admin dashboard and choose another post.</p>
        </div>
      </div>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const idLookup = id;
  const { data: postById, error: idError } = await supabaseAdmin.from("posts").select(postSelect).eq("id", idLookup).maybeSingle();
  let post = postById;
  let error = idError;

  if (!post) {
    const { data: postBySlug, error: slugError } = await supabaseAdmin.from("posts").select(postSelect).eq("slug", idLookup).single();
    post = postBySlug;
    error = slugError;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <Link href="/admin" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition">
            ← Back to admin
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Blog not found</h1>
          <p className="mt-3 text-slate-400">We couldn’t load that blog post. Please return to the admin dashboard and try again.</p>
          {error?.message ? (
            <p className="mt-3 rounded-2xl bg-rose-900/20 border border-rose-700/30 p-4 text-sm text-rose-200">Error: {error.message}</p>
          ) : null}
        </div>
      </div>
    );
  }

  const blocks = parseContentBlocks(post.content);
  const author = Array.isArray(post.author) ? post.author[0] : post.author;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <Link href="/admin" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition">
            ← Back to admin
          </Link>
          <div className="mt-6 space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Admin preview</p>
            <h1 className="text-4xl font-bold">{post.title || "Untitled post"}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {author ? (
                <div className="flex items-center gap-3 rounded-full bg-slate-800 px-3 py-2">
                  <img
                    src={author.avatar_url || author.author_image_url || "/default-avatar.png"}
                    alt={author.full_name || author.username || "Author"}
                    className="h-10 w-10 rounded-full object-cover border border-slate-700"
                  />
                  <span>{author.full_name || author.username || "Unknown author"}</span>
                </div>
              ) : (
                <span>{author?.full_name || author?.username || "Unknown author"}</span>
              )}
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.updated_at).toLocaleDateString()}</span>
              {post.status ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {post.status}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {post.cover_image_url ? (
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            {post.cover_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={post.cover_image_url} controls className="w-full object-cover" />
            ) : (
              <img src={post.cover_image_url} alt={post.title || "Cover image"} className="w-full object-cover" />
            )}
          </div>
        ) : null}

        <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl prose prose-invert max-w-none">
          {post.excerpt ? <p className="text-slate-300">{post.excerpt}</p> : null}
          {blocks.length > 0 ? (
            blocks.map((block: any) => renderBlock(block))
          ) : (
            <p className="mt-4 leading-8 text-slate-300 whitespace-pre-wrap">
              {typeof post.content === "string"
                ? post.content
                : "No content blocks are available for this post."}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
