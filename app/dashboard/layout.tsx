"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/blog-store";

const baseNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Posts", href: "/dashboard/posts" },
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
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white/88 text-slate-900 shadow-sm backdrop-blur lg:flex">
          <div className="flex h-24 items-center border-b border-slate-200 px-7">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="relative h-11 w-11 shrink-0">
                <Image
                  src="/images/urllogo.webp"
                  alt="Sustainwheel Logo"
                  fill
                  sizes="44px"
                  className="object-contain"
                  priority
                />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 leading-none">Author Studio</p>
                <h1 className="mt-1 text-lg font-bold text-slate-950 leading-none">Sustainability</h1>
              </div>
            </Link>
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
              <p className="mt-3 text-sm font-normal leading-6 text-slate-600">Create blogs, upload brochures, and manage your custom profile.</p>
              <Link
                href="/login"
                className="btn-primary mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
              >
                Switch Account
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 lg:hidden px-2">
            <span className="relative h-10 w-10 shrink-0">
              <Image src="/images/urllogo.webp" alt="Sustainwheel Logo" fill sizes="40px" className="object-contain" priority />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 leading-none">Author Studio</p>
              <h1 className="mt-1 text-lg font-bold text-slate-950 leading-none">Sustainability</h1>
            </div>
          </div>
          <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/85 p-2 shadow-sm lg:hidden">
            {baseNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
