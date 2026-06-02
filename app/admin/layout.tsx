"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { getSession } from "@/lib/blog-store";

const baseNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "All Posts", href: "/admin/posts" },
  { label: "Create Post", href: "/admin/posts/create" },
  { label: "Categories", href: "/admin/topics" },
  { label: "Brochures", href: "/admin/brochures" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sessionRole] = useState<string | null>(() => getSession()?.role ?? null);

  const navItems = baseNav.map((item) => {
    if (item.href === "/admin/posts" && sessionRole !== "admin") {
      return { ...item, label: "My Posts" };
    }
    return item;
  });

  return (
    <div className="admin-surface text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-76 shrink-0 flex-col border-r border-slate-200/80 bg-slate-950 text-white shadow-2xl lg:flex">
          <div className="flex h-24 items-center border-b border-white/10 px-7">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Sustainability</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Editor Studio</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 px-5 py-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
              <p className="mt-3 text-sm font-semibold text-white">Use the left menu to create posts, manage categories, and review blogs.</p>
              <Link
                href="/login"
                className="btn-primary mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Go to login
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mx-auto max-w-[1360px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
