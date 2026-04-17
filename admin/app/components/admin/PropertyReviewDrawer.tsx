"use client";

import {
  X,
  MapPin,
  Bed,
  Bath,
  CheckCircle,
  Trash2,
  User,
  Mail,
  Info,
  ShieldCheck,
  Home,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface PropertyReviewDrawerProps {
  property: {
    _id: string;
    title?: string;
    createdAt?: string;
    address?: Array<{
      aptSuiteUnit?: string;
      street?: string;
      city?: string;
      stateTerritory?: string;
    }>;
    photos?: string[];
    monthlyRent?: number;
    SecuritybasePrice?: number;
    apartmentType?: string;
    capacityState?: {
      bedrooms?: number;
      beds?: number;
      bathrooms?: number;
      Persons?: number;
      floorLevel?: number;
    };
    owner?: {
      profileImage?: string;
      name?: string;
      email?: string;
      phone?: string;
    };
    safetyDetailsData?: {
      safetyDetails?: string[];
      cameraDescription?: string;
    };
    description?: {
      highlighted?: string[];
    };
  } | null;
  loading: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PropertyReviewDrawer({
  property,
  onClose,
  onApprove,
  onDelete,
  loading,
}: PropertyReviewDrawerProps) {
  if (!property) return null;

  const addr = property.address?.[0] || {};

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
        className="absolute inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-2xl animate-in overflow-y-auto border-l border-border bg-card shadow-2xl slide-in-from-right duration-300">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 p-5 backdrop-blur-md">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded border border-[rgba(217,119,6,0.18)] bg-[var(--admin-warning-soft)] px-2 py-0.5 text-[10px] font-black uppercase text-[var(--admin-warning)]">
                Pending Approval
              </span>
              <span
                suppressHydrationWarning
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"
              >
                <Calendar className="h-3 w-3" />
                {new Date(property.createdAt).toLocaleDateString()}
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
                  {property.apartmentType}
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
                Owner Contact
              </h4>
              <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={property.owner?.profileImage || "https://placehold.co/100"}
                      className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover"
                      alt="Owner"
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-[var(--admin-success)]" />
                  </div>
                  <div className="truncate">
                    <p className="truncate font-black text-foreground">
                      {property.owner?.name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <Mail className="h-3 w-3" /> {property.owner?.email}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <a
                    href={`tel:${property.owner?.phone}`}
                    className="group flex items-center justify-between rounded-xl border border-[var(--admin-primary-strong)] bg-[var(--admin-primary-soft)] p-2.5 transition-colors hover:bg-[rgba(0,0,128,0.12)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[var(--admin-primary)] p-2 text-[var(--admin-background)]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase leading-none text-muted-foreground">
                          Phone Number
                        </p>
                        <p className="text-sm font-black text-foreground">
                          {property.owner?.phone || "No Phone Provided"}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Safety Check
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.safetyDetailsData?.safetyDetails?.length > 0 ? (
                  property.safetyDetailsData.safetyDetails.map((detail: string) => (
                    <span
                      key={detail}
                      className="flex items-center gap-1 rounded-md border border-[rgba(5,150,105,0.18)] bg-[var(--admin-success-soft)] px-2 py-1 text-[10px] font-bold capitalize text-[var(--admin-success)]"
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
              onClick={() => {
                onDelete(property._id);
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-error)] py-4 font-black text-[var(--admin-background)] shadow-lg shadow-[rgba(220,38,38,0.2)] transition-all hover:opacity-92"
            >
              <Trash2 className="h-5 w-5" /> REJECT
            </button>
            <button
              onClick={() => {
                onApprove(property._id);
                onClose();
              }}
              className="admin-button-primary flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-black"
            >
              <CheckCircle className="h-5 w-5" /> APPROVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
