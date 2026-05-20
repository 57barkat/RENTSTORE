"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  MapPin,
  CheckCircle,
  Trash2,
  Phone,
  Home,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Pencil,
  Save,
} from "lucide-react";

import { getAvatarPlaceholder } from "@/app/lib/avatar";
import { formatStableDate } from "@/app/lib/promotion";
import { PROPERTY_SIZE_UNITS } from "@/app/lib/property-types";

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
  featured?: boolean;
  featuredUntil?: string;
  isBoosted?: boolean;
  boostedUntil?: string;
  sortWeight?: number;
  views?: number;
  impressions?: number;
  featuredImpressions?: number;
  boostedImpressions?: number;
  normalImpressions?: number;
  promotedImpressions?: number;
  promotionStatusLabel?: string;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  defaultRentType?: "daily" | "weekly" | "monthly";
  SecuritybasePrice?: number;
  apartmentType?: string;
  hostelType?: string;
  location?: string;
  area?: string;
  size?: {
    value?: number;
    unit?: string;
  };
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
    country?: string;
    zipCode?: string;
  }>;
  owner?: PropertyReviewOwner;
  uploaderSummary?: PropertyUploaderSummary;
  description?: string | {
    highlighted?: string[];
    value?: string;
    text?: string;
    body?: string;
    summary?: string;
  };
}

interface EditablePropertyForm {
  title: string;
  location: string;
  area: string;
  monthlyRent: string;
  dailyRent: string;
  weeklyRent: string;
  defaultRentType: "daily" | "weekly" | "monthly";
  SecuritybasePrice: string;
  sizeValue: string;
  sizeUnit: string;
  apartmentType: string;
  hostelType: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  Persons: string;
  aptSuiteUnit: string;
  street: string;
  city: string;
  stateTerritory: string;
  country: string;
  zipCode: string;
  description: string;
  highlighted: string;
  status: boolean;
  featured: boolean;
  isBoosted: boolean;
  featuredUntil: string;
  boostedUntil: string;
}

