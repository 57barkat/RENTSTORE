/* eslint-disable @next/next/no-img-element */
"use client";

import { CheckCircle, Eye, MapPin, Trash2 } from "lucide-react";

import BasePropertyCard from "@/app/components/properties/BasePropertyCard";

interface PendingProperty {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  ownerId: {
    name: string;
    email: string;
    profileImage?: string;
  };
  photos: string[];
}

interface PendingPropertyCardProps {
  property: PendingProperty;
  onReview: (id: string) => void;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isProcessing?: boolean;
  activeAction?: "approve" | "delete" | null;
}

export default function PendingPropertyCard({
  property,
  onReview,
  onApprove,
  onDelete,
  isProcessing = false,
  activeAction = null,
}: PendingPropertyCardProps) {
  return (
    <BasePropertyCard
      image={property.photos?.[0] || "https://placehold.co/600x400?text=No+Image"}
      title={property.title}
      className="border-border hover:shadow-xl"
      badges={
        <span className="rounded bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
          New Submission
        </span>
      }
      overlay={
        <button
          type="button"
          onClick={() => onReview(property._id)}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur transition hover:bg-sky-50 hover:text-sky-700"
        >
          <Eye className="h-4 w-4" /> Review
        </button>
      }
      meta={
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> {property.location}
        </p>
      }
      summary={
        <div className="flex items-center justify-between border-y border-border/50 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-border bg-accent">
              {property.ownerId?.profileImage ? (
                <img
                  src={property.ownerId.profileImage}
                  alt={property.ownerId.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                Owner
              </p>
              <p className="text-[11px] font-semibold">{property.ownerId?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
              Rent
            </p>
            <p className="text-sm font-black text-primary">
              Rs. {property.monthlyRent?.toLocaleString?.() || property.monthlyRent}
            </p>
          </div>
        </div>
      }
      actions={
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDelete(property._id)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isProcessing && activeAction === "delete" ? "Rejecting..." : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => onApprove(property._id)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isProcessing && activeAction === "approve" ? "Approving..." : "Approve"}
          </button>
        </div>
      }
    />
  );
}
