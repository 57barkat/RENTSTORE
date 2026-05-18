"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X, ZoomIn } from "lucide-react";

import PropertyImagePlaceholder from "@/app/components/properties/PropertyImagePlaceholder";

interface PropertyCardGalleryTriggerProps {
  images: string[];
  imageAltBase: string;
  title: string;
  sizes: string;
}

const getImageAlt = (imageAltBase: string, index: number) =>
  index === 0 ? imageAltBase : `${imageAltBase} photo ${index + 1}`;

export default function PropertyCardGalleryTrigger({
  images,
  imageAltBase,
  title,
  sizes,
}: PropertyCardGalleryTriggerProps) {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const hasImages = galleryImages.length > 0;
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        setIndex(
          (current) =>
            (current + galleryImages.length - 1) % galleryImages.length,
        );
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        setIndex((current) => (current + 1) % galleryImages.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryImages.length, hasMultipleImages, isOpen]);

  const goPrevious = () => {
    setIndex(
      (current) => (current + galleryImages.length - 1) % galleryImages.length,
    );
  };

  const goNext = () => {
    setIndex((current) => (current + 1) % galleryImages.length);
  };

  const openGallery = () => {
    if (!hasImages) return;

    setIndex(0);
    setIsOpen(true);
  };

  if (!hasImages) {
    return (
      <div className="absolute inset-0">
        <PropertyImagePlaceholder compact />
      </div>
    );
  }

  const lightbox =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label={`${title} photo gallery`}
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(15,23,42,0.96)] px-3 py-5 backdrop-blur-xl sm:px-6"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close gallery"
                className="absolute right-3 top-3 z-[1010] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
              >
                <X size={24} />
              </button>

              {hasMultipleImages && (
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label="Previous photo"
                  className="absolute left-2 z-[1010] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14"
                >
                  <ChevronLeft size={30} />
                </button>
              )}

              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-[76dvh] w-[92vw] sm:h-[84dvh]"
              >
                <Image
                  src={galleryImages[index]}
                  alt={getImageAlt(imageAltBase, index)}
                  fill
                  sizes="92vw"
                  className="object-contain"
                  priority
                />
              </motion.div>

              {hasMultipleImages && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next photo"
                  className="absolute right-2 z-[1010] inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14"
                >
                  <ChevronRight size={30} />
                </button>
              )}

              <div className="absolute bottom-4 left-1/2 z-[1010] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur sm:bottom-6">
                <Images className="h-4 w-4" />
                {index + 1} / {galleryImages.length}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openGallery}
        className="group/gallery absolute inset-0 block h-full w-full cursor-zoom-in overflow-hidden text-left"
        aria-label={`Open photo gallery for ${title}`}
      >
        <Image
          src={galleryImages[0]}
          alt={getImageAlt(imageAltBase, 0)}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-105 group-hover/gallery:scale-105"
        />

        <span className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.18)] opacity-0 transition-opacity group-hover/gallery:opacity-100">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[var(--admin-primary)] shadow-sm backdrop-blur">
            <ZoomIn className="h-4 w-4" />
          </span>
        </span>

        {hasMultipleImages && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm backdrop-blur">
            <Images className="h-3 w-3" />
            {galleryImages.length}
          </span>
        )}
      </button>

      {lightbox}
    </>
  );
}