interface PropertyReviewDrawerProps {
  property: PropertyReviewData | null;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting?: boolean;
  activeAction?: "approve" | "delete" | "save" | null;
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const serializeList = (values?: string[]) => (values || []).join(", ");

const parseList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

const toNumberOrUndefined = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildInitialForm = (property: PropertyReviewData): EditablePropertyForm => {
  const address = property.address?.[0] || {};

  return {
    title: property.title || "",
    location: property.location || "",
    area: property.area || "",
    monthlyRent: property.monthlyRent ? String(property.monthlyRent) : "",
    dailyRent: property.dailyRent ? String(property.dailyRent) : "",
    weeklyRent: property.weeklyRent ? String(property.weeklyRent) : "",
    defaultRentType: property.defaultRentType || "monthly",
    SecuritybasePrice: property.SecuritybasePrice
      ? String(property.SecuritybasePrice)
      : "",
    sizeValue: property.size?.value ? String(property.size.value) : "",
    sizeUnit: property.size?.unit || "",
    apartmentType: property.apartmentType || "",
    hostelType: property.hostelType || "",
    bedrooms: property.capacityState?.bedrooms
      ? String(property.capacityState.bedrooms)
      : "",
    beds: property.capacityState?.beds ? String(property.capacityState.beds) : "",
    bathrooms: property.capacityState?.bathrooms
      ? String(property.capacityState.bathrooms)
      : "",
    Persons: property.capacityState?.Persons
      ? String(property.capacityState.Persons)
      : "",
    aptSuiteUnit: address.aptSuiteUnit || "",
    street: address.street || "",
    city: address.city || "",
    stateTerritory: address.stateTerritory || "",
    country: address.country || "",
    zipCode: address.zipCode || "",
    description:
      typeof property.description === "string"
        ? property.description
        : property.description?.value ||
          property.description?.text ||
          property.description?.body ||
          property.description?.summary ||
          "",
    highlighted:
      typeof property.description === "object"
        ? serializeList(property.description?.highlighted)
        : "",
    status: Boolean(property.status),
    featured: Boolean(property.featured),
    isBoosted: Boolean(property.isBoosted),
    featuredUntil: property.featuredUntil
      ? property.featuredUntil.slice(0, 10)
      : "",
    boostedUntil: property.boostedUntil ? property.boostedUntil.slice(0, 10) : "",
  };
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

export default function PropertyReviewDrawer({
  property,
  onClose,
  onSave,
  onApprove,
  onDelete,
  loading,
  isSubmitting = false,
  activeAction = null,
}: PropertyReviewDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditablePropertyForm | null>(
    property ? buildInitialForm(property) : null,
  );

  const uploader = property?.uploaderSummary?.uploader ?? property?.owner;
  const uploaderStats = property?.uploaderSummary?.stats;
  const uploaderPlan =
    property?.uploaderSummary?.uploader?.planLabel || "Free Member";
  const uploaderStatCards = [
    { label: "Total", value: uploaderStats?.totalProperties ?? 0 },
    { label: "Houses", value: uploaderStats?.homes ?? 0 },
    { label: "Apartments", value: uploaderStats?.apartments ?? 0 },
    { label: "Hostels", value: uploaderStats?.hostels ?? 0 },
    { label: "Shops", value: uploaderStats?.shops ?? 0 },
    { label: "Offices", value: uploaderStats?.offices ?? 0 },
  ];

  const createdAtLabel = property?.createdAt
    ? formatStableDate(property.createdAt)
    : "Unknown";
  const categoryLabel = property?.hostOption
    ? property.hostOption.charAt(0).toUpperCase() + property.hostOption.slice(1)
    : "Property";
  const approvalLabel = property?.isApproved ? "Approved" : "Pending Approval";
  const listingLabel = property?.status ? "Active" : "Inactive";
  const promotionLabel = property?.promotionStatusLabel || "Normal";
  const ctr =
    property?.impressions && property.impressions > 0
      ? ((property.views || 0) / property.impressions) * 100
      : 0;

  const addressLabel = useMemo(() => {
    const addr = property?.address?.[0] || {};
    return [addr.aptSuiteUnit, addr.street, addr.city, addr.stateTerritory]
      .filter(Boolean)
      .join(", ");
  }, [property?.address]);
  const propertySizeLabel = [form?.sizeValue?.trim(), form?.sizeUnit?.trim()]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    console.log("[admin-property-review] drawer property payload", {
      propertyId: property?._id,
      hostOption: property?.hostOption,
      rawSize: property?.size,
      location: property?.location,
      area: property?.area,
      address: property?.address,
    });
  }, [
    property?._id,
    property?.hostOption,
    property?.size,
    property?.location,
    property?.area,
    property?.address,
  ]);

  useEffect(() => {
    console.log("[admin-property-review] drawer form state", {
      propertyId: property?._id,
      sizeValue: form?.sizeValue,
      sizeUnit: form?.sizeUnit,
      propertySizeLabel,
      isEditing,
    });
  }, [form?.sizeUnit, form?.sizeValue, isEditing, property?._id, propertySizeLabel]);

  if (!property) return null;

