/* eslint-disable @next/next/no-img-element */
"use client";

import {
  X,
  MapPin,
  Bed,
  Bath,
  CheckCircle,
  Trash2,
  User,
  Phone,
  Info,
  ShieldCheck,
  Home,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Building2,
  Store,
} from "lucide-react";

import { getAvatarPlaceholder } from "@/app/lib/avatar";

interface PropertyReviewOwner {
  _id?: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  subscription?: string;
  role?: string;
}

interface PropertyUploaderSummary {
  uploader?: {
    _id?: string;
    name?: string;
    phone?: string;
    profileImage?: string;
    subscription?: string;
    planLabel?: string;
    role?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
  };
  stats?: {
    totalProperties?: number;
    homes?: number;
    apartments?: number;
    hostels?: number;
    shops?: number;
    offices?: number;
  };
}

interface PropertyReviewData {
  _id: string;
  title?: string;
  createdAt?: string;
  photos?: string[];
  hostOption?: string;
  status?: boolean;
  isApproved?: boolean;
  monthlyRent?: number;
  SecuritybasePrice?: number;
  apartmentType?: string;
  hostelType?: string;
  capacityState?: {
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    Persons?: number;
  };
  address?: Array<{
    aptSuiteUnit?: string;
    street?: string;
    city?: string;
    stateTerritory?: string;
  }>;
  owner?: PropertyReviewOwner;
  uploaderSummary?: PropertyUploaderSummary;
  safetyDetailsData?: {
    safetyDetails?: string[];
    cameraDescription?: string;
  };
  description?: {
    highlighted?: string[];
  };
}

interface PropertyReviewDrawerProps {
  property: PropertyReviewData | null;
  loading: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting?: boolean;
  activeAction?: "approve" | "delete" | null;
}

