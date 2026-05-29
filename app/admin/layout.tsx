import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "All Posts", href: "/admin/posts" },
  { label: "Create Post", href: "/admin/posts/create" },
  { label: "Categories", href: "/admin/topics" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-420">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
          <div className="flex h-24 items-center border-b border-slate-800 px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sustainability</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Editor Studio</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-3xl px-5 py-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-800 px-6 py-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Need help?</p>
              <p className="mt-3 text-sm font-semibold text-white">Use the left menu to create posts, manage categories, and review blogs.</p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Go to login
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-350">{children}</div>
        </main>
      </div>
    </div>
  );
}
