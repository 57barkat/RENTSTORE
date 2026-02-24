"use client";

import React from "react";
import {
  X,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
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

interface PropertyByIdProps {
  // eslint-disable-next-line
  property: any;
  loading: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

const PropertyById = ({
  property,
  onClose,
  onApprove,
  onDelete,
  loading,
}: PropertyByIdProps) => {
  if (!property) return null;

  const addr = property.address?.[0] || {};
  console.log("Rendering PropertyById with property:", property);
  return loading ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ) : (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card h-full shadow-2xl border-l border-border overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-card/90 backdrop-blur-md z-20 p-5 border-b border-border flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-amber-500/20">
                Pending Approval
              </span>
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />{" "}
                {new Date(property.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Review Property
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-2">
            {property.photos?.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                className={`rounded-xl object-cover border border-border shadow-sm ${i === 0 ? "col-span-2 h-72" : "h-32"}`}
                alt="property"
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-foreground leading-tight mb-2">
                {property.title}
              </h3>
              <p className="flex items-start text-muted-foreground text-sm font-medium">
                <MapPin className="w-4 h-4 mr-1.5 text-primary shrink-0 mt-0.5" />
                {addr.aptSuiteUnit}, {addr.street}, {addr.city},{" "}
                {addr.stateTerritory}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Monthly
                </p>
                <p className="text-lg font-black text-primary">
                  ${property.monthlyRent}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Security
                </p>
                <p className="text-lg font-black text-foreground">
                  ${property.SecuritybasePrice}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Type
                </p>
                <p className="text-lg font-black text-foreground">
                  {property.apartmentType}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
            <h4 className="text-xs font-black text-primary uppercase mb-4 tracking-widest flex items-center gap-2">
              <Home className="w-4 h-4" /> Listing Specifications
            </h4>
            <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
              <span className="flex items-center gap-2 text-foreground/80">
                <Bed className="w-4 h-4 text-primary" />{" "}
                {property.capacityState?.bedrooms} Bedrooms
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <Bed className="w-4 h-4 text-primary" />{" "}
                {property.capacityState?.beds} Total Beds
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <Bath className="w-4 h-4 text-primary" />{" "}
                {property.capacityState?.bathrooms} Bathrooms
              </span>
              <span className="flex items-center gap-2 text-foreground/80">
                <User className="w-4 h-4 text-primary" /> Max{" "}
                {property.capacityState?.Persons} Persons
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Owner Contact
              </h4>
              <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        property.owner?.profileImage ||
                        "https://placehold.co/100"
                      }
                      className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                      alt="Owner"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"
                      title="Verified User"
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-black text-foreground truncate">
                      {property.owner?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {property.owner?.email}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <a
                    href={`tel:${property.owner?.phone}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg text-white">
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
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm font-black text-foreground">
                          {property.owner?.phone || "No Phone Provided"}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Safety Check
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.safetyDetailsData?.safetyDetails?.length > 0 ? (
                  property.safetyDetailsData.safetyDetails.map((s: string) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-green-500/10 text-green-600 text-[10px] rounded-md font-bold border border-green-500/20 flex items-center gap-1 capitalize"
                    >
                      <ShieldCheck className="w-3 h-3" /> {s.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No safety features listed
                  </p>
                )}
              </div>
              {property.safetyDetailsData?.cameraDescription && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Camera Notes
                  </p>
                  <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                    {property.safetyDetailsData.cameraDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-muted-foreground uppercase">
              Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {property.description?.highlighted?.map((h: string) => (
                <span
                  key={h}
                  className="px-3 py-1 bg-accent text-[11px] font-bold rounded-lg border border-border capitalize"
                >
                  {h.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-card/90 backdrop-blur-md pt-4 pb-2 border-t border-border flex gap-4">
            <button
              onClick={() => {
                onDelete(property._id);
                onClose();
              }}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-5 h-5" /> REJECT
            </button>
            <button
              onClick={() => {
                onApprove(property._id);
                onClose();
              }}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> APPROVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyById;
