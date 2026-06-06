import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-client";
import EventMediaCarousel from "../components/EventMediaCarousel";

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

  const featuredEvents = events.filter((e) => e.is_featured);
  const regularEvents = events.filter((e) => !e.is_featured);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { day, month, time };
  };

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

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-medium tracking-tight text-slate-950">Featured Highlights</h2>
              <div className="h-[2px] bg-slate-200 flex-1" />
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              {featuredEvents.map((event) => {
                const dateInfo = formatEventDate(event.start_date);

                return (
                  <div
                    key={event.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md"
                  >
                    {/* Media section (Carousel) */}
                    <div className="relative h-64 bg-slate-950 overflow-hidden shrink-0">
                      <EventMediaCarousel
                        coverImageUrl={event.cover_image_url || null}
                        galleryImages={event.event_images || []}
                        title={event.title}
                      />

                      {/* Date Overlay badge */}
                      <div className="absolute top-4 left-4 z-20 flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white/92 text-emerald-800 shadow-sm backdrop-blur">
                        <span className="text-lg font-semibold leading-none">{dateInfo.day}</span>
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider">{dateInfo.month}</span>
                      </div>

                      {/* Type Tags */}
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {event.event_type && (
                          <span className="rounded-full border border-white/70 bg-white/88 px-3 py-1 text-[10px] font-medium text-slate-700 backdrop-blur">
                            {event.event_type}
                          </span>
                        )}
                        {event.participation_type && (
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-medium backdrop-blur ${
                            event.participation_type === "Organized"
                              ? "border-blue-200/70 bg-blue-50/88 text-blue-700"
                              : "border-slate-200/70 bg-slate-50/88 text-slate-700"
                          }`}>
                            {event.participation_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div className="space-y-4">
                        <h3 className="text-xl font-medium text-slate-950 transition group-hover:text-emerald-700">
                          {event.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</p>
                          <p className="text-xs text-slate-700 font-medium">
                            📍 {event.location || "Online"}
                          </p>
                          <p className="text-xs text-slate-700 font-medium">
                            🕒 Starts {dateInfo.time}
                          </p>
                          {event.event_images && event.event_images.length > 0 && (
                            <p className="text-[10px] font-medium text-emerald-700">
                              📸 Includes {event.event_images.length} gallery media items
                            </p>
                          )}
                        </div>

                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
                          >
                            Register Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Regular Events Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-medium tracking-tight text-slate-950">All Upcoming Events</h2>
            <div className="h-[2px] bg-slate-200 flex-1" />
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm">
              <p className="text-base font-medium text-slate-500">No events scheduled yet. Check back soon!</p>
            </div>
          ) : regularEvents.length === 0 && featuredEvents.length > 0 ? (
            <div className="text-slate-500 text-sm">No other events listed currently.</div>
          ) : (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {regularEvents.map((event) => {
                const dateInfo = formatEventDate(event.start_date);

                return (
                  <div
                    key={event.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm transition duration-300 hover:border-emerald-200 hover:shadow-md"
                  >
                    {/* Media section (Carousel) */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden shrink-0">
                      <EventMediaCarousel
                        coverImageUrl={event.cover_image_url || null}
                        galleryImages={event.event_images || []}
                        title={event.title}
                      />

                      {/* Date Overlay badge */}
                      <div className="absolute top-3 left-3 z-20 flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white/92 text-emerald-800 shadow-sm backdrop-blur">
                        <span className="text-base font-semibold leading-none">{dateInfo.day}</span>
                        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider">{dateInfo.month}</span>
                      </div>

                      {/* Type Tags */}
                      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                        {event.event_type && (
                          <span className="rounded-full border border-white/70 bg-white/88 px-2.5 py-0.5 text-[9px] font-medium text-slate-700 backdrop-blur">
                            {event.event_type}
                          </span>
                        )}
                        {event.participation_type && (
                          <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium backdrop-blur ${
                            event.participation_type === "Organized"
                              ? "border-blue-200/70 bg-blue-50/88 text-blue-700"
                              : "border-slate-200/70 bg-slate-50/88 text-slate-700"
                          }`}>
                            {event.participation_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div className="space-y-3">
                        <h3 className="truncate text-lg font-medium text-slate-950 transition group-hover:text-emerald-700">
                          {event.title}
                        </h3>
                        <p className="text-slate-655 text-xs leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                        <div className="text-[11px] text-slate-600 space-y-1">
                          <p>📍 {event.location || "Online"}</p>
                          <p>🕒 Starts {dateInfo.time}</p>
                          {event.organizer && <p>👤 Hosted by {event.organizer}</p>}
                          {event.event_images && event.event_images.length > 0 && (
                            <p className="text-[10px] font-medium text-emerald-700">
                              📸 Includes {event.event_images.length} gallery media items
                            </p>
                          )}
                        </div>

                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-lg bg-emerald-700 py-2 text-center text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
                          >
                            Register Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
