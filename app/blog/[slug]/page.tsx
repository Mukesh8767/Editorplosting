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
    <div className="app-shell min-h-screen pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/posts" className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tight text-slate-950 transition hover:text-emerald-700">
              Sustainability<span className="text-emerald-600">Journal</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/posts" className="text-sm font-medium text-slate-900 transition hover:text-emerald-700">
              Articles
            </Link>
            <Link href="/events" className="text-sm font-medium text-slate-600 transition hover:text-emerald-700">
              Events
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
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
          className="group mb-8 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1 inline-block">←</span> Back to Articles
        </Link>

        {/* Article Card Wrapper */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-md">
          
          <div className="p-6 sm:p-10 md:p-12">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(post.tags) && post.tags.length > 0
                ? post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))
                : null}
            </div>

            {/* Title */}
            <h1 className="mt-6 text-3xl font-medium leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {/* Author details header section */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                <img src={post.authorAvatar} alt={post.authorName} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-medium leading-tight text-slate-900">By {post.authorName}</div>
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
                  <h2 key={b.id} className="mb-4 mt-8 text-xl font-medium leading-snug text-slate-950 sm:text-2xl">
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
