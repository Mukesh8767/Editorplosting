"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type User } from "@/lib/blog-store";

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

export default function BrochuresAdminPage() {
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
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const currentUser = getSession();
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login");
        return;
      }
      setSession(currentUser);
      await refreshBrochures();
    };

    load();
  }, [router]);

  const refreshBrochures = async () => {
    try {
      const res = await fetch("/api/brochures");
      if (!res.ok) {
        throw new Error(`Unable to load brochures: ${res.statusText}`);
      }
      const data = (await res.json()) as Brochure[];
      setBrochures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load brochures.");
    }
  };

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

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("is_active", String(isActive));
    if (session?.id) {
      formData.append("uploaded_by", session.id);
    }

    if (pdfFile) {
      formData.append("file", pdfFile);
    } else if (currentPdfUrl) {
      formData.append("pdf_url", currentPdfUrl);
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
      await refreshBrochures();
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
    if (!confirm("Delete this brochure?")) return;
    try {
      const res = await fetch(`/api/brochures?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || "Unable to delete brochure.");
      }
      setMessage("Brochure deleted successfully.");
      await refreshBrochures();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Admin Brochures</p>
              <h1 className="mt-2 text-4xl font-bold text-white">Upload and Manage Brochures</h1>
              <p className="mt-3 text-slate-400 max-w-2xl">
                Upload PDF brochures, edit metadata, and manage your brochure archive from one admin page.
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Brochure upload</h2>
                <p className="text-sm text-slate-400">Use this form to add or update brochure entries.</p>
              </div>
              {editingId ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Editing mode
                </span>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-200">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="Enter brochure title"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="Enter a short description"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-200">PDF file</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-slate-200 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-slate-950"
                />
                {editingId && currentPdfUrl ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Current file: <span className="font-semibold text-slate-200">{currentPdfUrl}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400"
                  />
                  Active brochure
                </label>
              </div>

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  {editingId ? "Update Brochure" : "Upload Brochure"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                >
                  Reset form
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
            <div className="pb-4 border-b border-slate-800 mb-6">
              <h2 className="text-2xl font-semibold text-white">Brochure list</h2>
              <p className="text-sm text-slate-400">Edit, download, or remove any existing brochure entry.</p>
            </div>

            <div className="space-y-4">
              {brochures.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-slate-400">
                  No brochures found yet.
                </div>
              ) : (
                brochures.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-400 line-clamp-3">{item.description || "No description provided."}</p>
                        <p className="mt-3 text-xs text-slate-500">
                          Uploaded by: {item.uploader?.full_name || item.uploader?.username || "Unknown"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.pdf_url, item.title)}
                          className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{item.is_active ? "Active" : "Inactive"}</span>
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
