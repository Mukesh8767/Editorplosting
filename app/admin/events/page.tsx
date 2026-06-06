"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, getEvents, createEvent, deleteEvent, type Event, type EventImage, type User } from "@/lib/blog-store";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function AdminEventsPage() {
  const [session, setSession] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [eventId, setEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("Webinar");
  const [participationType, setParticipationType] = useState<"Organized" | "Attended">("Attended");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [galleryImages, setGalleryImages] = useState<EventImage[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  
  // Custom File Upload & Drag-and-Drop States & Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      setCoverImageUrl(result.url || "");
      setMessage("Media uploaded to Cloudinary successfully!");
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const newItems: EventImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || `Upload failed for ${file.name}`);
        }

        newItems.push({
          image_url: result.url || "",
        });
      }

      setGalleryImages((prev) => {
        const updated = [...prev];
        newItems.forEach((item) => {
          updated.push({
            ...item,
            display_order: updated.length,
          });
        });
        return updated;
      });
      setMessage("Gallery media files uploaded to Cloudinary successfully!");
    } catch (err: any) {
      setError(err?.message || "Gallery upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const addGalleryUrl = () => {
    if (!tempUrl.trim()) return;
    setGalleryImages((prev) => [
      ...prev,
      {
        image_url: tempUrl.trim(),
        display_order: prev.length,
      },
    ]);
    setTempUrl("");
  };

  const removeGalleryItem = (index: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== index).map((img, idx) => ({ ...img, display_order: idx })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim() || !startDate) {
      setError("Title and Start Date are required.");
      return;
    }

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        participation_type: participationType,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        location: location.trim() || null,
        organizer: organizer.trim() || null,
        registration_url: registrationUrl.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        is_featured: isFeatured,
        created_by: session?.id || null,
        event_images: galleryImages,
      };

      if (eventId) {
        payload.id = eventId;
      }

      await createEvent(payload);
      setMessage(eventId ? "Event updated successfully!" : "Event created successfully!");
      resetForm();
      await refreshEvents();
    } catch (err: any) {
      setError(err.message || "Failed to save event.");
    }
  };

  const handleEdit = (event: Event) => {
    setEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setEventType(event.event_type || "Webinar");
    setParticipationType((event.participation_type as any) || "Attended");
    setStartDate(event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "");
    setEndDate(event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "");
    setLocation(event.location || "");
    setOrganizer(event.organizer || "");
    setRegistrationUrl(event.registration_url || "");
    setCoverImageUrl(event.cover_image_url || "");
    setIsFeatured(event.is_featured || false);
    setGalleryImages(event.event_images || []);
    setError("");
    setMessage("");
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

  const resetForm = () => {
    setEventId(null);
    setTitle("");
    setDescription("");
    setEventType("Webinar");
    setParticipationType("Attended");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setOrganizer("");
    setRegistrationUrl("");
    setCoverImageUrl("");
    setIsFeatured(false);
    setGalleryImages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-400">Admin Workspace</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Manage Events</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-400">
                Create and manage webinars, workshops, conferences, and meetups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition"
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

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.3fr]">
          {/* Create/Edit Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {eventId ? "Edit Event" : "Create Event"}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="e.g. Green Energy Webinar 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  placeholder="Details about the event agenda, topics, speakers..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="Webinar">Webinar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300">Participation Type</label>
                  <select
                    value={participationType}
                    onChange={(e) => setParticipationType(e.target.value as any)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="Attended">Attended</option>
                    <option value="Organized">Organized</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-slate-300">
                  Feature Event
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Location / Platform</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                    placeholder="e.g. Zoom / Paris, France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300">Organizer</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                    placeholder="e.g. Sustainability Team"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300">Registration Link</label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                  placeholder="https://zoom.us/webinar/register/..."
                />
              </div>

              {/* Cover media section */}
              <div className="rounded-xl border border-slate-800 p-4 bg-slate-950/20 space-y-4">
                <label className="block text-sm font-semibold text-slate-350">Cover Image or Video (main cover art)</label>
                
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => coverInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(true);
                  }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                    isDraggingCover
                      ? "border-emerald-500 bg-emerald-500/5 animate-pulse"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="p-3 bg-slate-800/80 rounded-full text-slate-400 mb-2 transition">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to upload or drag & drop cover media
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports Cover Image or Video (MP4, WEBM, PNG, JPG, etc.)
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500 font-bold">OR</span>
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 placeholder-slate-500 outline-none focus:border-emerald-500 transition text-sm"
                    placeholder="Or paste cover URL"
                  />
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-bold transition border border-rose-800/40"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {coverImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
                    {coverImageUrl.match(/\.(mp4|webm|ogg)$/i) || coverImageUrl.includes("event-videos") || coverImageUrl.includes("/video/upload/") || coverImageUrl.includes("/video/") ? (
                      <video src={coverImageUrl} controls className="max-h-[140px] w-auto" />
                    ) : (
                      <img src={coverImageUrl} alt="Cover Preview" className="max-h-[140px] object-contain" />
                    )}
                  </div>
                )}
              </div>

              {/* Additional gallery media section */}
              <div className="rounded-xl border border-slate-800 p-4 bg-slate-950/20 space-y-4">
                <label className="block text-sm font-semibold text-slate-350">Additional Event Gallery Media (Images & Videos)</label>
                
                <input
                  type="file"
                  ref={galleryInputRef}
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleGalleryUpload(files);
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => galleryInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(true);
                  }}
                  onDragLeave={() => setIsDraggingGallery(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      handleGalleryUpload(Array.from(files));
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                    isDraggingGallery
                      ? "border-emerald-500 bg-emerald-500/5 animate-pulse"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="p-3 bg-slate-800/80 rounded-full text-slate-400 mb-2 transition">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to upload or drag & drop multiple files
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload images or videos to showcase in the event gallery
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-350 placeholder-slate-500 outline-none focus:border-emerald-500 transition text-sm"
                    placeholder="Or paste additional image/video URL"
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold transition"
                  >
                    Add URL
                  </button>
                </div>

                {galleryImages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Gallery Items ({galleryImages.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryImages.map((img, index) => {
                        const isVid = img.image_url.match(/\.(mp4|webm|ogg)$/i) || img.image_url.includes("event-videos") || img.image_url.includes("/video/upload/") || img.image_url.includes("/video/");
                        return (
                          <div key={index} className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-20 group flex items-center justify-center">
                            {isVid ? (
                              <video src={img.image_url} className="h-full w-full object-cover" />
                            ) : (
                              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(index)}
                              className="absolute top-1 right-1 rounded-full bg-rose-600/90 text-white p-1 hover:bg-rose-700 shadow transition opacity-0 group-hover:opacity-100 flex items-center justify-center h-5 w-5"
                              title="Remove"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            {isVid && (
                              <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1 rounded font-bold">
                                VIDEO
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                {eventId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  {eventId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>

          {/* Events List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white mb-6">Events Overview</h2>

            {loading ? (
              <div className="text-slate-400 py-12 text-center">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-slate-400 py-12 text-center border border-dashed border-slate-800 rounded-xl">
                No events found. Start by creating one.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[900px] pr-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800 rounded-xl p-4 bg-slate-950/40 hover:border-slate-700 transition gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="h-16 w-20 bg-slate-850 border border-slate-850 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-500">
                        {event.cover_image_url ? (
                          event.cover_image_url.match(/\.(mp4|webm|ogg)$/i) || event.cover_image_url.includes("event-videos") ? (
                            <div className="bg-slate-800 text-[10px] text-emerald-400 font-bold px-2 py-1 rounded">VIDEO</div>
                          ) : (
                            <img src={event.cover_image_url} alt="" className="h-full w-full object-cover" />
                          )
                        ) : (
                          "No Cover"
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition">
                            {event.title}
                          </h3>
                          {event.is_featured && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              Featured
                            </span>
                          )}
                          {event.participation_type && (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              event.participation_type === "Organized"
                                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                                : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                            }`}>
                              {event.participation_type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {event.event_type} • {event.location || "No Location"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(event.start_date).toLocaleDateString()} at{" "}
                          {new Date(event.start_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {event.event_images && event.event_images.length > 0 && (
                          <p className="text-[10px] text-emerald-400 mt-1">
                            📸 {event.event_images.length} gallery items
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1.5 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-600/35 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1.5 bg-rose-600/20 border border-rose-600/30 text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-600/35 transition"
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
    </div>
  );
}
