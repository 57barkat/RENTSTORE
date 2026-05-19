"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Home,
  ImagePlus,
  Loader2,
  MapPin,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import PublicLocationPicker from "@/app/components/public/PublicLocationPicker";
import publicApiClient from "@/app/lib/public-api-client";
import {
  AMENITY_OPTIONS,
  APARTMENT_TYPES,
  BILL_OPTIONS,
  buildAdminPropertyPayload,
  createEmptyPropertyUploadForm,
  FURNISHING_TYPES,
  HIGHLIGHT_OPTIONS,
  HOSTEL_TYPES,
  MEAL_PLAN_OPTIONS,
  PROPERTY_HOST_OPTIONS,
  PROPERTY_SIZE_UNITS,
  RULE_OPTIONS,
  SAFETY_DETAILS,
  uploadImagesToCloudinary,
  validateAdminPropertyForm,
  type AdminPropertyFieldErrors,
  type AdminPropertyUploadForm,
} from "@/app/lib/admin-property-upload";
import type {
  PropertyAddress,
  PropertyCategory,
  PublicProperty,
} from "@/app/lib/property-types";
import { getPropertyTitle } from "@/app/lib/property-utils";

const emptyErrors: AdminPropertyFieldErrors = {};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 50;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const inputClass =
  "admin-input h-12 w-full rounded-2xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10";

const textareaClass =
  "admin-input min-h-[120px] w-full rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10";

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

function SectionCard({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[28px] border border-[var(--admin-border)] bg-white p-5 shadow-[0_25px_70px_-45px_var(--admin-shadow)] sm:p-7"
    >
      <div className="mb-6 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-5">
        <span className="inline-flex w-fit rounded-full bg-[var(--admin-primary-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
          {eyebrow}
        </span>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--admin-muted)]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-bold text-[var(--admin-text)]">
        {label}
      </span>
      {children}
      {hint ? (
        <p className="mt-2 text-xs leading-6 text-[var(--admin-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs font-semibold text-[var(--admin-error)]">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function ChipGroup({
  options,
  values,
  onToggle,
}: {
  options: Array<{ key: string; label: string }>;
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const active = values.includes(option.key);

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onToggle(option.key)}
            className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-[0_12px_24px_-18px_var(--admin-primary-strong)]"
                : "border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)]/40 hover:bg-[var(--admin-card)] hover:text-[var(--admin-text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-4 ${
        accent
          ? "border-[var(--admin-primary)]/20 bg-[var(--admin-primary-soft)]"
          : "border-[var(--admin-border)] bg-white"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-[var(--admin-text)]">
        {value}
      </p>
    </div>
  );
}

function NavPill({
  label,
  active,
  complete,
  onClick,
}: {
  label: string;
  active: boolean;
  complete: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
          : "border-[var(--admin-border)] bg-white hover:border-[var(--admin-primary)]/30"
      }`}
    >
      <span className="text-sm font-semibold text-[var(--admin-text)]">
        {label}
      </span>
      <span
        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-[var(--admin-background)] text-[var(--admin-muted)]"
        }`}
      >
        {complete ? "Done" : "Open"}
      </span>
    </button>
  );
}

const toText = (value: unknown) =>
  typeof value === "number"
    ? String(value)
    : typeof value === "string"
      ? value
      : "";

