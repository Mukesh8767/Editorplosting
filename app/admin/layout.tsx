"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getSession } from "@/lib/blog-store";
import { usePathname } from "next/navigation";

const baseNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "All Posts", href: "/admin/posts" },
  { label: "Categories", href: "/admin/topics" },
  { label: "Events", href: "/admin/events" },
  { label: "Brochures", href: "/admin/brochures" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sessionRole, setSessionRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setSessionRole(getSession()?.role ?? null);
    });
  }, []);

  const navItems = baseNav.map((item) => {
    if (mounted && item.href === "/admin/posts" && sessionRole !== "admin") {
      return { ...item, label: "My Posts" };
    }
    return item;
  });

  return (
    <div className="admin-surface text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-76 shrink-0 flex-col border-r border-slate-200 bg-white/88 text-slate-900 shadow-sm backdrop-blur lg:flex">
          <div className="flex h-24 items-center border-b border-slate-200 px-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Sustainability</p>
              <h1 className="mt-2 text-2xl font-medium text-slate-950">Editor Studio</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-7">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 px-5 py-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
              <p className="mt-3 text-sm font-normal leading-6 text-slate-600">Use the left menu to create posts, manage categories, and review blogs.</p>
              <Link
                href="/login"
                className="btn-primary mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
              >
                Go to login
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/85 p-2 shadow-sm lg:hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mx-auto max-w-[1360px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
