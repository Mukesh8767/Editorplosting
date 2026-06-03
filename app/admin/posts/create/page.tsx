"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlockEditor, { type Block } from "../BlockEditor";
import { getTopics, getSession } from "@/lib/blog-store";
import { getSupabaseClient } from "@/lib/supabase-client";

const renderBlock = (block: any) => {
  if (!block || typeof block !== "object") return null;
  const extractText = (value: any) => {
    if (!value && value !== "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "object" && item !== null ? item.text || "" : String(item))).join("");
    }
    return String(value);
  };

  if (block.type === "heading") return <h2 key={block.id || Math.random()} className="mt-4 text-2xl font-semibold">{extractText(block.data?.text)}</h2>;
  if (block.type === "paragraph" || block.type === "text") return <p key={block.id || Math.random()} className="mt-2 leading-7">{extractText(block.data?.text)}</p>;
  if (block.type === "image") {
    const url = block.data?.url;
    return (
      <figure key={block.id || Math.random()} className="my-4">
        {url ? (
          <img src={url} alt={extractText(block.data?.caption) || "image"} className="w-full rounded-2xl object-cover" />
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No image</div>
        )}
        {extractText(block.data?.caption) ? <figcaption className="mt-2 text-sm text-slate-600">{extractText(block.data?.caption)}</figcaption> : null}
      </figure>
    );
  }
  return null;
};