export const buildFormFromProperty = (
  property: PublicProperty | null | undefined,
): AdminPropertyUploadForm => {
  const form = {
    ...createEmptyPropertyUploadForm(),
    ownerId: "__self__",
  };

  if (!property) {
    return form;
  }

  const addressArray = Array.isArray(property.address)
    ? property.address
    : property.address
      ? [property.address]
      : form.address;

  const highlighted =
    property.description &&
    typeof property.description === "object" &&
    Array.isArray(property.description.highlighted)
      ? property.description.highlighted
      : [];

  const normalizedHostOption = PROPERTY_HOST_OPTIONS.includes(
    (property.hostOption ||
      property.propertyType ||
      form.hostOption) as PropertyCategory,
  )
    ? ((property.hostOption ||
        property.propertyType ||
        form.hostOption) as PropertyCategory)
    : form.hostOption;

  return {
    ...form,
    hostOption: normalizedHostOption,
    propertyType: normalizedHostOption,
    title: getPropertyTitle(property) || "",
    location: property.location || "",
    area: property.area || "",
    lat: toText(property.lat),
    lng: toText(property.lng),
    address: addressArray.map((entry: PropertyAddress) => ({
      aptSuiteUnit: entry?.aptSuiteUnit || "",
      street: entry?.street || "",
      city: entry?.city || "",
      stateTerritory: entry?.stateTerritory || "",
      country: entry?.country || "PAKISTAN",
      zipCode: entry?.zipCode || "",
    })),
    capacityState: {
      Persons: property.capacityState?.Persons ?? form.capacityState.Persons,
      bedrooms: property.capacityState?.bedrooms ?? form.capacityState.bedrooms,
      beds: property.capacityState?.beds ?? form.capacityState.beds,
      bathrooms:
        property.capacityState?.bathrooms ?? form.capacityState.bathrooms,
      floorLevel:
        property.capacityState?.floorLevel ?? form.capacityState.floorLevel,
    },
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    photos: Array.isArray(property.photos) ? property.photos : [],
    monthlyRent: toText(property.monthlyRent),
    dailyRent: toText(property.dailyRent),
    weeklyRent: toText(property.weeklyRent),
    defaultRentType: property.defaultRentType || form.defaultRentType,
    SecuritybasePrice: toText(property.SecuritybasePrice),
    ALL_BILLS: Array.isArray(property.ALL_BILLS) ? property.ALL_BILLS : [],
    safetyDetailsData: {
      safetyDetails: Array.isArray(property.safetyDetailsData?.safetyDetails)
        ? property.safetyDetailsData.safetyDetails
        : [],
      cameraDescription: property.safetyDetailsData?.cameraDescription || "",
    },
    description: {
      highlighted,
    },
    size: {
      value: toText(property.size?.value),
      unit: property.size?.unit || form.size.unit,
    },
    apartmentType: property.apartmentType || form.apartmentType,
    furnishing: property.furnishing || form.furnishing,
    parking: !!property.parking,
    hostelType: property.hostelType || form.hostelType,
    mealPlan: Array.isArray(property.mealPlan) ? property.mealPlan : [],
    rules: Array.isArray(property.rules) ? property.rules : [],
    ownerId: "__self__",
  };
};

