"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type User } from "@/lib/blog-store";
import { getSupabaseClient } from "@/lib/supabase-client";

type Brochure = {
  id: string;
  title: string;
  description?: string | null;
  pdf_url: string;
  uploaded_by?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  uploader?: {
    id?: string;
    full_name?: string | null;
    username?: string | null;
  };
};

export default function AuthorBrochuresPage() {
  const [session, setSession] = useState<User | null>(null);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshBrochures = async (userId: string) => {
    try {
      const res = await fetch(`/api/brochures?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        throw new Error(`Unable to load brochures: ${res.statusText}`);
      }
      const data = (await res.json()) as Brochure[];
      setBrochures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load brochures.");
    }
  };

  useEffect(() => {
    const load = async () => {
      const currentUser = getSession();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setSession(currentUser);
      await refreshBrochures(currentUser.id);
      setLoading(false);
    };

    load();
  }, [router]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPdfFile(null);
    setCurrentPdfUrl("");
    setIsActive(true);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!editingId && !pdfFile) {
      setError("Please upload a PDF file for the brochure.");
      return;
    }

    let pdfUrlToSubmit = currentPdfUrl;
    if (pdfFile) {
      try {
        const supabase = getSupabaseClient();
        const path = `brochures/${Date.now()}-${pdfFile.name}`;
        const { data, error: uploadError } = await supabase.storage.from("post-uploads").upload(path, pdfFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("post-uploads").getPublicUrl(data.path);
        pdfUrlToSubmit = urlData.publicUrl;
      } catch (err: any) {
        setError(err?.message || "File upload to storage failed.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("is_active", String(isActive));
    if (session?.id) {
      formData.append("uploaded_by", session.id);
    }

    if (pdfUrlToSubmit) {
      formData.append("pdf_url", pdfUrlToSubmit);
    }

    if (editingId) {
      formData.append("id", editingId);
    }

    try {
      const res = await fetch("/api/brochures", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Unable to save brochure.");
      }

      setMessage(editingId ? "Brochure updated successfully." : "Brochure uploaded successfully.");
      resetForm();
      if (session) {
        await refreshBrochures(session.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save brochure.");
    }
  };

  const handleEdit = (item: Brochure) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setCurrentPdfUrl(item.pdf_url);
    setIsActive(item.is_active);
    setPdfFile(null);
    setError("");
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brochure?")) return;
    try {
      const res = await fetch(`/api/brochures?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || "Unable to delete brochure.");
      }
      setMessage("Brochure deleted successfully.");
      if (session) {
        await refreshBrochures(session.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete brochure.");
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "_") || "brochure"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download brochure.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading brochures...</div>;
  }

  return (
    <div className="px-4 py-8 text-white min-h-screen font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400 font-bold">Author Brochures</p>
              <h1 className="mt-2 text-4xl font-bold text-white font-sans">Upload and Manage Brochures</h1>
              <p className="mt-3 text-slate-400 max-w-2xl text-sm leading-relaxed">
                Add PDF leaflets or brochures, specify titles/descriptions, and manage files created by you.
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Upload Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-sans">Brochure Upload</h2>
                <p className="text-xs text-slate-450 mt-1">Publish new documents to the digital archive</p>
              </div>
              {editingId ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Editing Mode
                </span>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-900">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                  placeholder="Enter brochure title"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition"
                  placeholder="Provide details about brochure contents"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">PDF File</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-slate-250 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-slate-950 file:font-bold hover:file:bg-emerald-450 transition cursor-pointer"
                />
                {editingId && currentPdfUrl ? (
                  <p className="mt-2 text-xs text-slate-400 truncate">
                    Current file: <span className="font-semibold text-slate-300">{currentPdfUrl}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                  />
                  Active brochure (make visible to website readers)
                </label>
              </div>

              {error ? <p className="text-sm text-rose-455 bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 text-rose-350">✕ {error}</p> : null}
              {message ? <p className="text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 text-emerald-350 font-semibold">✓ {message}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-450 shadow-lg shadow-emerald-700/10"
                >
                  {editingId ? "Update Brochure" : "Upload Brochure"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-350 transition hover:border-emerald-500 hover:text-white"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          {/* Brochures List */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <div className="pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-2xl font-bold text-white font-sans">My Documents</h2>
              <p className="text-xs text-slate-450 mt-1">Brochures and leaflets created by you</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {brochures.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/30 p-6 text-center text-slate-400">
                  No brochures created by you found yet.
                </div>
              ) : (
                brochures.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 hover:border-slate-700 transition">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white line-clamp-2">{item.title}</h3>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description || "No description provided."}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.pdf_url, item.title)}
                          className="rounded-2xl bg-slate-800 border border-slate-750 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-700"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-2xl bg-rose-600/10 border border-rose-600/30 px-4 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500 pt-3 border-t border-slate-950">
                      <span className="font-semibold text-emerald-400">{item.is_active ? "🟢 Active" : "🔴 Inactive"}</span>
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
