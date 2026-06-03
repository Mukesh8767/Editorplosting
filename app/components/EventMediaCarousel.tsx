"use client";

import { useState } from "react";
import { type EventImage } from "@/lib/blog-store";

type Props = {
  coverImageUrl: string | null;
  galleryImages: EventImage[];
  title: string;
};

export default function EventMediaCarousel({ coverImageUrl, galleryImages, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine cover image and gallery images
  const mediaList: string[] = [];
  if (coverImageUrl) {
    mediaList.push(coverImageUrl);
  }
  galleryImages.forEach((img) => {
    if (img.image_url && !mediaList.includes(img.image_url)) {
      mediaList.push(img.image_url);
    }
  });

  if (mediaList.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center bg-slate-950 text-slate-500 text-xs font-bold">
        No Media Available
      </div>
    );
  }

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes("event-videos");
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const activeUrl = mediaList[currentIndex];

  return (
    <div className="relative w-full h-full bg-slate-950 select-none group/carousel">
      {/* Media Rendering */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isVideo(activeUrl) ? (
          <video
            src={activeUrl}
            controls
            className="w-full h-full object-cover"
            key={activeUrl} // force reload on change
          />
        ) : (
          <img
            src={activeUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {mediaList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur transition shadow-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Previous Media"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur transition shadow-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Next Media"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators / Dots */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-4 bg-emerald-500" : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter Tag */}
      {mediaList.length > 1 && (
        <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
          {currentIndex + 1} / {mediaList.length}
        </span>
      )}
    </div>
  );
}