  if (loading || !form) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const setField = <K extends keyof EditablePropertyForm>(
    key: K,
    value: EditablePropertyForm[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      location: form.location.trim(),
      area: form.area.trim(),
      monthlyRent: toNumberOrUndefined(form.monthlyRent),
      dailyRent: toNumberOrUndefined(form.dailyRent),
      weeklyRent: toNumberOrUndefined(form.weeklyRent),
      defaultRentType: form.defaultRentType,
      SecuritybasePrice: toNumberOrUndefined(form.SecuritybasePrice),
      size: {
        value: toNumberOrUndefined(form.sizeValue),
        unit: form.sizeUnit.trim() || undefined,
      },
      apartmentType: form.apartmentType.trim() || undefined,
      hostelType: form.hostelType.trim() || undefined,
      status: property.isApproved ? form.status : false,
      capacityState: {
        bedrooms: toNumberOrUndefined(form.bedrooms),
        beds: toNumberOrUndefined(form.beds),
        bathrooms: toNumberOrUndefined(form.bathrooms),
        Persons: toNumberOrUndefined(form.Persons),
      },
      address: [
        {
          aptSuiteUnit: form.aptSuiteUnit.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          stateTerritory: form.stateTerritory.trim(),
          country: form.country.trim(),
          zipCode: form.zipCode.trim(),
        },
      ],
      description: {
        value: form.description.trim(),
        highlighted: parseList(form.highlighted),
      },
      featured: form.featured,
      isBoosted: form.isBoosted,
      featuredUntil: form.featuredUntil || undefined,
      boostedUntil: form.boostedUntil || undefined,
    };

    await onSave(property._id, payload);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative h-full w-full max-w-3xl animate-in overflow-y-auto border-l border-border bg-card shadow-2xl slide-in-from-right duration-300">
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
              <span className="rounded border border-border bg-accent px-2 py-0.5 text-[10px] font-black uppercase text-foreground">
                {promotionLabel}
              </span>
              <span
                suppressHydrationWarning
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"
              >
                <Calendar className="h-3 w-3" />
                {createdAtLabel}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {isEditing ? "Edit Property" : "Review Property"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setForm(buildInitialForm(property));
                }
                setIsEditing((current) => !current);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Field label="Title">
              {isEditing ? (
                <input
                  className={inputClassName}
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                />
              ) : (
                <h3 className="text-2xl font-black leading-tight text-foreground">
                  {property.title}
                </h3>
              )}
            </Field>

            <Field label="Location">
              {isEditing ? (
                <input
                  className={inputClassName}
                  value={form.location}
                  onChange={(event) => setField("location", event.target.value)}
                />
              ) : (
                <p className="flex items-start text-sm font-medium text-muted-foreground">
                  <MapPin className="mt-0.5 mr-1.5 h-4 w-4 shrink-0 text-primary" />
                  {addressLabel || "No address provided"}
                </p>
              )}
            </Field>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Promotion Controls
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paid promotion only affects matching search results. Filters still apply.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Sort Weight
                </p>
                <p className="text-lg font-black text-foreground">
                  {property.sortWeight ?? 1}
                </p>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => {
                  setField("featured", true);
                  setField("isBoosted", true);
                }}
                className="rounded-xl border border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-4 py-3 text-sm font-black text-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark Featured
              </button>
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => {
                  setField("featured", false);
                  setField("isBoosted", true);
                }}
                className="rounded-xl border border-[var(--admin-secondary)] bg-[var(--admin-secondary)]/10 px-4 py-3 text-sm font-black text-[var(--admin-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark Boosted
              </button>
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => {
                  setField("featured", false);
                  setField("isBoosted", false);
                  setField("featuredUntil", "");
                  setField("boostedUntil", "");
                }}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-black text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset To Normal
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Featured">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setField("featured", event.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 accent-primary"
                />
              </Field>
              <Field label="Boosted">
                <input
                  type="checkbox"
                  checked={form.isBoosted}
                  onChange={(event) => setField("isBoosted", event.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 accent-primary"
                />
              </Field>
              <Field label="Featured Until">
                <input
                  type="date"
                  className={inputClassName}
                  value={form.featuredUntil}
                  onChange={(event) => setField("featuredUntil", event.target.value)}
                  disabled={!isEditing}
                />
              </Field>
              <Field label="Boosted Until">
                <input
                  type="date"
                  className={inputClassName}
                  value={form.boostedUntil}
                  onChange={(event) => setField("boostedUntil", event.target.value)}
                  disabled={!isEditing}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Views
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {property.views ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Impressions
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {property.impressions ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  CTR
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {ctr.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Promoted Impressions
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  {property.promotedImpressions ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Field label="Monthly Rent">
              <input
                className={inputClassName}
                value={form.monthlyRent}
                onChange={(event) => setField("monthlyRent", event.target.value)}
                disabled={!isEditing}
              />
            </Field>
            <Field label="Daily Rent">
              <input
                className={inputClassName}
                value={form.dailyRent}
                onChange={(event) => setField("dailyRent", event.target.value)}
                disabled={!isEditing}
              />
            </Field>
            <Field label="Weekly Rent">
              <input
                className={inputClassName}
                value={form.weeklyRent}
                onChange={(event) => setField("weeklyRent", event.target.value)}
                disabled={!isEditing}
              />
            </Field>
            <Field label="Security Deposit">
              <input
                className={inputClassName}
                value={form.SecuritybasePrice}
                onChange={(event) =>
                  setField("SecuritybasePrice", event.target.value)
                }
                disabled={!isEditing}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Property Size
                </h4>
                {!isEditing && (
                  <p className="mt-2 text-lg font-black text-foreground">
                    {propertySizeLabel || "No size saved"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Size Value">
                <input
                  className={inputClassName}
                  value={form.sizeValue}
                  onChange={(event) => setField("sizeValue", event.target.value)}
                  disabled={!isEditing}
                />
              </Field>
              <Field label="Size Unit">
                <select
                  className={inputClassName}
                  value={form.sizeUnit}
                  onChange={(event) => setField("sizeUnit", event.target.value)}
                  disabled={!isEditing}
                >
                  <option value="">Select unit</option>
                  {PROPERTY_SIZE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                <Home className="h-4 w-4" /> Listing Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bedrooms">
                  <input
                    className={inputClassName}
                    value={form.bedrooms}
                    onChange={(event) => setField("bedrooms", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Beds">
                  <input
                    className={inputClassName}
                    value={form.beds}
                    onChange={(event) => setField("beds", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Bathrooms">
                  <input
                    className={inputClassName}
                    value={form.bathrooms}
                    onChange={(event) =>
                      setField("bathrooms", event.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Guest Capacity">
                  <input
                    className={inputClassName}
                    value={form.Persons}
                    onChange={(event) => setField("Persons", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Uploader Details
              </h4>
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

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {uploaderStatCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Address And Classification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Area">
                  <input
                    className={inputClassName}
                    value={form.area}
                    onChange={(event) => setField("area", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Default Rent Type">
                  <select
                    className={inputClassName}
                    value={form.defaultRentType}
                    onChange={(event) =>
                      setField(
                        "defaultRentType",
                        event.target.value as "daily" | "weekly" | "monthly",
                      )
                    }
                    disabled={!isEditing}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </Field>
                <Field label="Apt / Suite">
                  <input
                    className={inputClassName}
                    value={form.aptSuiteUnit}
                    onChange={(event) =>
                      setField("aptSuiteUnit", event.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Street">
                  <input
                    className={inputClassName}
                    value={form.street}
                    onChange={(event) => setField("street", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="City">
                  <input
                    className={inputClassName}
                    value={form.city}
                    onChange={(event) => setField("city", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="State / Territory">
                  <input
                    className={inputClassName}
                    value={form.stateTerritory}
                    onChange={(event) =>
                      setField("stateTerritory", event.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Country">
                  <input
                    className={inputClassName}
                    value={form.country}
                    onChange={(event) => setField("country", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
                <Field label="Zip Code">
                  <input
                    className={inputClassName}
                    value={form.zipCode}
                    onChange={(event) => setField("zipCode", event.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Safety And Highlights
              </h4>
              <Field
                label="Description"
                hint="This is the main public description shown on the listing detail page."
              >
                <textarea
                  className={textareaClassName}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </Field>
              <Field
                label="Highlights"
                hint="Use commas between values, for example peaceful, spacious, family_friendly."
              >
                <textarea
                  className={textareaClassName}
                  rows={3}
                  value={form.highlighted}
                  onChange={(event) =>
                    setField("highlighted", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </Field>
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-muted-foreground">
                  Highlights
                </h4>
                <div className="flex flex-wrap gap-2">
                  {typeof property.description === "object"
                    ? property.description?.highlighted?.map((highlight: string) => (
                        <span
                          key={highlight}
                          className="rounded-lg border border-border bg-accent px-3 py-1 text-[11px] font-bold capitalize"
                        >
                          {highlight.replace("_", " ")}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            </>
          )}

          <div className="sticky bottom-0 space-y-3 border-t border-border bg-card/90 pb-2 pt-4 backdrop-blur-md">
            {isEditing && (
              <label className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
                <span>Listing visibility</span>
                <input
                  type="checkbox"
                  checked={form.status}
                  disabled={!property.isApproved || isSubmitting}
                  onChange={(event) => setField("status", event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            )}

            <div className="flex gap-4">
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  await onDelete(property._id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 font-black text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" />
                {isSubmitting && activeAction === "delete"
                  ? "REJECTING..."
                  : "REJECT"}
              </button>

              {isEditing ? (
                <button
                  disabled={isSubmitting}
                  onClick={handleSave}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white shadow-lg shadow-primary/30 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-5 w-5" />
                  {isSubmitting && activeAction === "save"
                    ? "SAVING..."
                    : "SAVE CHANGES"}
                </button>
              ) : property.isApproved ? (
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
                  {isSubmitting && activeAction === "approve"
                    ? "APPROVING..."
                    : "APPROVE"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
