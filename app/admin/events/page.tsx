"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, getEvents, deleteEvent, type Event, type User } from "@/lib/blog-store";

export default function AdminEventsPage() {
  const [session, setSession] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const user = getSession();
      if (!user) {
        router.push("/login");
        return;
      }
      setSession(user);

      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err: any) {
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const refreshEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to refresh events.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setError("");
    setMessage("");
    try {
      await deleteEvent(id);
      setMessage("Event deleted successfully!");
      await refreshEvents();
    } catch (err: any) {
      setError(err.message || "Failed to delete event.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Admin Workspace</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Events Overview</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-400">
                Manage webinars, workshops, conferences, and meetups for your readers.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                href="/admin/events/edit"
                className="inline-flex items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition shadow-lg shadow-emerald-500/20"
              >
                + Add Event
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition border border-slate-700/60"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {message ? (
          <p className="rounded-lg bg-emerald-900/20 border border-emerald-700/30 px-4 py-3 text-sm text-emerald-400">{message}</p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-rose-900/20 border border-rose-700/30 px-4 py-3 text-sm text-rose-400">{error}</p>
        ) : null}

        {/* Events list container - fully expanded */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
          {loading ? (
            <div className="text-slate-400 py-16 text-center text-lg">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-slate-400 py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-lg font-semibold text-slate-355 mb-4">No events found</p>
              <Link
                href="/admin/events/edit"
                className="inline-flex items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition"
              >
                Create your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-850 rounded-xl p-5 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40 transition gap-5 group"
                >
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="h-16 w-24 bg-slate-850 border border-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-500 shadow-inner">
                      {event.cover_image_url ? (
                        event.cover_image_url.match(/\.(mp4|webm|ogg)$/i) || event.cover_image_url.includes("event-videos") ? (
                          <div className="bg-slate-800 text-[10px] text-emerald-450 font-bold px-2 py-1 rounded">VIDEO</div>
                        ) : (
                          <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                        )
                      ) : (
                        "No Cover"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition">
                          {event.title}
                        </h3>
                        {event.is_featured && (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Featured
                          </span>
                        )}
                        {event.participation_type && (
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            event.participation_type === "Organized"
                              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                              : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                          }`}>
                            {event.participation_type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1 truncate">
                        {event.event_type} • {event.location || "No Location"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <span>📅</span>
                        {new Date(event.start_date).toLocaleDateString()} at{" "}
                        {new Date(event.start_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0 w-full md:w-auto justify-end border-t border-slate-800 md:border-t-0 pt-4 md:pt-0">
                    <Link
                      href={`/admin/events/edit?id=${event.id}`}
                      className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-600/35 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-4 py-2 bg-rose-600/20 border border-rose-600/30 text-rose-400 rounded-lg text-sm font-semibold hover:bg-rose-600/35 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
