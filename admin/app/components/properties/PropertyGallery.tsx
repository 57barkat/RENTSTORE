/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryProps {
  galleryImages: string[];
  title: string;
  isFeatured?: boolean;
  isBoosted?: boolean;
  isVerified?: boolean;
}

const getImageAlt = (title: string, index: number) =>
  index === 0 ? title : `${title} photo ${index + 1}`;

export default function PropertyGallery({
  galleryImages,
  title,
  isFeatured = false,
  isBoosted = false,
  isVerified = false,
}: GalleryProps) {
  const images = useMemo(() => galleryImages.filter(Boolean), [galleryImages]);

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const hasImages = images.length > 0;
  const extraPhotosCount = Math.max(0, images.length - 4);

  const renderBadges = () => (
    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
      {isFeatured && (
        <span className="rounded-full bg-[var(--admin-accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_24px_-16px_var(--admin-accent)]">
          Featured
        </span>
      )}
      {!isFeatured && isBoosted && (
        <span className="rounded-full bg-[var(--admin-secondary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
          Boosted
        </span>
      )}
      {isVerified && (
        <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[var(--admin-secondary)] shadow-sm">
          Verified
        </span>
      )}
    </div>
  );

  const openLightbox = (i: number) => {
    if (!hasImages) {
      return;
    }

    setIndex(i);
    setIsOpen(true);
  };

  const goPrevious = () => {
    setIndex((current) => (current + images.length - 1) % images.length);
  };

  const goNext = () => {
    setIndex((current) => (current + 1) % images.length);
  };

  if (!hasImages) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
        <div className="flex aspect-[16/9] items-center justify-center bg-[var(--admin-card)] p-8 text-center">
          <p className="text-sm font-semibold text-[var(--admin-muted)]">
            No property photos available
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
        {images.length === 1 && (
          <div
            className="group relative aspect-[16/9] cursor-pointer overflow-hidden bg-[var(--admin-card)]"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0]}
              alt={getImageAlt(title, 0)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            {(isFeatured || isBoosted || isVerified) && renderBadges()}

            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="text-white" size={32} />
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid gap-2 p-2 md:grid-cols-2">
            {images.map((image, i) => (
              <div
                key={`${image}-${i}`}
                className="group relative aspect-[16/11] cursor-pointer overflow-hidden rounded-[1.6rem] bg-[var(--admin-card)]"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={image}
                  alt={getImageAlt(title, i)}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {i === 0 && (isFeatured || isBoosted || isVerified) && renderBadges()}

                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="text-white" size={32} />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="grid gap-2 p-2 lg:grid-cols-[1.15fr_0.85fr]">
            <div
              className="group relative aspect-[16/11] cursor-pointer overflow-hidden rounded-[1.6rem] bg-[var(--admin-card)]"
              onClick={() => openLightbox(0)}
            >
              <img
                src={images[0]}
                alt={getImageAlt(title, 0)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {(isFeatured || isBoosted || isVerified) && renderBadges()}

              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="text-white" size={32} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {images.slice(1, 3).map((image, i) => (
                <div
                  key={`${image}-${i + 1}`}
                  className="group relative aspect-[16/11] cursor-pointer overflow-hidden rounded-[1.6rem] bg-[var(--admin-card)] lg:aspect-auto"
                  onClick={() => openLightbox(i + 1)}
                >
                  <img
                    src={image}
                    alt={getImageAlt(title, i + 1)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="text-white" size={28} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length >= 4 && (
          <div className="grid gap-2 p-2 lg:grid-cols-[1.35fr_0.65fr]">
            <div
              className="group relative aspect-[16/11] cursor-pointer overflow-hidden rounded-[1.6rem] bg-[var(--admin-card)]"
              onClick={() => openLightbox(0)}
            >
              <img
                src={images[0]}
                alt={getImageAlt(title, 0)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {(isFeatured || isBoosted || isVerified) && renderBadges()}

              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="text-white" size={32} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-2 lg:grid-rows-2">
              {images.slice(1, 4).map((image, i) => {
                const imageIndex = i + 1;
                const isBottomWide = i === 2;

                return (
                  <div
                    key={`${image}-${imageIndex}`}
                    className={`group relative cursor-pointer overflow-hidden rounded-[1.5rem] bg-[var(--admin-card)] ${
                      isBottomWide
                        ? "col-span-2 aspect-[16/7.8]"
                        : "aspect-[16/10]"
                    }`}
                    onClick={() => openLightbox(imageIndex)}
                  >
                    <img
                      src={image}
                      alt={getImageAlt(title, imageIndex)}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {isBottomWide && extraPhotosCount > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.42)] text-sm font-bold text-white sm:text-base">
                        +{extraPhotosCount} Photos
                      </div>
                    )}

                    {!isBottomWide && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIn className="text-white" size={28} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.96)] px-4 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close gallery"
              className="absolute right-4 top-4 z-[110] rounded-full p-2 text-white transition hover:bg-white/10 sm:right-8 sm:top-8"
            >
              <X size={30} />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrevious}
                aria-label="Previous photo"
                className="absolute left-3 z-[110] rounded-full p-3 text-white transition hover:bg-white/10 sm:left-8 sm:p-4"
              >
                <ChevronLeft size={42} />
              </button>
            )}

            <motion.img
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[index]}
              alt={getImageAlt(title, index)}
              className="max-h-[85vh] w-[92vw] object-contain"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next photo"
                className="absolute right-3 z-[110] rounded-full p-3 text-white transition hover:bg-white/10 sm:right-8 sm:p-4"
              >
                <ChevronRight size={42} />
              </button>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
