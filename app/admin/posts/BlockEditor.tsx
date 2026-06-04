"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

type TextSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
};

export type Block =
  | {
      id: string;
      type: "heading";
      data: { level: 1 | 2 | 3; text: TextSpan[] };
    }
  | {
      id: string;
      type: "paragraph";
      data: { text: TextSpan[] };
    }
  | {
      id: string;
      type: "image";
      data: { url: string; caption: TextSpan[] };
    };

const genId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const createBlock = (type: "h1" | "h2" | "p" | "image"): Block => {
  if (type === "h1")
    return {
      id: genId(),
      type: "heading",
      data: { level: 1, text: [{ text: "Heading" }] },
    };

  if (type === "h2")
    return {
      id: genId(),
      type: "heading",
      data: { level: 2, text: [{ text: "Heading" }] },
    };

  if (type === "image")
    return {
      id: genId(),
      type: "image",
      data: { url: "", caption: [{ text: "Image caption" }] },
    };

  return {
    id: genId(),
    type: "paragraph",
    data: { text: [{ text: "" }] },
  };
};

export default function BlockEditor({ value, onChange }: { value?: Block[]; onChange: (blocks: Block[]) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  // Fallback to a default empty paragraph block if no content exists yet
  const activeBlocks = value && value.length > 0 ? value : [{ id: "init-p", type: "paragraph", data: { text: [{ text: "" }] } } as Block];

  const updateBlock = (id: string, newBlock: Partial<Block>) => {
    const next = activeBlocks.map((block) => (block.id === id ? ({ ...block, ...newBlock } as Block) : block));
    onChange(next);
  };

  const insertBlockAfter = (index: number, block: Block) => {
    const next = [...activeBlocks];
    next.splice(index + 1, 0, block);
    onChange(next);
  };

  const addBlock = (type: "h1" | "h2" | "p" | "image") => {
    onChange([...activeBlocks, createBlock(type)]);
  };

  const removeBlock = (id: string) => {
    onChange(activeBlocks.filter((block) => block.id !== id));
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = activeBlocks.findIndex((block) => block.id === id);
    if (index === -1) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= activeBlocks.length) return;
    const next = [...activeBlocks];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    onChange(next);
  };

  const updateText = (id: string, text: string) => {
    const next = activeBlocks.map((block) =>
      block.id === id
        ? ({ ...block, data: { ...(block.data as any), text: [{ text }] } } as Block)
        : block
    );
    onChange(next);
  };

  const uploadImage = async (file: File, id: string) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      const url = json?.url;
      const next = activeBlocks.map((block) =>
        block.id === id ? ({ ...block, data: { ...(block.data as any), url } } as Block) : block
      );
      onChange(next);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        const next = activeBlocks.map((block) =>
          block.id === id ? ({ ...block, data: { ...(block.data as any), url } } as Block) : block
        );
        onChange(next);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 shadow-sm">
        <button type="button" onClick={() => addBlock("h1")} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          Heading
        </button>
        <button type="button" onClick={() => addBlock("p")} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          Paragraph
        </button>
        <button type="button" onClick={() => addBlock("image")} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          Image
        </button>
      </div>

      <div className="space-y-4">
        {activeBlocks.map((block, index) => (
          <section key={block.id} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{block.type}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveBlock(block.id, -1)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50">
                  Move Up
                </button>
                <button type="button" onClick={() => moveBlock(block.id, 1)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50">
                  Move Down
                </button>
                <button type="button" onClick={() => removeBlock(block.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-100">
                  Remove
                </button>
              </div>
            </div>

            {block.type === "heading" && (
              <input
                value={block.data.text.map((span) => span.text).join("")}
                onChange={(e) => updateText(block.id, e.target.value)}
                placeholder="Heading text"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-3xl font-bold text-slate-950 outline-none"
              />
            )}

            {block.type === "paragraph" && (
              <textarea
                value={block.data.text.map((span) => span.text).join("")}
                onChange={(e) => updateText(block.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "/" && (e.target as HTMLTextAreaElement).value.trim() === "") {
                    e.preventDefault();
                    setShowMenu(true);
                    setMenuIndex(index);
                  } else if (e.key === "Escape") {
                    setShowMenu(false);
                  }
                }}
                placeholder="Write paragraph text — type '/' to add a block below"
                rows={5}
                className="min-h-40 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-8 text-slate-900 outline-none"
              />
            )}

            {block.type === "image" && (
              <div className="space-y-3">
                {block.data.url ? (
                  <img src={block.data.url} alt={block.data.caption.map((span) => span.text).join("")} className="w-full rounded-3xl object-cover shadow-sm" />
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Upload an image file or paste a public URL.</div>
                )}
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, block.id);
                    }}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                  <input
                    type="text"
                    value={block.data.caption.map((span) => span.text).join("")}
                    onChange={(e) =>
                      updateBlock(block.id, {
                        data: { ...(block.data as any), caption: [{ text: e.target.value }] },
                      })
                    }
                    placeholder="Image caption"
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </div>
              </div>
            )}

            {showMenu && menuIndex === index && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
                <p className="mb-2 text-sm font-semibold text-slate-700">Insert block</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button type="button" onClick={() => { insertBlockAfter(index, createBlock("h1")); setShowMenu(false); }} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                    Heading
                  </button>
                  <button type="button" onClick={() => { insertBlockAfter(index, createBlock("p")); setShowMenu(false); }} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                    Paragraph
                  </button>
                  <button type="button" onClick={() => { insertBlockAfter(index, createBlock("image")); setShowMenu(false); }} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                    Image
                  </button>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
