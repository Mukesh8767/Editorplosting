"use client";

import { useEffect, useState } from "react";
import type { Blog, User } from "@/lib/blog-store";

type BlogEditorProps = {
  session: User;
  blogs: Blog[];
  selectedBlog: Blog | null;
  onSaved: (title: string, content: string, tags: string[], id?: string) => void;
  onSelect: (blog: Blog) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
};

export default function BlogEditor({
  session,
  blogs,
  selectedBlog,
  onSaved,
  onSelect,
  onDelete,
  onNew,
}: BlogEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    setTitle(selectedBlog?.title ?? "");
    setContent(selectedBlog?.content ?? "");
    setTagsInput(selectedBlog?.tags?.join(", ") ?? "");
  }, [selectedBlog]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,540px)_minmax(420px,1fr)]">
      <section className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Blog editor</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Write and preview your post</h1>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
            {session.displayName}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Story title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter your blog title"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Content</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            placeholder="Write your blog content here..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Tags</label>
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="Add tags separated by commas"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <p className="text-xs text-slate-500">Tags will be created automatically and attached to the post.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onSaved(
                title,
                content,
                tagsInput
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
                selectedBlog?.id
              )
            }
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save blog
          </button>
          <button
            type="button"
            onClick={onNew}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
          >
            Create new post
          </button>
          <span className="text-sm text-slate-500">Saved blogs appear in your list below.</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">My posts</p>
              <p className="mt-1 text-sm text-slate-600">Only your own blog drafts are shown here.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {blogs.length}
            </span>
          </div>

          <div className="space-y-3">
            {blogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                No blogs yet. Save one to see it show up here.
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelect(blog)}
                        className="text-left text-base font-semibold text-slate-950 hover:text-slate-700"
                      >
                        {blog.title || "Untitled post"}
                      </button>
                      <p className="mt-1 text-sm text-slate-500">Updated {new Date(blog.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(blog.id)}
                      className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Live preview</p>
            <h2 className="mt-2 text-3xl font-semibold">What your readers will see</h2>
          </div>
        </div>

        <div className="rounded-4xl border border-slate-800 bg-[#020617] p-8 shadow-[0_25px_80px_rgba(15,23,42,0.35)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-500">{session.displayName}</p>
              <h3 className="text-4xl font-semibold text-white">{title || "Start typing your title..."}</h3>
              <p className="text-sm text-slate-400">Live preview updates as you type. Your final blog will display here in the preview panel.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-6 text-slate-100 shadow-lg">
              <p className="whitespace-pre-wrap leading-7 text-slate-100">{content || "Your blog content preview will appear here."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
