"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/blog-store";

const baseNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Posts", href: "/dashboard/posts" },
  { label: "Create Post", href: "/dashboard/posts/create" },
  { label: "Categories", href: "/dashboard/topics" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Brochures", href: "/dashboard/brochures" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/login");
      return;
    }
    setVerified(true);
  }, [router]);

  if (!verified) {
    return <div className="app-shell flex min-h-screen items-center justify-center text-slate-600">Loading session...</div>;
  }

  return (
    <div className="admin-surface text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-76 shrink-0 flex-col border-r border-slate-200/80 bg-slate-950 text-white shadow-2xl lg:flex">
          <div className="flex h-24 items-center border-b border-white/10 px-7">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300 font-bold">Author Studio</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Sustainability</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-7">
            {baseNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-5 py-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
              <p className="mt-3 text-sm font-semibold text-white">Create blogs, upload brochures, and manage your custom profile.</p>
              <Link
                href="/login"
                className="btn-primary mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Switch Account
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm lg:hidden">
            {baseNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
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
