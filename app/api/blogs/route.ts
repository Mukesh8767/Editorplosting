import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-client";
import { revalidatePath } from "next/cache";

const postSelect = `id, title, content, excerpt, slug, topic_id, status, reading_time, is_featured, cover_image_url, seo_title, seo_description, canonical_url, published_at, views_count, author_id, created_at, updated_at, author:profiles!author_id(full_name, username, email, avatar_url, author_image_url), post_tags(tags(id, title, slug))`;
const postListSelect = `id, title, excerpt, slug, topic_id, status, reading_time, is_featured, cover_image_url, seo_title, seo_description, canonical_url, published_at, views_count, author_id, created_at, updated_at, author:profiles!author_id(full_name, username, email, avatar_url, author_image_url), post_tags(tags(id, title, slug))`;

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

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const blogId = request.nextUrl.searchParams.get("id");
  const slug = request.nextUrl.searchParams.get("slug");

  const supabaseAdmin = getSupabaseAdmin();
  let baseQuery;
  if (blogId || slug) {
    baseQuery = supabaseAdmin.from("posts").select(postSelect).order("updated_at", { ascending: false });
  } else {
    baseQuery = supabaseAdmin.from("posts").select(postListSelect).order("updated_at", { ascending: false });
  }

  if (blogId) {
    const { data, error } = await baseQuery.eq("id", blogId).single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ? normalizeBlog(data) : null);
  }

  if (slug) {
    const { data, error } = await baseQuery.eq("slug", slug).single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ? normalizeBlog(data) : null);
  }

  if (userId) {
    const { data, error } = await baseQuery.eq("author_id", userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(Array.isArray(data) ? data.map(normalizeBlog) : []);
  }

  const { data, error } = await baseQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(Array.isArray(data) ? data.map(normalizeBlog) : []);
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = await request.json();

  const {
    id,
    title,
    content,
    authorId,
    excerpt,
    slug,
    topic_id,
    status,
    reading_time,
    is_featured,
    cover_image_url,
    seo_title,
    seo_description,
    canonical_url,
    published_at,
    tags,
  } = payload;

  if (!title || !content || !authorId) {
    return NextResponse.json({ error: "Missing required blog fields." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const normalizedTags = Array.isArray(tags)
    ? [...new Set(tags.map((tag: string) => tag.trim()).filter(Boolean))]
    : [];

  const values: any = {
    title,
    content,
    excerpt: excerpt ?? null,
    slug: slug ?? null,
    topic_id: topic_id ?? null,
    status: status ?? "draft",
    reading_time: reading_time ?? null,
    is_featured: is_featured ?? false,
    cover_image_url: cover_image_url ?? null,
    seo_title: seo_title ?? null,
    seo_description: seo_description ?? null,
    canonical_url: canonical_url ?? null,
    published_at: published_at ?? null,
    author_id: authorId,
    updated_at: now,
  };

  const manageTags = async (postId: string) => {
    if (normalizedTags.length === 0) {
      await supabaseAdmin.from("post_tags").delete().eq("post_id", postId);
      return;
    }

    const tagPayload = normalizedTags.map((tag) => {
      const slugValue = tag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return { title: tag, slug: slugValue };
    });

    const tagSlugs = tagPayload.map((item) => item.slug);
    const { data: existingTags, error: existingError } = await supabaseAdmin
      .from("tags")
      .select("id, title, slug")
      .in("slug", tagSlugs);

    if (existingError) {
      throw existingError;
    }

    const existingMap = new Map<string, { id: string; title: string; slug: string }>();
    existingTags?.forEach((tag: any) => existingMap.set(tag.slug, tag));

    const missingTags = tagPayload.filter((tag) => !existingMap.has(tag.slug));
    if (missingTags.length > 0) {
      const { data: insertedTags, error: insertError } = await supabaseAdmin
        .from("tags")
        .insert(missingTags)
        .select("id, title, slug");

      if (insertError) {
        throw insertError;
      }

      insertedTags?.forEach((tag: any) => existingMap.set(tag.slug, tag));
    }

    const tagIds = Array.from(existingMap.values()).map((tag) => tag.id);
    await supabaseAdmin.from("post_tags").delete().eq("post_id", postId);
    const relationships = tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }));
    await supabaseAdmin.from("post_tags").insert(relationships);
  };

  if (id) {
    const { data, error } = await supabaseAdmin.from("posts").update(values).eq("id", id).select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const savedPost = data?.[0];
    if (savedPost) {
      try {
        await manageTags(savedPost.id);
      } catch (tagError: any) {
        return NextResponse.json({ error: tagError.message || "Unable to update tags." }, { status: 500 });
      }
    }

    const { data: refreshedPost, error: refreshedError } = await supabaseAdmin
      .from("posts")
      .select(postSelect)
      .eq("id", id)
      .single();

    if (refreshedError) return NextResponse.json({ error: refreshedError.message }, { status: 500 });

    revalidatePath("/posts");
    revalidatePath("/blog/[slug]");
    if (refreshedPost?.slug) {
      revalidatePath(`/blog/${refreshedPost.slug}`);
    }

    return NextResponse.json(refreshedPost ? normalizeBlog(refreshedPost) : null);
  }

  values.created_at = now;

  const { data, error } = await supabaseAdmin.from("posts").insert([values]).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const savedPost = data?.[0];
  if (savedPost) {
    try {
      await manageTags(savedPost.id);
    } catch (tagError: any) {
      return NextResponse.json({ error: tagError.message || "Unable to create tags." }, { status: 500 });
    }
  }

  const { data: refreshedPost, error: refreshedError } = await supabaseAdmin
    .from("posts")
    .select(postSelect)
    .eq("id", savedPost.id)
    .single();

  if (refreshedError) return NextResponse.json({ error: refreshedError.message }, { status: 500 });

  revalidatePath("/posts");
  revalidatePath("/blog/[slug]");
  if (refreshedPost?.slug) {
    revalidatePath(`/blog/${refreshedPost.slug}`);
  }

  return NextResponse.json(refreshedPost ? normalizeBlog(refreshedPost) : null);
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const blogId = request.nextUrl.searchParams.get("id");
  if (!blogId) {
    return NextResponse.json({ error: "Missing blog id." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", blogId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/posts");
  revalidatePath("/blog/[slug]");

  return NextResponse.json({ success: true });
}
