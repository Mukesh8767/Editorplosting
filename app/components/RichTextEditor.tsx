"use client";

import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Focus and Selection tracking
  const [activeStyles, setActiveStyles] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    justifyLeft: boolean;
    justifyCenter: boolean;
    justifyRight: boolean;
    justifyFull: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync internal HTML with external value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = "") => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, arg);
      handleInput();
      updateActiveStyles();
    }
  };

  const updateActiveStyles = () => {
    if (typeof document === "undefined") return;
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Normal key down handlers or shortcut styles
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        executeCommand("bold");
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        executeCommand("italic");
      }
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        executeCommand("underline");
      }
    }
  };

  // Predefined custom color palette (elegant colors)
  const textColors = [
    { name: "Default", value: "#ffffff" },
    { name: "Emerald", value: "#34d399" },
    { name: "Blue", value: "#60a5fa" },
    { name: "Yellow", value: "#fbbf24" },
    { name: "Rose", value: "#fb7185" },
    { name: "Slate", value: "#94a3b8" },
  ];

  if (!isMounted) {
    return <div className="h-64 animate-pulse bg-slate-800 rounded-lg border border-slate-700" />;
  }

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl transition focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-850 bg-slate-950/60 px-3 py-2 text-slate-300">
        {/* Headings */}
        <select
          onChange={(e) => executeCommand("formatBlock", e.target.value)}
          className="rounded bg-slate-800 border border-slate-700 text-xs px-2 py-1 text-white outline-none cursor-pointer focus:border-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>Text Style</option>
          <option value="<p>">Paragraph</option>
          <option value="<h1>">Heading 1</option>
          <option value="<h2>">Heading 2</option>
          <option value="<h3>">Heading 3</option>
          <option value="<pre>">Monospace</option>
        </select>

        {/* Font Family */}
        <select
          onChange={(e) => executeCommand("fontName", e.target.value)}
          className="rounded bg-slate-800 border border-slate-700 text-xs px-2 py-1 text-white outline-none cursor-pointer focus:border-emerald-500"
          defaultValue="sans-serif"
        >
          <option value="sans-serif">Sans-Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier</option>
          <option value="Comic Sans MS">Comic Sans</option>
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => executeCommand("fontSize", e.target.value)}
          className="rounded bg-slate-800 border border-slate-700 text-xs px-2 py-1 text-white outline-none cursor-pointer focus:border-emerald-500"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className={`p-1.5 rounded transition ${activeStyles.bold ? "bg-emerald-500 text-white font-bold" : "hover:bg-slate-800 text-slate-300"}`}
          title="Bold (Ctrl+B)"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className={`p-1.5 rounded transition ${activeStyles.italic ? "bg-emerald-500 text-white italic" : "hover:bg-slate-800 text-slate-300"}`}
          title="Italic (Ctrl+I)"
        >
          <i>I</i>
        </button>

        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className={`p-1.5 rounded transition ${activeStyles.underline ? "bg-emerald-500 text-white underline" : "hover:bg-slate-800 text-slate-300"}`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>

        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className={`p-1.5 rounded transition ${activeStyles.strikeThrough ? "bg-emerald-500 text-white line-through" : "hover:bg-slate-800 text-slate-300"}`}
          title="Strike-through"
        >
          <s>S</s>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className={`p-1.5 rounded transition ${activeStyles.justifyLeft ? "bg-emerald-500 text-white" : "hover:bg-slate-800 text-slate-300"}`}
          title="Align Left"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className={`p-1.5 rounded transition ${activeStyles.justifyCenter ? "bg-emerald-500 text-white" : "hover:bg-slate-800 text-slate-300"}`}
          title="Align Center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          className={`p-1.5 rounded transition ${activeStyles.justifyRight ? "bg-emerald-500 text-white" : "hover:bg-slate-800 text-slate-300"}`}
          title="Align Right"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25g12" />
          </svg>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition"
          title="Unordered List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition"
          title="Ordered List"
        >
          1. List
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Font Color Picker */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400">Color:</span>
          <input
            type="color"
            onChange={(e) => executeCommand("foreColor", e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border border-slate-700 bg-transparent"
            title="Font Color"
          />
        </div>

        {/* Background highlight */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400">Highlight:</span>
          <input
            type="color"
            onChange={(e) => executeCommand("hiliteColor", e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border border-slate-700 bg-transparent"
            title="Highlight Color"
          />
        </div>

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="p-1.5 rounded hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[10px] ml-auto transition"
          title="Clear formatting"
        >
          Clear Style
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onSelect={updateActiveStyles}
        onKeyDown={handleKeyDown}
        className="min-h-[350px] max-h-[600px] overflow-y-auto px-8 py-8 bg-white text-slate-900 focus:outline-none prose max-w-none text-base editor-textarea shadow-inner border-t border-slate-200"
        data-placeholder={placeholder}
        style={{ outline: "none" }}
      />
    </div>
  );
}
