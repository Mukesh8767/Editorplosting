"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/blog-store";

type Topic = { id: string; parent_id: string | null; title: string; slug?: string; is_active?: boolean };

export default function AdminTopicsPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(()=>{
    const load = async ()=>{
      const s = getSession();
      if (!s || s.role !== "admin") { router.push('/login'); return; }
      setSessionChecked(true);
      await refresh();
    };
    load();
  },[router]);

  const refresh = async ()=>{
    const data = await fetch('/api/topics').then(r=>r.json());
    setTopics(data || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload: any = { id: editingId || undefined, title: title.trim(), slug: slug || null, parent_id: parentId || null };
    const res = await fetch('/api/topics', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      setTitle(''); setSlug(''); setParentId(null); setEditingId(null); await refresh();
    }
  };

  if (!sessionChecked) return null;

  const main = topics.filter(t=>!t.parent_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white">Category Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Create main categories and subcategories for content organization.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white">Existing Categories</h2>
            <div className="mt-4 space-y-3">
              {main.map(m=> (
                <div key={m.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:border-emerald-500/30 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{m.title}</p>
                      <p className="text-sm text-slate-400">/{m.slug || m.title.toLowerCase().replace(/\s+/g,'-')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>{ setEditingId(m.id); setTitle(m.title); setSlug(m.slug || ''); setParentId(m.parent_id || null); }} className="rounded-lg border border-blue-700/30 bg-blue-600/20 px-3 py-1 text-sm text-blue-400 hover:bg-blue-600/30 transition">Edit</button>
                      <button onClick={async ()=>{ if(!confirm('Delete category?')) return; await fetch(`/api/topics?id=${encodeURIComponent(m.id)}`, { method: 'DELETE' }); await refresh(); }} className="rounded-lg border border-rose-700/30 bg-rose-600/20 px-3 py-1 text-sm text-rose-400 hover:bg-rose-600/30 transition">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white">Create Category</h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" placeholder="Category name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Slug (optional)</label>
                <input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" placeholder="category-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Parent Category</label>
                <select value={parentId ?? ""} onChange={e=>setParentId(e.target.value || null)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition">
                  <option value="">None — main category</option>
                  {main.map(m=> <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <button type="submit" className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold transition shadow-lg">Add Category</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
