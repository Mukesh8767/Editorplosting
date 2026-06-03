import { getSupabaseAdmin } from "@/lib/supabase-client";
import { notFound } from "next/navigation";
import Link from "next/link";

const postSelect = `id, title, content, excerpt, slug, topic_id, status, reading_time, is_featured, cover_image_url, seo_title, seo_description, canonical_url, published_at, views_count, author_id, created_at, updated_at, author:profiles!author_id(full_name, username, email, avatar_url, author_image_url), post_tags(tags(id, title, slug))`;

const normalizeBlog = (post: any) => {
  const postTags = Array.isArray(post.post_tags)
    ? post.post_tags.map((item: any) => item.tags).filter(Boolean)
    : [];
  const tags = postTags.map((tag: any) => tag.title || tag.slug || "").filter(Boolean);

  const author = post.author
    ? {
        full_name: post.author.full_name ?? null,
        username: post.author.username ?? null,
        email: post.author.email ?? null,
        avatar_url: post.author.avatar_url ?? null,
        author_image_url: post.author.author_image_url ?? null,
      }
    : null;

  const authorName = author?.full_name || author?.username || "Unknown author";
  const authorAvatar = author?.avatar_url || author?.author_image_url || "/default-avatar.png";

  const { post_tags, created_at, updated_at, ...rest } = post;
  return {
    ...rest,
    author,
    authorName,
    authorAvatar,
    tags,
    createdAt: created_at ?? rest.createdAt,
    updatedAt: updated_at ?? rest.updatedAt,
  };
};

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: postData, error } = await supabaseAdmin
    .from("posts")
    .select(postSelect)
    .eq("slug", slug)
    .single();

  if (error || !postData) {
    notFound();
  }

  const post = normalizeBlog(postData);

  const extractText = (value: any) => {
    if (!value && value !== "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "object" && item !== null ? item.text || "" : String(item))).join("");
    }
    return String(value);
  };

  const contentBlocks = (() => {
    if (Array.isArray(post.content)) return post.content;
    if (typeof post.content === "string") {
      try {
        const parsed = JSON.parse(post.content);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return [{ id: "raw-content", type: "paragraph", data: { text: [{ text: post.content }] } }];
    }
    return [];
  })();

  return (
    <div className="app-shell min-h-screen relative overflow-hidden pb-20">
      {/* Soft abstract glows */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-[150px] -z-10" />

      {/* Glassmorphic Navbar */}
      <nav className="sticky top-0 w-full z-50 border-b border-white/60 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/posts" className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight hover:text-emerald-700 transition">
              Sustainability<span className="text-emerald-600">Journal</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/posts" className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition">
              Articles
            </Link>
            <Link href="/events" className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition">
              Events
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-emerald-600/10 transition"
            >
              Writer Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pt-8 md:pt-12">
        {/* Return Button with slide hover animation */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-500 transition mb-8 group"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1 inline-block">←</span> Back to Articles
        </Link>

        {/* Article Card Wrapper */}
        <article className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-2xl backdrop-blur-sm">
          
          <div className="p-6 sm:p-10 md:p-12">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(post.tags) && post.tags.length > 0
                ? post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 border border-emerald-100/50 px-3 py-1 text-xs font-bold text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))
                : null}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-slate-950 tracking-tight mt-6">
              {post.title}
            </h1>

            {/* Author details header section */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                <img src={post.authorAvatar} alt={post.authorName} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-slate-900 leading-tight">By {post.authorName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                  {post.reading_time ? ` · ${post.reading_time} min read` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Cover Media Section */}
          {post.cover_image_url ? (
            <div className="border-y border-slate-100 overflow-hidden bg-slate-50 shrink-0">
              {post.cover_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={post.cover_image_url} controls className="max-h-[500px] w-full object-cover" />
              ) : (
                <img src={post.cover_image_url} alt={post.title} className="max-h-[500px] w-full object-cover" />
              )}
            </div>
          ) : null}

          {/* Optimized Content Block Area */}
          <div className="article-prose px-6 py-8 sm:px-10 md:px-12 space-y-6">
            {contentBlocks.map((b: any) => {
              if (b.type === "heading") {
                return (
                  <h2 key={b.id} className="text-xl sm:text-2xl font-black text-slate-950 mt-8 mb-4 leading-snug">
                    {extractText(b.data?.text)}
                  </h2>
                );
              }
              if (b.type === "text" || b.type === "paragraph") {
                return (
                  <p key={b.id} className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {extractText(b.data?.text)}
                  </p>
                );
              }
              if (b.type === "image") {
                return (
                  <figure key={b.id} className="my-8 space-y-2">
                    <img
                      src={b.data.url}
                      alt={extractText(b.data?.caption) || b.data.alt || ""}
                      className="rounded-2xl border border-slate-100 shadow-md w-full object-cover max-h-[480px]"
                    />
                    {extractText(b.data?.caption) && (
                      <figcaption className="text-xs text-center text-slate-450 italic">
                        {extractText(b.data?.caption)}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (b.type === "video") {
                return (
                  <video
                    key={b.id}
                    controls
                    src={b.data.url}
                    className="my-8 rounded-2xl border border-slate-100 shadow-md w-full max-h-[480px]"
                  />
                );
              }
              return null;
            })}
          </div>

        </article>
      </main>
    </div>
  );
}
