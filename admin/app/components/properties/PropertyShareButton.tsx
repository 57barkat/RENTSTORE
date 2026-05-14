"use client";

import { Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface PropertyShareButtonProps {
  title: string;
  url: string;
}

export default function PropertyShareButton({
  title,
  url,
}: PropertyShareButtonProps) {
  const handleShare = async () => {
    const shareUrl =
      typeof window === "undefined" ? url : new URL(url, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Listing link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Unable to share this listing right now.");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
    >
      <Share2 size={16} />
      Share
    </button>
  );
}