export default function PropertyReviewDrawer({
  property,
  onClose,
  onApprove,
  onDelete,
  loading,
  isSubmitting = false,
  activeAction = null,
}: PropertyReviewDrawerProps) {
  if (!property) return null;

  const addr = property.address?.[0] || {};
  const createdAtLabel = property.createdAt
    ? new Date(property.createdAt).toLocaleDateString()
    : "Unknown";
  const safetyDetails = property.safetyDetailsData?.safetyDetails ?? [];
  const categoryLabel = property.hostOption
    ? property.hostOption.charAt(0).toUpperCase() + property.hostOption.slice(1)
    : "Property";
  const approvalLabel = property.isApproved ? "Approved" : "Pending Approval";
  const listingLabel = property.status ? "Active" : "Inactive";
  const uploader = property.uploaderSummary?.uploader ?? property.owner;
  const uploaderStats = property.uploaderSummary?.stats;
  const uploaderPlan = property.uploaderSummary?.uploader?.planLabel || "Free Member";

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-2xl animate-in overflow-y-auto border-l border-border bg-card shadow-2xl slide-in-from-right duration-300">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 p-5 backdrop-blur-md">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-600">
                {approvalLabel}
              </span>
              <span className="rounded border border-border bg-accent px-2 py-0.5 text-[10px] font-black uppercase text-foreground">
                {categoryLabel}
              </span>
              <span className="rounded border border-border bg-card px-2 py-0.5 text-[10px] font-black uppercase text-slate-600">
                {listingLabel}
              </span>
              <span
                suppressHydrationWarning
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"
              >
                <Calendar className="h-3 w-3" />
                {createdAtLabel}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Review Property</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div className="grid grid-cols-2 gap-2">
            {property.photos?.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                className={`rounded-xl border border-border object-cover shadow-sm ${
                  index === 0 ? "col-span-2 h-72" : "h-32"
                }`}
                alt="property"
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-2xl font-black leading-tight text-foreground">
                {property.title}
              </h3>
              <p className="flex items-start text-sm font-medium text-muted-foreground">
                <MapPin className="mt-0.5 mr-1.5 h-4 w-4 shrink-0 text-primary" />
                {addr.aptSuiteUnit}, {addr.street}, {addr.city},{" "}
                {addr.stateTerritory}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Monthly
                </p>
                <p className="text-lg font-black text-primary">
                  Rs. {property.monthlyRent}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Security
                </p>
                <p className="text-lg font-black text-foreground">
                  Rs. {property.SecuritybasePrice}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Type
                </p>
                <p className="text-lg font-black text-foreground">
                  {property.apartmentType || property.hostelType || categoryLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
              <Home className="h-4 w-4" /> Listing Specifications
            </h4>
            <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
              <span className="flex items-center gap-2 text-foreground/80">
                <Bed className="h-4 w-4 text-primary" />
                {property.capacityState?.bedrooms} Bedrooms
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <Bed className="h-4 w-4 text-primary" />
                {property.capacityState?.beds} Total Beds
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <Bath className="h-4 w-4 text-primary" />
                {property.capacityState?.bathrooms} Bathrooms
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <User className="h-4 w-4 text-primary" /> Max{" "}
                {property.capacityState?.Persons} Persons
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Uploader Details
              </h4>
              <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        uploader?.profileImage ||
                        getAvatarPlaceholder(uploader?.name || "Uploader")
                      }
                      className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover"
                      alt="Uploader"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-green-500">
                      <BadgeCheck className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-foreground">
                      {uploader?.name || "Unknown uploader"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded-full border border-primary/15 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">
                        {uploaderPlan}
                      </span>
                      <span className="rounded-full border border-border bg-accent px-2 py-1 text-[10px] font-black uppercase text-muted-foreground">
                        {uploader?.role || "user"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-black text-foreground">
                      {uploaderStats?.totalProperties ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      Houses
                    </p>
                    <p className="mt-1 text-lg font-black text-foreground">
                      {uploaderStats?.homes ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                      <Store className="h-3 w-3" />
                      Shops
                    </p>
                    <p className="mt-1 text-lg font-black text-foreground">
                      {uploaderStats?.shops ?? 0}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <a
                    href={`tel:${uploader?.phone}`}
                    className="group flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-2.5 transition-colors hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary p-2 text-white">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase leading-none text-muted-foreground">
                          Phone Number
                        </p>
                        <p className="text-sm font-black text-foreground">
                          {uploader?.phone || "No Phone Provided"}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Apartments
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {uploaderStats?.apartments ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Hostels
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {uploaderStats?.hostels ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Offices
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {uploaderStats?.offices ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Safety Check
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {safetyDetails.length > 0 ? (
                  safetyDetails.map((detail: string) => (
                    <span
                      key={detail}
                      className="flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold capitalize text-green-600"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {detail.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No safety features listed
                  </p>
                )}
              </div>
              {property.safetyDetailsData?.cameraDescription && (
                <div className="mt-2 rounded-lg border border-amber-500/10 bg-amber-500/5 p-2.5">
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600">
                    <Info className="h-3 w-3" /> Camera Notes
                  </p>
                  <p className="text-[11px] italic leading-relaxed text-foreground/80">
                    {property.safetyDetailsData.cameraDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-muted-foreground">
              Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {property.description?.highlighted?.map((highlight: string) => (
                <span
                  key={highlight}
                  className="rounded-lg border border-border bg-accent px-3 py-1 text-[11px] font-bold capitalize"
                >
                  {highlight.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 flex gap-4 border-t border-border bg-card/90 pb-2 pt-4 backdrop-blur-md">
            <button
              disabled={isSubmitting}
              onClick={async () => {
                await onDelete(property._id);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 font-black text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-5 w-5" />
              {isSubmitting && activeAction === "delete" ? "REJECTING..." : "REJECT"}
            </button>
            {property.isApproved ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-accent py-4 font-black text-muted-foreground">
                Already Approved
              </div>
            ) : (
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  await onApprove(property._id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white shadow-lg shadow-primary/30 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle className="h-5 w-5" />
                {isSubmitting && activeAction === "approve" ? "APPROVING..." : "APPROVE"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
