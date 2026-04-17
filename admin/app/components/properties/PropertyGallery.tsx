"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryProps {
  galleryImages: string[];
  title: string;
}

export default function PropertyGallery({
  galleryImages,
  title,
}: GalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openLightbox = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-background)] shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
        <div className="grid gap-2 md:grid-cols-[1.4fr_0.6fr]">
          {/* Main Image */}
          <div
            className="group relative aspect-[16/11] cursor-pointer overflow-hidden bg-[var(--admin-card)]"
            onClick={() => openLightbox(0)}
          >
            <img
              src={galleryImages[0]}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="text-[var(--admin-background)]" size={32} />
            </div>
          </div>

          {/* Side Previews */}
          <div className="grid gap-2 p-2 md:grid-rows-2">
            {galleryImages.slice(1, 3).map((image, i) => (
              <div
                key={i}
                className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-[1.5rem] bg-[var(--admin-card)]"
                onClick={() => openLightbox(i + 1)}
              >
                <img
                  src={image}
                  alt={`${title} preview`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {i === 1 && galleryImages.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.4)] font-medium text-[var(--admin-background)]">
                    +{galleryImages.length - 3} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.96)] backdrop-blur-xl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-8 top-8 z-[110] rounded-full p-2 text-[var(--admin-background)] hover:bg-[rgba(255,255,255,0.1)]"
            >
              <X size={30} />
            </button>

            <button
              onClick={() =>
                setIndex(
                  (index + galleryImages.length - 1) % galleryImages.length,
                )
              }
              className="absolute left-8 z-[110] p-4 text-[var(--admin-background)]"
            >
              <ChevronLeft size={48} />
            </button>

            <motion.img
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={galleryImages[index]}
              className="h-[85vh] w-[90vw] object-contain"
            />

            <button
              onClick={() => setIndex((index + 1) % galleryImages.length)}
              className="absolute right-8 z-[110] p-4 text-[var(--admin-background)]"
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
