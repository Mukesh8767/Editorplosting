import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-client";

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
  const authorImageUrl = author?.author_image_url || author?.avatar_url || null;
  const authorAvatarUrl = author?.avatar_url || author?.author_image_url || null;

  const { post_tags, created_at, updated_at, ...rest } = post;
  return {
    ...rest,
    author,
    authorName,
    authorImageUrl,
    authorAvatarUrl,
    tags,
    createdAt: created_at ?? rest.createdAt,
    updatedAt: updated_at ?? rest.updatedAt,
  };
};

export default async function PostsPage() {
  let posts: Post[] = [];
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(postSelect)
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      posts = data.map(normalizeBlog);
    }
  } catch (e) {
    console.error("Error fetching posts on server:", e);
  }

  return (
    <div className="app-shell min-h-screen pb-16 text-slate-900">
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

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        
        {/* Centered Hero Section */}
        <header className="mx-auto mb-16 max-w-3xl space-y-5 text-center">
          <span className="inline-block rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-800">
            Journal Publications
          </span>
          <h1 className="pt-2 text-4xl font-medium leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
            Sustainability Articles
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            Discover insights, reports, and actionable guides written by authors dedicated to environmental monitoring and green technology.
          </p>
        </header>

        {/* Posts Grid Layout */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm">
            <p className="text-base font-medium text-slate-500">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md"
              >
                {/* Image Section with Zoom Effect */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-emerald-50 text-xs font-medium text-emerald-700">
                      Article
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    {/* Tags */}
                    {p.tags?.length ? (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Title */}
                    <h2 className="line-clamp-2 text-lg font-medium leading-snug text-slate-950 transition duration-300 group-hover:text-emerald-700">
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {p.excerpt}
                    </p>
                  </div>

                  {/* Author / Date Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={p.author?.avatar_url || p.author?.author_image_url || "/default-avatar.png"}
                        alt={p.author?.full_name || p.author?.username || "Author"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">
                        {p.author?.full_name || p.author?.username || p.authorName || "Unknown author"}
                      </p>
                      <p className="text-[10px] text-slate-450 font-medium">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
                      </p>
                    </div>
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
