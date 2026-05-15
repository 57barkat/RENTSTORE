"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  CheckCircle2,
  Images,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryProps {
  galleryImages: string[];
  imageAltBase: string;
  isFeatured?: boolean;
  isBoosted?: boolean;
  isVerified?: boolean;
  categoryLabel?: string;
}

const getImageAlt = (imageAltBase: string, index: number) =>
  index === 0 ? imageAltBase : `${imageAltBase} photo ${index + 1}`;

export default function PropertyGallery({
  galleryImages,
  imageAltBase,
  isFeatured = false,
  isBoosted = false,
  isVerified = false,
  categoryLabel = "House",
}: GalleryProps) {
  const images = useMemo(() => galleryImages.filter(Boolean), [galleryImages]);

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const hasImages = images.length > 0;
  const visibleImages = images.slice(0, 5);
  const extraPhotosCount = Math.max(0, images.length - 5);

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

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (images.length <= 1) return;

      if (event.key === "ArrowLeft") {
        setIndex((current) => (current + images.length - 1) % images.length);
      }

      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % images.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isOpen]);

  const renderBadges = () => (
    <div className="absolute left-5 top-5 z-30 flex flex-col items-start gap-2"></div>
  );

  const renderHoverOverlay = () => (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100">
      <div className="rounded-full bg-white/95 p-3 text-slate-900 shadow-xl">
        <ZoomIn size={24} />
      </div>
    </div>
  );

  if (!hasImages) {
    return (
      <div className="overflow-hidden rounded-[1.8rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
        <div className="flex aspect-[16/7] items-center justify-center bg-[var(--admin-card)] p-8 text-center">
          <p className="text-sm font-semibold text-[var(--admin-muted)]">
            No property photos available
          </p>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <section className="relative overflow-hidden rounded-[1.8rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
          <div
            role="button"
            tabIndex={0}
            className="group relative aspect-[16/7] cursor-pointer overflow-hidden bg-[var(--admin-card)]"
            onClick={() => openLightbox(0)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                openLightbox(0);
              }
            }}
          >
            <Image
              src={images[0]}
              alt={getImageAlt(imageAltBase, 0)}
              fill
              priority
              sizes="100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />

            {renderBadges()}
            {renderHoverOverlay()}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openLightbox(0);
              }}
              className="absolute bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-105"
            >
              <Images size={18} />
              View photo
            </button>
          </div>
        </section>

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
                className="absolute right-4 top-4 z-[110] rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
              >
                <X size={30} />
              </button>

              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative h-[85vh] w-[92vw]"
              >
                <Image
                  src={images[index]}
                  alt={getImageAlt(imageAltBase, index)}
                  fill
                  sizes="92vw"
                  className="object-contain"
                />
              </motion.div>

              <div className="absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
                {index + 1} / {images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
        <div className="grid h-[360px] gap-2 sm:h-[430px] lg:h-[520px] lg:grid-cols-[1.15fr_1fr]">
          <div
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden bg-[var(--admin-card)]"
            onClick={() => openLightbox(0)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                openLightbox(0);
              }
            }}
          >
            <Image
              src={images[0]}
              alt={getImageAlt(imageAltBase, 0)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />

            {renderBadges()}
            {renderHoverOverlay()}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openLightbox(0);
              }}
              className="absolute bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-105"
            >
              <Images size={18} />
              View all {images.length} photos
            </button>
          </div>

          <div className="hidden grid-cols-2 gap-2 lg:grid">
            {visibleImages.slice(1, 5).map((image, i) => {
              const imageIndex = i + 1;
              const isLastVisibleImage =
                imageIndex === 4 && extraPhotosCount > 0;

              return (
                <div
                  key={`${image}-${imageIndex}`}
                  role="button"
                  tabIndex={0}
                  className="group relative cursor-pointer overflow-hidden bg-[var(--admin-card)]"
                  onClick={() => openLightbox(imageIndex)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      openLightbox(imageIndex);
                    }
                  }}
                >
                  <Image
                    src={image}
                    alt={getImageAlt(imageAltBase, imageIndex)}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className={`object-cover transition duration-700 group-hover:scale-105 ${
                      isLastVisibleImage ? "blur-[2px]" : ""
                    }`}
                  />

                  {isLastVisibleImage && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
                      <span className="text-lg font-bold text-white">
                        +{extraPhotosCount} more
                      </span>
                    </div>
                  )}

                  {!isLastVisibleImage && renderHoverOverlay()}
                </div>
              );
            })}

            {images.length < 5 &&
              Array.from({ length: 5 - images.length }).map((_, emptyIndex) => (
                <div
                  key={`empty-${emptyIndex}`}
                  className="flex items-center justify-center bg-[var(--admin-card)] text-sm font-semibold text-[var(--admin-muted)]"
                >
                  No photo
                </div>
              ))}
          </div>
        </div>
      </section>

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
              className="absolute right-4 top-4 z-[110] rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
            >
              <X size={30} />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrevious}
                aria-label="Previous photo"
                className="absolute left-3 z-[110] rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-8 sm:p-4"
              >
                <ChevronLeft size={42} />
              </button>
            )}

            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative h-[85vh] w-[92vw]"
            >
              <Image
                src={images[index]}
                alt={getImageAlt(imageAltBase, index)}
                fill
                sizes="92vw"
                className="object-contain"
              />
            </motion.div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next photo"
                className="absolute right-3 z-[110] rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-8 sm:p-4"
              >
                <ChevronRight size={42} />
              </button>
            )}

            <div className="absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
              {index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
