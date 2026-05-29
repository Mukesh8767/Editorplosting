"use client";

import Link from "next/link";
import { useState } from "react";
import type { Blog } from "@/lib/blog-store";

type Props = {
  blogs: Blog[];
};

export default function AdminBlogCards({ blogs }: Props) {
  const [items, setItems] = useState<Blog[]>(blogs);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const response = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((blog) => blog.id !== id));
    } else {
      const data = await response.json().catch(() => null);
      alert(data?.error || "Unable to delete post.");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
          No blogs have been published yet.
        </div>
      ) : (
        items.map((blog) => {
          const blogId = blog.id ? String(blog.id) : undefined;
          const blogSlug = blog.slug ? String(blog.slug) : null;
          const publishedDate = blog.published_at ? new Date(blog.published_at) : new Date(blog.updatedAt);

          return (
            <div key={blogId ?? blog.title} className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300">
              {blog.cover_image_url ? (
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img src={blog.cover_image_url} alt={blog.title || "Blog cover"} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center bg-slate-100 text-sm text-slate-500">
                  No cover image
                </div>
              )}

              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                      <img src="/default-avatar.png" alt={blog.authorName || "Author"} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{blog.authorName || "Unknown author"}</p>
                      <p className="text-xs text-slate-500">{publishedDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  {blog.status ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
                      {blog.status}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">{blog.title || "Untitled post"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{blog.excerpt || "No summary available."}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{blog.slug || "No slug"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={blogSlug ? `/admin/posts/${encodeURIComponent(blogSlug)}` : blogId ? `/admin/posts/${encodeURIComponent(blogId)}` : "/admin"}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                    {blogId ? (
                      <Link
                        href={`/admin/posts/create?id=${encodeURIComponent(blogId)}`}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    ) : null}
                    {blogId ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(blogId)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
