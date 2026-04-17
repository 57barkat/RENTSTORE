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
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PendingPropertyCard({
  property,
  onReview,
  onApprove,
  onDelete,
}: PendingPropertyCardProps) {
  return (
    <BasePropertyCard
      image={property.photos?.[0] || "https://placehold.co/600x400?text=No+Image"}
      title={property.title}
      className="border-[var(--admin-border)] hover:shadow-[0_24px_46px_-32px_var(--admin-shadow)]"
      badges={
        <span className="rounded bg-[var(--admin-primary)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--admin-background)] shadow-lg shadow-[rgba(0,0,128,0.18)]">
          New Submission
        </span>
      }
      overlay={
        <button
          type="button"
          onClick={() => onReview(property._id)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[rgba(255,255,255,0.96)] px-4 py-2 text-xs font-bold text-[var(--admin-text)] shadow-lg backdrop-blur transition hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
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
            className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(220,38,38,0.18)] bg-[var(--admin-error-soft)] px-3 py-2 text-xs font-bold text-[var(--admin-error)] transition-all hover:bg-[var(--admin-error)] hover:text-[var(--admin-background)]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Reject
          </button>
          <button
            type="button"
            onClick={() => onApprove(property._id)}
            className="admin-button-primary flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
        </div>
      }
    />
  );
}
