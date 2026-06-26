import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-client";
import EventsList from "../components/EventsList";

type EventImage = {
  id?: string;
  event_id?: string;
  image_url: string;
  display_order?: number;
};

type Event = {
  id: string;
  title: string;
  description?: string | null;
  event_type?: string | null;
  participation_type?: 'Organized' | 'Attended' | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  organizer?: string | null;
  registration_url?: string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  created_at?: string;
  event_images?: EventImage[];
};

export default async function PublicEventsPage() {
  let events: Event[] = [];
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*, event_images(*)")
      .order("start_date", { ascending: true });

    if (!error && Array.isArray(data)) {
      events = data;
    }
  } catch (e) {
    console.error("Error fetching events on server:", e);
  }

  return (
    <div className="app-shell min-h-screen pb-20 text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/posts" className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tight text-slate-950 transition hover:text-emerald-700">
              Sustainability<span className="text-emerald-600">Journal</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/posts" className="text-sm font-medium text-slate-600 transition hover:text-emerald-700">
              Articles
            </Link>
            <Link href="/events" className="text-sm font-medium text-slate-900 transition hover:text-emerald-700">
              Events
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
            >
              Writer Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16 space-y-16">
        
        {/* Centered Hero Section */}
        <header className="mx-auto max-w-3xl space-y-5 text-center">
          <span className="inline-block rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-800">
            Green Forums & Meetups
          </span>
          <h1 className="pt-2 text-4xl font-medium leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
            Sustainability Events
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            Join panel debates, interactive webinars, and local meetups addressing smart resource usage and eco-innovations.
          </p>
        </header>

        <EventsList initialEvents={events} />
      </div>
    </div>
  );
}
