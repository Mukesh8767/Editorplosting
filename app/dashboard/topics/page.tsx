"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/blog-store";

type Topic = { id: string; parent_id: string | null; title: string; slug?: string; is_active?: boolean };

export default function AuthorTopicsPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const s = getSession();
      if (!s) {
        router.push("/login");
        return;
      }
      setSessionChecked(true);
      await refresh();
    };
    load();
  }, [router]);

  const refresh = async () => {
    const data = await fetch("/api/topics").then((r) => r.json());
    setTopics(data || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const generatedSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload: any = { id: editingId || undefined, title: title.trim(), slug: generatedSlug, parent_id: parentId || null };
    const res = await fetch("/api/topics", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) {
      setTitle("");
      setSlug("");
      setParentId(null);
      setEditingId(null);
      await refresh();
    }
  };

  if (!sessionChecked) return null;

  const main = topics.filter((t) => !t.parent_id);

  return (
    <div className="px-6 py-10 text-white min-h-screen font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white font-sans">Category Manager</h1>
          <p className="mt-2 text-sm text-slate-450">Create, review, and edit categories or subcategories for structuring your articles.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* List of Existing Categories */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white font-sans">Existing Categories</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">Categories currently active in the system</p>
            <div className="space-y-3">
              {main.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No categories created yet.</p>
              ) : (
                main.map((m) => {
                  const subtopics = topics.filter(t => t.parent_id === m.id);
                  return (
                    <div key={m.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 hover:border-emerald-500/30 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{m.title}</p>
                          <p className="text-xs text-slate-455 mt-1">/{m.slug || m.title.toLowerCase().replace(/\s+/g, "-")}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(m.id);
                              setTitle(m.title);
                              setSlug(m.slug || "");
                              setParentId(m.parent_id || null);
                            }}
                            className="rounded-lg border border-blue-700/30 bg-blue-600/20 px-3 py-1 text-xs font-bold text-blue-400 hover:bg-blue-600/30 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete category? This might affect articles sorted in it.")) return;
                              await fetch(`/api/topics?id=${encodeURIComponent(m.id)}`, { method: "DELETE" });
                              await refresh();
                            }}
                            className="rounded-lg border border-rose-700/30 bg-rose-600/20 px-3 py-1 text-xs font-bold text-rose-400 hover:bg-rose-600/30 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Subcategories listing */}
                      {subtopics.length > 0 && (
                        <div className="mt-3 pl-6 border-l-2 border-slate-700 space-y-2">
                          <p className="text-xs uppercase tracking-wider text-emerald-405 font-bold mb-1">Subcategories</p>
                          {subtopics.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-md border border-slate-850 hover:border-slate-750 transition">
                              <div>
                                <p className="text-sm font-semibold text-slate-205">{sub.title}</p>
                                <p className="text-xs text-slate-500">/{sub.slug || sub.title.toLowerCase().replace(/\s+/g,'-')}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(sub.id);
                                    setTitle(sub.title);
                                    setSlug(sub.slug || "");
                                    setParentId(sub.parent_id || null);
                                  }}
                                  className="rounded bg-slate-850 border border-slate-750 px-2 py-1 text-xs text-slate-350 hover:bg-slate-800 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm("Delete subcategory?")) return;
                                    await fetch(`/api/topics?id=${encodeURIComponent(sub.id)}`, { method: "DELETE" });
                                    await refresh();
                                  }}
                                  className="rounded bg-rose-950/20 border border-rose-900/30 px-2 py-1 text-xs text-rose-450 hover:bg-rose-900/45 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Category Creation Form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white font-sans">{editingId ? "Update Category" : "Create Category"}</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {editingId ? "Modify metadata for selected category" : "Add a new main or subcategory"}
            </p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200">Parent Category</label>
                <select
                  value={parentId ?? ""}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                >
                  <option value="">None — main category</option>
                  {main
                    .filter((m) => m.id !== editingId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-slate-950 font-bold transition shadow-lg text-sm"
                >
                  {editingId ? "Update Category" : "Add Category"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setSlug("");
                      setParentId(null);
                    }}
                    className="w-full mt-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-6 py-2 text-white font-bold transition text-xs"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