export default function CreatePostPage() {
  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [subtopicId, setSubtopicId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [seoTitle, setSeoTitle] = useState<string | null>(null);
  const [seoDescription, setSeoDescription] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string | null>(null);
  const [statusVal, setStatusVal] = useState<string>("draft");
  const [readingTime, setReadingTime] = useState<number | null>(null);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const subCategories = topics.filter((topic) => topic.parent_id === topicId);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.push("/login");
      return;
    }
    setAuthorId(current.id);
    setAuthorName(current.displayName || current.username || "Unknown author");

    const fetchAllData = async () => {
      try {
        const topicsData = await getTopics();
        const loadedTopics = topicsData || [];
        setTopics(loadedTopics);

        // Fetch post details if editing (id exists in search params)
        const params = new URLSearchParams(window.location.search);
        const editId = params.get("id");
        if (editId) {
          setPostId(editId);
          const response = await fetch(`/api/blogs?id=${encodeURIComponent(editId)}`);
          if (response.ok) {
            const blog = await response.json();
            if (blog) {
              setTitle(blog.title || "");
              setExcerpt(blog.excerpt || "");
              setTagsInput(blog.tags ? blog.tags.join(", ") : "");
              setCoverImageUrl(blog.cover_image_url || null);
              setSeoTitle(blog.seo_title || null);
              setSeoDescription(blog.seo_description || null);
              setCanonicalUrl(blog.canonical_url || null);
              setStatusVal(blog.status || "draft");
              setReadingTime(blog.reading_time || null);
              setIsFeatured(blog.is_featured || false);

              // Parse blocks
              if (blog.content) {
                try {
                  const contentObj = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
                  setBlocks(Array.isArray(contentObj) ? contentObj : []);
                } catch {
                  setBlocks([]);
                }
              }

              // Set Topic and Subtopic
              if (blog.topic_id) {
                const selectedTopic = loadedTopics.find((t) => t.id === blog.topic_id);
                if (selectedTopic) {
                  if (selectedTopic.parent_id) {
                    setTopicId(selectedTopic.parent_id);
                    setSubtopicId(selectedTopic.id);
                  } else {
                    setTopicId(selectedTopic.id);
                    setSubtopicId(null);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading editor data", err);
      }
    };

    fetchAllData();
  }, [router]);

  // Automatically calculate reading time based on content changes (title + text blocks)
  useEffect(() => {
    const extractText = (value: any): string => {
      if (!value && value !== "") return "";
      if (typeof value === "string") return value;
      if (Array.isArray(value)) {
        return value.map((item) => (typeof item === "object" && item !== null ? item.text || "" : String(item))).join("");
      }
      return String(value);
    };

    let totalWords = title.trim().split(/\s+/).filter(Boolean).length;

    blocks.forEach((block) => {
      if (!block || typeof block !== "object") return;
      let text = "";
      if (block.type === "heading" || block.type === "paragraph") {
        text = extractText(block.data?.text);
      } else if (block.type === "image") {
        text = extractText(block.data?.caption);
      }
      if (text) {
        totalWords += text.trim().split(/\s+/).filter(Boolean).length;
      }
    });

    const calculatedTime = Math.ceil(totalWords / 200);
    setReadingTime(calculatedTime > 0 ? calculatedTime : 1);
  }, [title, blocks]);

  const handleSave = async (publish = false) => {
    setMessage("");
    if (!title.trim()) {
      setMessage("Please enter a title.");
      return;
    }

    setLoading(true);
    const payload: any = {
      title: title.trim(),
      content: JSON.stringify(blocks),
      excerpt: excerpt || null,
      slug: seoTitle ? seoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : null,
      topic_id: subtopicId || topicId,
      authorId,
      status: publish ? "published" : statusVal,
      reading_time: readingTime ?? null,
      is_featured: isFeatured,
      cover_image_url: coverImageUrl ?? null,
      seo_title: seoTitle ?? null,
      seo_description: seoDescription ?? null,
      canonical_url: canonicalUrl ?? null,
      published_at: publish ? new Date().toISOString() : null,
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    if (postId) {
      payload.id = postId;
    }

    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data?.error || "Unable to save post.");
      return;
    }

    if (!postId && data?.id) {
      setPostId(data.id);
    }

    setMessage(publish ? "Post published successfully." : "Draft saved successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Create post</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">New blog post</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill in the important post details above, then use the editor and preview side-by-side below.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/posts")}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Logged in as</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{authorName || "Unknown user"}</p>
            </div>
            {message ? (
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="xl:col-span-3">
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Excerpt</label>
                <input
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tags</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Add tags separated by commas"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                />
                <p className="mt-2 text-xs text-slate-500">Separate tags with commas. New tags are created automatically.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={topicId ?? ""}
                  onChange={(e) => {
                    setTopicId(e.target.value || null);
                    setSubtopicId(null);
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
                >
                  <option value="">Select category</option>
                  {topics.filter((t) => !t.parent_id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Subcategory</label>
                <select
                  value={subtopicId ?? ""}
                  onChange={(e) => setSubtopicId(e.target.value || null)}
                  disabled={subCategories.length === 0}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {subCategories.length > 0 ? (
                    <>
                      <option value="">Select subcategory</option>
                      {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.title}</option>
                      ))}
                    </>
                  ) : (
                    <option value="">No subcategories available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Cover image or video</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploadingCover(true);
                      try {
                        const supabase = getSupabaseClient();
                        const path = `covers/${Date.now()}-${f.name}`;
                        const { data, error } = await supabase.storage.from("post-uploads").upload(path, f, { upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from("post-uploads").getPublicUrl(data.path);
                        setCoverImageUrl(urlData.publicUrl);
                      } catch (err: any) {
                        setMessage(err?.message || "Upload failed.");
                      } finally {
                        setUploadingCover(false);
                      }
                    }}
                    className="rounded-2xl"
                  />
                    <input
                      placeholder="or paste image/video url"
                      value={coverImageUrl ?? ""}
                      onChange={(e) => setCoverImageUrl(e.target.value || null)}
                      className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    />
                  {uploadingCover ? <div className="text-sm text-slate-500">Uploading…</div> : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">SEO title</label>
                <input
                  value={seoTitle ?? ""}
                  onChange={(e) => setSeoTitle(e.target.value || null)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">SEO description</label>
                <input
                  value={seoDescription ?? ""}
                  onChange={(e) => setSeoDescription(e.target.value || null)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Canonical URL or image</label>
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCover(true);
                        try {
                          const supabase = getSupabaseClient();
                          const path = `canonicals/${Date.now()}-${file.name}`;
                          const { data, error } = await supabase.storage.from("post-uploads").upload(path, file, { upsert: true });
                          if (error) throw error;
                          const { data: urlData } = supabase.storage.from("post-uploads").getPublicUrl(data.path);
                          setCanonicalUrl(urlData.publicUrl);
                        } catch (err: any) {
                          setMessage(err?.message || "Upload failed.");
                        } finally {
                          setUploadingCover(false);
                        }
                      }}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    />
                    <span className="text-sm text-slate-500">Upload image</span>
                  </div>
                  <input
                    placeholder="or paste canonical URL / image URL"
                    value={canonicalUrl ?? ""}
                    onChange={(e) => setCanonicalUrl(e.target.value || null)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700">Reading time (automatic)</label>
                <div className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold text-lg">{readingTime ?? 1}</span>
                  <span className="text-sm text-slate-600 font-medium">min read (estimated from word count)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700">Feature this post</label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">Post content</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">Editor</span>
              </div>
              <BlockEditor value={blocks} onChange={setBlocks} />
            </div>

            <div className="rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">Live preview</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">Preview</span>
              </div>
              {coverImageUrl ? (
                <div className="mb-4 overflow-hidden rounded-3xl bg-slate-100">
                  {coverImageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={coverImageUrl} controls className="h-52 w-full object-cover" />
                  ) : (
                    <img src={coverImageUrl} alt={title || "cover"} className="h-52 w-full object-cover" />
                  )}
                </div>
              ) : null}
              <div className="space-y-4 text-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{authorName || "Author"}</div>
                    <div className="text-xs text-slate-500">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">{statusVal}</div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">{title || "Untitled post"}</h3>
                  {seoTitle ? <p className="mt-2 text-sm text-slate-700">{seoTitle}</p> : null}
                </div>
                {excerpt ? <p className="text-sm leading-7 text-slate-950">{excerpt}</p> : null}
                <article className="prose prose-slate max-w-none text-slate-950">
                  {blocks.map((b) => renderBlock(b))}
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
