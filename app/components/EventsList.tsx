"use client";

import { useState } from "react";
import EventMediaCarousel from "./EventMediaCarousel";

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

type EventsListProps = {
  initialEvents: Event[];
};

export default function EventsList({ initialEvents }: EventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const featuredEvents = initialEvents.filter((e) => e.is_featured);
  const regularEvents = initialEvents.filter((e) => !e.is_featured);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { day, month, time };
  };

  const getPlainText = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  };

  return (
    <>
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
                  onClick={() => setSelectedEvent(event)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm transition duration-300 hover:border-emerald-250 hover:shadow-md cursor-pointer"
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
                        {getPlainText(event.description)}
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
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-750 transition"
                        >
                          View Details
                        </button>
                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
                          >
                            Register Now
                          </a>
                        )}
                      </div>
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

        {initialEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm">
            <p className="text-base font-medium text-slate-500">No events scheduled yet. Check back soon!</p>
          </div>
        ) : regularEvents.length === 0 && featuredEvents.length > 0 ? (
          <div className="text-slate-550 text-sm">No other events listed currently.</div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {regularEvents.map((event) => {
              const dateInfo = formatEventDate(event.start_date);

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/88 shadow-sm transition duration-300 hover:border-emerald-250 hover:shadow-md cursor-pointer"
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
                        {getPlainText(event.description)}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p>📍 {event.location || "Online"}</p>
                        <p>🕒 Starts {dateInfo.time}</p>
                        {event.organizer && <p>👤 Hosted by {event.organizer}</p>}
                      </div>

                      <div className="flex gap-2 w-full mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="flex-1 rounded-lg border border-slate-250 bg-white hover:bg-slate-50 py-2 text-center text-xs font-semibold text-slate-750 transition"
                        >
                          Details
                        </button>
                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 rounded-lg bg-emerald-700 py-2 text-center text-xs font-medium text-white shadow-sm transition hover:bg-emerald-800"
                          >
                            Register
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Elegant Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md transition-all duration-300 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Media & Title overlay */}
            <div className="relative h-64 sm:h-80 bg-slate-950 shrink-0">
              <EventMediaCarousel
                coverImageUrl={selectedEvent.cover_image_url || null}
                galleryImages={selectedEvent.event_images || []}
                title={selectedEvent.title}
              />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-30 rounded-full bg-black/60 hover:bg-black/85 text-white p-2 border border-white/20 transition-all hover:scale-105 shadow"
                aria-label="Close details"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 pt-12 z-20">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {selectedEvent.event_type && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/35 px-3 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                      {selectedEvent.event_type}
                    </span>
                  )}
                  {selectedEvent.participation_type && (
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/35 px-3 py-0.5 text-[10px] font-bold text-blue-400 backdrop-blur-sm">
                      {selectedEvent.participation_type}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Info Details */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] border-b border-slate-100 bg-slate-50 p-6 gap-4 text-xs text-slate-700 shrink-0">
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <span>📅</span> Date & Time
                </p>
                <p>
                  Start: {new Date(selectedEvent.start_date).toLocaleDateString()} at{" "}
                  {new Date(selectedEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {selectedEvent.end_date && (
                  <p>
                    End: {new Date(selectedEvent.end_date).toLocaleDateString()} at{" "}
                    {new Date(selectedEvent.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-slate-900">📍 Location / Platform</p>
                  <p className="text-slate-650">{selectedEvent.location || "Online"}</p>
                </div>
                {selectedEvent.organizer && (
                  <div>
                    <p className="font-semibold text-slate-900">👤 Hosted by</p>
                    <p className="text-slate-650">{selectedEvent.organizer}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Scrollable Description */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100">
                About the Event
              </h4>
              <div 
                className="prose prose-slate max-w-none text-slate-800 text-sm md:text-base leading-relaxed break-words"
                style={{ fontFamily: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: selectedEvent.description || "<p class='text-slate-400 italic'>No description details provided.</p>" }}
              />
            </div>

            {/* Modal Footer actions */}
            {selectedEvent.registration_url && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <a
                  href={selectedEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-xs font-semibold text-white shadow transition-all hover:bg-emerald-800 hover:scale-[1.02]"
                >
                  Register / Join Event ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