export default function PublicPropertyForm({
  mode,
  propertyId,
  draftId,
  initialForm,
}: {
  mode: "create" | "edit";
  propertyId?: string;
  draftId?: string;
  initialForm?: AdminPropertyUploadForm | null;
}) {
  const router = useRouter();
  const initializedRef = useRef(false);

  const [form, setForm] = useState<AdminPropertyUploadForm>(
    () =>
      initialForm || {
        ...createEmptyPropertyUploadForm(),
        ownerId: "__self__",
      },
  );
  const [errors, setErrors] = useState<AdminPropertyFieldErrors>(emptyErrors);
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);

  useEffect(() => {
    if (initialForm && !initializedRef.current) {
      setForm(initialForm);
      initializedRef.current = true;
    }
  }, [initialForm]);

  const localPhotosRef = useRef<LocalPhoto[]>([]);

  useEffect(() => {
    localPhotosRef.current = localPhotos;
  }, [localPhotos]);

  useEffect(() => {
    return () => {
      localPhotosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, []);

  const isHostel = form.hostOption === "hostel";
  const isApartment = form.hostOption === "apartment";
  const usesSize =
    form.hostOption === "home" ||
    form.hostOption === "shop" ||
    form.hostOption === "office";

  const existingPhotoCount = form.photos.length + localPhotos.length;

  const pageTitle =
    mode === "edit" ? "Redesign your property listing" : "Create a new listing";

  const pageDescription =
    mode === "edit"
      ? "Update every important detail in a cleaner, modern publishing experience. The backend still controls approval, moderation, and ownership fields."
      : "Publish a rental listing through a fully redesigned workflow with the same backend field structure used by your existing mobile upload flow.";

  const summaryCards = useMemo(
    () => [
      {
        label: "Listing type",
        value:
          form.hostOption.charAt(0).toUpperCase() + form.hostOption.slice(1),
      },
      {
        label: "Photos ready",
        value: String(existingPhotoCount),
      },
      {
        label: "Default rent",
        value:
          form.defaultRentType.charAt(0).toUpperCase() +
          form.defaultRentType.slice(1),
      },
      {
        label: "Mode",
        value: mode === "edit" ? "Editing" : "Publishing",
      },
    ],
    [existingPhotoCount, form.defaultRentType, form.hostOption, mode],
  );

  const setField = <K extends keyof AdminPropertyUploadForm>(
    key: K,
    value: AdminPropertyUploadForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setAddressField = (
    index: number,
    key: keyof AdminPropertyUploadForm["address"][number],
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      address: current.address.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry,
      ),
    }));
  };

  const applyResolvedLocation = (value: {
    location: string;
    area: string;
    lat: string;
    lng: string;
    address: Pick<
      PropertyAddress,
      "street" | "city" | "stateTerritory" | "country" | "zipCode"
    >;
  }) => {
    setForm((current) => {
      const firstAddress = current.address[0] || {
        aptSuiteUnit: "",
        street: "",
        city: "",
        stateTerritory: "",
        country: "PAKISTAN",
        zipCode: "",
      };

      return {
        ...current,
        location: value.location,
        area: value.area,
        lat: value.lat,
        lng: value.lng,
        address: [
          {
            ...firstAddress,
            street: value.address.street || "",
            city: value.address.city || "",
            stateTerritory: value.address.stateTerritory || "",
            country:
              value.address.country || firstAddress.country || "PAKISTAN",
            zipCode: value.address.zipCode || "",
          },
          ...current.address.slice(1),
        ],
      };
    });
  };

  const setCapacityValue = (
    key: keyof AdminPropertyUploadForm["capacityState"],
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      capacityState: {
        ...current.capacityState,
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  };

  const toggleArrayValue = (
    key:
      | "amenities"
      | "ALL_BILLS"
      | "mealPlan"
      | "rules"
      | "description.highlighted"
      | "safetyDetailsData.safetyDetails",
    value: string,
  ) => {
    const updateValues = (values: string[]) =>
      values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value];

    setForm((current) => {
      if (key === "description.highlighted") {
        return {
          ...current,
          description: {
            ...current.description,
            highlighted: updateValues(current.description.highlighted),
          },
        };
      }

      if (key === "safetyDetailsData.safetyDetails") {
        return {
          ...current,
          safetyDetailsData: {
            ...current.safetyDetailsData,
            safetyDetails: updateValues(
              current.safetyDetailsData.safetyDetails,
            ),
          },
        };
      }

      return {
        ...current,
        [key]: updateValues(current[key]),
      };
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);

    if (!nextFiles.length) {
      return;
    }

    if (existingPhotoCount + nextFiles.length > MAX_IMAGE_COUNT) {
      toast.error(`You can upload up to ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    for (const file of nextFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format.`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds the 5 MB limit.`);
        return;
      }
    }

    const additions = nextFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setLocalPhotos((current) => [...current, ...additions]);
    event.target.value = "";
  };

  const removeLocalPhoto = (photoId: string) => {
    setLocalPhotos((current) => {
      const selected = current.find((photo) => photo.id === photoId);

      if (selected) {
        URL.revokeObjectURL(selected.previewUrl);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const removeRemotePhoto = (index: number) => {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  };

  const submitForm = async (publish: boolean) => {
    const nextErrors = validateAdminPropertyForm(form, {
      photoCount: existingPhotoCount,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete the required property fields.");
      return;
    }

    if (publish && !accuracyConfirmed) {
      toast.error("Please confirm that your listing details are accurate.");
      return;
    }

    setSubmitting(true);

    try {
      let photoUrls = form.photos;

      if (localPhotos.length > 0) {
        setUploadingImages(true);
        const uploadedUrls = await uploadImagesToCloudinary(
          localPhotos.map((photo) => photo.file),
        );
        photoUrls = [...form.photos, ...uploadedUrls];
      }

      const payload = buildAdminPropertyPayload({
        ...form,
        photos: photoUrls,
      });

      if (mode === "edit" && propertyId) {
        await publicApiClient.patch(`/properties/${propertyId}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        toast.success("Property updated successfully.");
      } else {
        await publicApiClient.post(
          "/properties/create",
          {
            ...payload,
            ...(draftId ? { _id: draftId } : {}),
            status: publish,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        toast.success(
          publish
            ? "Property submitted successfully."
            : "Draft saved successfully.",
        );
      }

      router.push("/account/properties");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : error instanceof Error
            ? error.message
            : mode === "edit"
              ? "Property update failed."
              : "Property upload failed.";

      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const sectionCompletion = useMemo(
    () => ({
      overview: Boolean(form.title && form.hostOption),
      location: Boolean(
        form.location &&
        form.lat &&
        form.lng &&
        form.address[0]?.city &&
        form.address[0]?.stateTerritory,
      ),
      pricing: Boolean(
        form.monthlyRent ||
        form.weeklyRent ||
        form.dailyRent ||
        form.SecuritybasePrice,
      ),
      details: Boolean(
        isHostel
          ? form.capacityState.Persons || form.capacityState.beds
          : form.capacityState.bedrooms ||
              form.capacityState.bathrooms ||
              (usesSize && form.size.value),
      ),
      amenities: Boolean(form.amenities.length || form.ALL_BILLS.length),
      photos: existingPhotoCount > 0,
      rules: Boolean(
        form.description.highlighted.length ||
        form.safetyDetailsData.safetyDetails.length ||
        form.mealPlan.length ||
        form.rules.length,
      ),
    }),
    [
      existingPhotoCount,
      form.ALL_BILLS.length,
      form.SecuritybasePrice,
      form.address,
      form.amenities.length,
      form.capacityState.Persons,
      form.capacityState.bathrooms,
      form.capacityState.bedrooms,
      form.capacityState.beds,
      form.description.highlighted.length,
      form.hostOption,
      form.lat,
      form.lng,
      form.location,
      form.mealPlan.length,
      form.monthlyRent,
      form.dailyRent,
      form.rules.length,
      form.safetyDetailsData.safetyDetails.length,
      form.size.value,
      form.title,
      form.weeklyRent,
      isHostel,
      usesSize,
    ],
  );

  const sections = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        complete: sectionCompletion.overview,
      },
      {
        id: "location",
        label: "Location",
        complete: sectionCompletion.location,
      },
      { id: "pricing", label: "Pricing", complete: sectionCompletion.pricing },
      {
        id: "details",
        label: "Capacity & size",
        complete: sectionCompletion.details,
      },
      {
        id: "amenities",
        label: "Amenities & bills",
        complete: sectionCompletion.amenities,
      },
      { id: "photos", label: "Photos", complete: sectionCompletion.photos },
      {
        id: "rules",
        label: "Rules & safety",
        complete: sectionCompletion.rules,
      },
    ],
    [sectionCompletion],
  );

  const completedCount = sections.filter((section) => section.complete).length;
  const completionPercent = Math.round(
    (completedCount / sections.length) * 100,
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[var(--admin-border)] bg-white shadow-[0_30px_90px_-55px_var(--admin-shadow)]">
        <div className="rounded-t-[32px] border-b border-[var(--admin-border)] bg-[linear-gradient(135deg,var(--admin-primary-soft),var(--admin-background),var(--admin-secondary-soft))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <Link
                href="/account/properties"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to my properties
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  <Home className="h-3.5 w-3.5" />
                  Property Studio
                </span>
                <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  {mode === "edit" ? "Edit mode" : "New listing"}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
                {pageTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
                {pageDescription}
              </p>

              <div className="mt-6 max-w-xl">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--admin-text)]">
                    Listing completion
                  </span>
                  <span className="text-sm font-bold text-[var(--admin-primary)]">
                    {completionPercent}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[var(--admin-background)]">
                  <div
                    className="h-full rounded-full bg-[var(--admin-primary)] transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--admin-muted)]">
                  {completedCount} of {sections.length} sections look ready.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[420px] xl:grid-cols-2">
              {summaryCards.map((card, index) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  accent={index === 0}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            className="space-y-6 p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              void submitForm(true);
            }}
          >
            <SectionCard
              id="overview"
              eyebrow="01 / Basics"
              title="Listing identity & property type"
              description="Start with the essential information that defines the listing, then choose the property category and any property-specific details."
            >
              <div className="grid gap-5">
                <Field label="SEO-friendly listing title" error={errors.title}>
                  <input
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className={inputClass}
                    placeholder="2 Bedroom Apartment for Rent in F-11 Islamabad"
                  />

                  <div className="mt-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                      Better title = better discovery
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                      so people can find your listing more easily.
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[var(--admin-text)]">
                      Example: 2 Bedroom Apartment for Rent in F-11 Islamabad
                    </p>
                  </div>
                </Field>
              </div>

              <Field label="Category" error={errors.hostOption}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {PROPERTY_HOST_OPTIONS.map((option) => {
                    const active = form.hostOption === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setField("hostOption", option);
                          setField("propertyType", option);
                        }}
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          active
                            ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)]"
                            : "border-[var(--admin-border)] bg-white hover:border-[var(--admin-primary)]/30"
                        }`}
                      >
                        <p className="text-sm font-bold capitalize text-[var(--admin-text)]">
                          {option}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                {isApartment ? (
                  <>
                    <Field label="Apartment type" error={errors.apartmentType}>
                      <select
                        value={form.apartmentType}
                        onChange={(event) =>
                          setField("apartmentType", event.target.value)
                        }
                        className={inputClass}
                      >
                        {APARTMENT_TYPES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Furnishing" error={errors.furnishing}>
                      <select
                        value={form.furnishing}
                        onChange={(event) =>
                          setField("furnishing", event.target.value)
                        }
                        className={inputClass}
                      >
                        {FURNISHING_TYPES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <label className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-semibold text-[var(--admin-text)]">
                      <input
                        type="checkbox"
                        checked={form.parking}
                        onChange={(event) =>
                          setField("parking", event.target.checked)
                        }
                      />
                      Parking available
                    </label>
                  </>
                ) : null}

                {isHostel ? (
                  <Field label="Hostel type" error={errors.hostelType}>
                    <select
                      value={form.hostelType}
                      onChange={(event) =>
                        setField("hostelType", event.target.value)
                      }
                      className={inputClass}
                    >
                      {HOSTEL_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              id="location"
              eyebrow="02 / Location"
              title="Address, search, and map coordinates"
              description="Use the location search to resolve the address and coordinates automatically, then fine-tune the address manually if needed."
            >
              <div className="rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-background)]/60 p-4 sm:p-5">
                <PublicLocationPicker
                  mapboxToken={MAPBOX_PUBLIC_TOKEN}
                  locationValue={form.location}
                  latValue={form.lat}
                  lngValue={form.lng}
                  error={errors.location}
                  onCoordinateSelection={({ lat, lng }) => {
                    setForm((current) => ({
                      ...current,
                      lat,
                      lng,
                    }));
                  }}
                  onResolvedLocation={(resolved) => {
                    applyResolvedLocation(resolved);
                  }}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Location label" error={errors.location}>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setField("location", event.target.value)
                    }
                    className={inputClass}
                    placeholder="F-11 Markaz, Islamabad"
                  />
                </Field>

                <Field label="Area / sector">
                  <input
                    value={form.area}
                    onChange={(event) => setField("area", event.target.value)}
                    className={inputClass}
                    placeholder="F-11 Markaz"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Street / area summary">
                  <input
                    value={form.address[0]?.street || ""}
                    onChange={(event) =>
                      setAddressField(0, "street", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Street address"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field label="City" error={errors.city}>
                  <input
                    value={form.address[0]?.city || ""}
                    onChange={(event) =>
                      setAddressField(0, "city", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Islamabad"
                  />
                </Field>

                <Field label="State / territory" error={errors.stateTerritory}>
                  <input
                    value={form.address[0]?.stateTerritory || ""}
                    onChange={(event) =>
                      setAddressField(0, "stateTerritory", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Federal Territory"
                  />
                </Field>

                <Field label="Country">
                  <input
                    value={form.address[0]?.country || ""}
                    onChange={(event) =>
                      setAddressField(0, "country", event.target.value)
                    }
                    className={inputClass}
                    placeholder="PAKISTAN"
                  />
                </Field>

                <Field label="ZIP code" error={errors.zipCode}>
                  <input
                    value={form.address[0]?.zipCode || ""}
                    onChange={(event) =>
                      setAddressField(0, "zipCode", event.target.value)
                    }
                    className={inputClass}
                    placeholder="44000"
                  />
                </Field>
              </div>

              <details className="overflow-hidden rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-background)]/70">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-[var(--admin-text)]">
                  Edit map coordinates manually
                </summary>

                <div className="border-t border-[var(--admin-border)] px-5 py-5">
                  <p className="mb-4 text-xs leading-6 text-[var(--admin-muted)]">
                    These values are auto-filled from the map search, but you
                    can fine-tune them before publishing.
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Latitude" error={errors.coordinates}>
                      <input
                        value={form.lat}
                        onChange={(event) =>
                          setField("lat", event.target.value)
                        }
                        className={inputClass}
                        placeholder="33.6844"
                      />
                    </Field>

                    <Field label="Longitude" error={errors.coordinates}>
                      <input
                        value={form.lng}
                        onChange={(event) =>
                          setField("lng", event.target.value)
                        }
                        className={inputClass}
                        placeholder="73.0479"
                      />
                    </Field>
                  </div>
                </div>
              </details>
            </SectionCard>

            <SectionCard
              id="pricing"
              eyebrow="03 / Pricing"
              title="Rent, billing, and default display"
              description="Enter every supported rent interval and select the one that should appear by default across the product."
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Monthly rent" error={errors.pricing}>
                  <input
                    value={form.monthlyRent}
                    onChange={(event) =>
                      setField("monthlyRent", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="120000"
                  />
                </Field>

                <Field label="Weekly rent" error={errors.pricing}>
                  <input
                    value={form.weeklyRent}
                    onChange={(event) =>
                      setField("weeklyRent", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="30000"
                  />
                </Field>

                <Field label="Daily rent" error={errors.pricing}>
                  <input
                    value={form.dailyRent}
                    onChange={(event) =>
                      setField("dailyRent", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="5000"
                  />
                </Field>

                <Field
                  label="Security deposit"
                  error={errors.SecuritybasePrice}
                >
                  <input
                    value={form.SecuritybasePrice}
                    onChange={(event) =>
                      setField("SecuritybasePrice", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="60000"
                  />
                </Field>
              </div>

              <Field label="Default rent type" error={errors.defaultRentType}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["monthly", "weekly", "daily"] as const).map((option) => {
                    const active = form.defaultRentType === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setField("defaultRentType", option)}
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          active
                            ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                            : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)]/35"
                        }`}
                      >
                        <p className="text-sm font-bold capitalize">{option}</p>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </SectionCard>

            <SectionCard
              id="details"
              eyebrow="04 / Details"
              title="Capacity, room details, and size"
              description="Only fill in the fields that are relevant for the selected property type. Hostel fields and size-based fields adjust automatically."
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field
                  label={isHostel ? "Persons" : "Bedrooms / rooms"}
                  error={errors.capacityBedrooms || errors.capacityPersons}
                >
                  <input
                    value={
                      isHostel
                        ? toText(form.capacityState.Persons)
                        : toText(form.capacityState.bedrooms)
                    }
                    onChange={(event) =>
                      setCapacityValue(
                        isHostel ? "Persons" : "bedrooms",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="1"
                  />
                </Field>

                {/* <Field label="Beds" error={errors.capacityBeds}>
                  <input
                    value={toText(form.capacityState.beds)}
                    onChange={(event) =>
                      setCapacityValue("beds", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="1"
                  />
                </Field> */}

                <Field label="Bathrooms" error={errors.capacityBathrooms}>
                  <input
                    value={toText(form.capacityState.bathrooms)}
                    onChange={(event) =>
                      setCapacityValue("bathrooms", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="1"
                  />
                </Field>

                <Field label="Floor level">
                  <input
                    value={toText(form.capacityState.floorLevel)}
                    onChange={(event) =>
                      setCapacityValue("floorLevel", event.target.value)
                    }
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </Field>
              </div>

              {usesSize ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Size value" error={errors.sizeValue}>
                    <input
                      value={form.size.value}
                      onChange={(event) =>
                        setField("size", {
                          ...form.size,
                          value: event.target.value,
                        })
                      }
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="900"
                    />
                  </Field>

                  <Field label="Size unit" error={errors.sizeUnit}>
                    <select
                      value={form.size.unit}
                      onChange={(event) =>
                        setField("size", {
                          ...form.size,
                          unit: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {PROPERTY_SIZE_UNITS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              id="amenities"
              eyebrow="05 / Features"
              title="Amenities and included bills"
              description="Select the real amenities that are available and the bills that are included in the price."
            >
              <Field label="Amenities" error={errors.amenities}>
                <ChipGroup
                  options={AMENITY_OPTIONS}
                  values={form.amenities}
                  onToggle={(value) => toggleArrayValue("amenities", value)}
                />
              </Field>

              <Field label="Included bills">
                <ChipGroup
                  options={BILL_OPTIONS.map((value) => ({
                    key: value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                  }))}
                  values={form.ALL_BILLS}
                  onToggle={(value) => toggleArrayValue("ALL_BILLS", value)}
                />
              </Field>
            </SectionCard>

            <SectionCard
              id="photos"
              eyebrow="06 / Media"
              title="Property photos"
              description="Upload clear, high-quality photos. The existing Cloudinary upload flow is preserved and URLs are saved to the listing."
            >
              <Field
                label="Property gallery"
                error={errors.photos}
                hint={`Supported: JPG, PNG, WEBP, HEIC, HEIF. Max ${MAX_IMAGE_COUNT} images, 5 MB each.`}
              >
                <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-[var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-primary-soft),var(--admin-card))] px-5 py-8 text-center transition hover:border-[var(--admin-primary)]">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                    <UploadCloud className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-lg font-black text-[var(--admin-text)]">
                      Select property images
                    </p>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--admin-muted)]">
                      Add bright, sharp photos that show the rooms, exterior,
                      and any standout features. Better galleries create better
                      listings.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white">
                    Choose files
                    <ChevronRight className="h-4 w-4" />
                  </span>
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {form.photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="overflow-hidden rounded-[24px] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-35px_var(--admin-shadow)]"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={photo}
                        alt={`Uploaded property photo ${index + 1}`}
                        fill
                        sizes="(max-width: 1280px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRemotePhoto(index)}
                      className="flex w-full items-center justify-center gap-2 border-t border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ))}

                {localPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-[24px] border border-[var(--admin-border)] bg-white shadow-[0_18px_40px_-35px_var(--admin-shadow)]"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={photo.previewUrl}
                        alt={photo.file.name}
                        fill
                        unoptimized
                        sizes="(max-width: 1280px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocalPhoto(photo.id)}
                      className="flex w-full items-center justify-center gap-2 border-t border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-danger)]"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ))}

                {existingPhotoCount === 0 ? (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-[24px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-7 w-7" />
                      <p className="mt-3 text-sm font-semibold">
                        No photos selected yet
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              id="rules"
              eyebrow="07 / Safety"
              title="Highlights, safety details, and rules"
              description="Capture what makes the property stand out and include the supported safety disclosures, hostel rules, and meal plan options."
            >
              <Field label="Key highlights" error={errors.highlights}>
                <ChipGroup
                  options={HIGHLIGHT_OPTIONS}
                  values={form.description.highlighted}
                  onToggle={(value) =>
                    toggleArrayValue("description.highlighted", value)
                  }
                />
              </Field>

              <Field
                label="Safety details"
                error={errors["safetyDetailsData.safetyDetails"]}
              >
                <ChipGroup
                  options={SAFETY_DETAILS}
                  values={form.safetyDetailsData.safetyDetails}
                  onToggle={(value) =>
                    toggleArrayValue("safetyDetailsData.safetyDetails", value)
                  }
                />
              </Field>

              {form.safetyDetailsData.safetyDetails.includes(
                "exterior_camera",
              ) ? (
                <Field
                  label="Exterior camera disclosure"
                  error={errors.cameraDescription}
                >
                  <textarea
                    value={form.safetyDetailsData.cameraDescription}
                    onChange={(event) =>
                      setField("safetyDetailsData", {
                        ...form.safetyDetailsData,
                        cameraDescription: event.target.value,
                      })
                    }
                    className={textareaClass}
                    placeholder="Describe where the exterior camera is installed and what it covers."
                  />
                </Field>
              ) : null}

              {isHostel ? (
                <>
                  <Field label="Meal plan" error={errors.mealPlan}>
                    <ChipGroup
                      options={MEAL_PLAN_OPTIONS}
                      values={form.mealPlan}
                      onToggle={(value) => toggleArrayValue("mealPlan", value)}
                    />
                  </Field>

                  <Field label="Rules" error={errors.rules}>
                    <ChipGroup
                      options={RULE_OPTIONS.map((item) => ({
                        key: item.key,
                        label: item.label,
                      }))}
                      values={form.rules}
                      onToggle={(value) => toggleArrayValue("rules", value)}
                    />
                  </Field>
                </>
              ) : null}
            </SectionCard>

            <div className="rounded-[28px] border border-[var(--admin-border)] bg-white p-5 shadow-[0_22px_50px_-42px_var(--admin-shadow)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Banknote className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-[var(--admin-text)]">
                    Final actions
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                    Save a draft first or submit immediately for review.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-start gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 text-sm leading-6 text-[var(--admin-muted)]">
                  <input
                    type="checkbox"
                    checked={accuracyConfirmed}
                    onChange={(event) =>
                      setAccuracyConfirmed(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-primary)]"
                  />
                  <span>
                    I confirm that I am authorized to publish this property and
                    that the rent, location, photos, availability, and contact
                    details are accurate.
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {mode === "create" ? (
                    <button
                      type="button"
                      disabled={submitting || uploadingImages}
                      onClick={() => void submitForm(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting && !uploadingImages ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Save draft
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting || uploadingImages || !accuracyConfirmed}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 ${
                      mode === "create" ? "" : "sm:col-span-2"
                    }`}
                  >
                    {submitting || uploadingImages ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {uploadingImages
                      ? "Uploading images..."
                      : mode === "edit"
                        ? "Save changes"
                        : "Submit property"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <aside className="rounded-b-[32px] border-t border-[var(--admin-border)] bg-[var(--admin-background)]/35 p-5 sm:p-6 xl:rounded-bl-none xl:rounded-br-[32px] xl:border-l xl:border-t-0">
            <div className="flex flex-col gap-5 xl:sticky xl:top-24">
              <div className="rounded-[28px] border border-[var(--admin-border)] bg-white p-5 shadow-[0_22px_50px_-42px_var(--admin-shadow)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                      Progress
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[var(--admin-text)]">
                      Listing builder
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                      Jump between sections and complete the checklist before
                      publishing.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {sections.map((section) => (
                    <NavPill
                      key={section.id}
                      label={section.label}
                      active={activeSection === section.id}
                      complete={section.complete}
                      onClick={() => scrollToSection(section.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--admin-border)] bg-white p-5 shadow-[0_22px_50px_-42px_var(--admin-shadow)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                      Summary
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[var(--admin-text)]">
                      Ready to publish
                    </h3>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                      Property type
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[var(--admin-text)]">
                      {form.hostOption}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                      Default rent
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[var(--admin-text)]">
                      {form.defaultRentType}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                      Photos
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                      {existingPhotoCount} selected
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                      Bedrooms / persons
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                      {isHostel
                        ? toText(form.capacityState.Persons) || "Not set"
                        : toText(form.capacityState.bedrooms) || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--admin-secondary)]" />
                    <p className="text-sm leading-6 text-[var(--admin-muted)]">
                      After you submit, your listing will be reviewed before it
                      goes live. Some settings, like approval and visibility,
                      are handled automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--admin-border)] bg-white p-5 shadow-[0_22px_50px_-42px_var(--admin-shadow)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <BedDouble className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[var(--admin-text)]">
                      Quick tips
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                      A strong title, correct map location, realistic pricing,
                      and a complete photo set improve listing quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
