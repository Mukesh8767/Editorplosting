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
    <div className="app-shell min-h-screen relative overflow-hidden pb-20 text-slate-900">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] -z-10" />
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-[150px] -z-10" />

      {/* Glassmorphic Navbar */}
      <nav className="sticky top-0 w-full z-50 border-b border-white/60 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/posts" className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight hover:text-emerald-700 transition">
              Sustainability<span className="text-emerald-600">Journal</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/posts" className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition">
              Articles
            </Link>
            <Link href="/events" className="text-sm font-semibold text-emerald-650 hover:text-emerald-600 transition">
              Events
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-md shadow-emerald-600/10 transition"
            >
              Writer Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16 space-y-16">
        
        {/* Centered Hero Section */}
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.32em] text-emerald-700 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full inline-block">
            Green Forums & Meetups
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-none pt-2">
            Sustainability Events
          </h1>
          <p className="text-sm md:text-base text-slate-650 leading-relaxed max-w-xl mx-auto">
            Join panel debates, interactive webinars, and local meetups addressing smart resource usage and eco-innovations.
          </p>
        </header>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Highlights</h2>
              <div className="h-[2px] bg-slate-200 flex-1" />
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              {featuredEvents.map((event) => {
                const dateInfo = formatEventDate(event.start_date);

                return (
                  <div
                    key={event.id}
                    className="flex flex-col rounded-3xl border border-white/60 bg-white/75 shadow-xl hover:shadow-2xl hover:border-emerald-300/40 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Media section (Carousel) */}
                    <div className="relative h-64 bg-slate-950 overflow-hidden shrink-0">
                      <EventMediaCarousel
                        coverImageUrl={event.cover_image_url || null}
                        galleryImages={event.event_images || []}
                        title={event.title}
                      />

                      {/* Date Overlay badge */}
                      <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur text-white flex flex-col items-center justify-center rounded-2xl h-14 w-14 shadow-lg border border-emerald-500/20 z-20">
                        <span className="text-lg font-black leading-none">{dateInfo.day}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-1">{dateInfo.month}</span>
                      </div>

                      {/* Type Tag */}
                      {event.event_type && (
                        <span className="absolute top-4 right-4 rounded-full bg-slate-900/85 backdrop-blur px-3 py-1 text-[10px] font-bold text-slate-100 border border-white/10 z-20">
                          {event.event_type}
                        </span>
                      )}
                    </div>

                    {/* Content section */}
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition">
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
                            <p className="text-[10px] text-emerald-650 font-bold">
                              📸 Includes {event.event_images.length} gallery media items
                            </p>
                          )}
                        </div>

                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 text-xs shadow-md shadow-emerald-600/25 transition shrink-0"
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">All Upcoming Events</h2>
            <div className="h-[2px] bg-slate-200 flex-1" />
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/65 p-12 text-center shadow-lg backdrop-blur">
              <p className="text-base font-semibold text-slate-500">No events scheduled yet. Check back soon!</p>
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
                    className="flex flex-col rounded-3xl border border-white/60 bg-white/70 shadow-lg hover:shadow-xl hover:border-emerald-300/40 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Media section (Carousel) */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden shrink-0">
                      <EventMediaCarousel
                        coverImageUrl={event.cover_image_url || null}
                        galleryImages={event.event_images || []}
                        title={event.title}
                      />

                      {/* Date Overlay badge */}
                      <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur text-white flex flex-col items-center justify-center rounded-xl h-12 w-12 shadow-md border border-emerald-500/10 z-20">
                        <span className="text-base font-black leading-none">{dateInfo.day}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">{dateInfo.month}</span>
                      </div>

                      {/* Type Tag */}
                      {event.event_type && (
                        <span className="absolute top-3 right-3 rounded-full bg-slate-900/85 backdrop-blur px-2.5 py-0.5 text-[9px] font-bold text-slate-100 border border-white/10 z-20">
                          {event.event_type}
                        </span>
                      )}
                    </div>

                    {/* Content section */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition truncate">
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
                            <p className="text-[10px] text-emerald-650 font-bold">
                              📸 Includes {event.event_images.length} gallery media items
                            </p>
                          )}
                        </div>

                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-xs transition shadow-sm"
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
