"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
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

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_36px_-30px_var(--admin-shadow)] sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
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
      <span className="mb-2 block text-sm font-semibold text-[var(--admin-text)]">
        {label}
      </span>
      {children}
      {hint ? (
        <p className="mt-2 text-xs text-[var(--admin-muted)]">{hint}</p>
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
            className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-[0_12px_24px_-18px_var(--admin-primary-strong)]"
                : "border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)]/50 hover:bg-white hover:text-[var(--admin-text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
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
  const title = mode === "edit" ? "Edit your property" : "Upload a property";
  const description =
    mode === "edit"
      ? "Update the same real listing fields used by the mobile app. Protected promotion and ownership fields stay server-controlled."
      : "Create a rental listing from the web in one responsive form. This uses the same backend field structure as the mobile upload flow.";

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
        value: form.defaultRentType,
      },
    ],
    [existingPhotoCount, form.defaultRentType, form.hostOption],
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

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_20px_40px_-32px_var(--admin-shadow)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              href="/account/properties"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              Back to my properties
            </Link>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--admin-muted)]">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  {card.label}
                </p>
                <p className="mt-1 text-lg font-black text-[var(--admin-text)]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submitForm(true);
          }}
        >
          <Section
            title="Basic information"
            description="Add the same core listing identity fields the mobile app collects."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Title" error={errors.title}>
                <input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="Modern apartment in F-11"
                />
              </Field>
              <Field label="Area" hint="Optional short area label.">
                <input
                  value={form.area}
                  onChange={(event) => setField("area", event.target.value)}
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="F-11"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Property type"
            description="Select the listing category and any property-specific details."
          >
            <Field label="Category" error={errors.hostOption}>
              <div className="flex flex-wrap gap-2">
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
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                          : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)]"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
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
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    >
                      {FURNISHING_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm font-medium text-[var(--admin-text)]">
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
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
          </Section>

          <Section
            title="Location"
            description="Use real listing address and coordinates. The backend requires valid map coordinates."
          >
            <PublicLocationPicker
              mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
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
                setForm((current) => ({
                  ...current,
                  location: resolved.location,
                  area: resolved.area,
                  lat: resolved.lat,
                  lng: resolved.lng,
                  address: [
                    {
                      ...current.address?.[0],
                      ...resolved.address,
                    },
                  ],
                }));
              }}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Location label" error={errors.location}>
                <input
                  value={form.location}
                  onChange={(event) => setField("location", event.target.value)}
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="F-11 Markaz, Islamabad"
                />
              </Field>
              <Field label="Area / sector">
                <input
                  value={form.area}
                  onChange={(event) => setField("area", event.target.value)}
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
              <Field label="State / territory" error={errors.stateTerritory}>
                <input
                  value={form.address[0]?.stateTerritory || ""}
                  onChange={(event) =>
                    setAddressField(0, "stateTerritory", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
              <Field label="Country">
                <input
                  value={form.address[0]?.country || ""}
                  onChange={(event) =>
                    setAddressField(0, "country", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
              <Field label="ZIP code" error={errors.zipCode}>
                <input
                  value={form.address[0]?.zipCode || ""}
                  onChange={(event) =>
                    setAddressField(0, "zipCode", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
            </div>

            <details className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)]/70 p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--admin-text)]">
                Edit address details manually
              </summary>
              <p className="mt-2 text-xs text-[var(--admin-muted)]">
                These values are auto-filled from the map search, but you can
                fine-tune them before publishing.
              </p>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <Field label="Latitude" error={errors.coordinates}>
                  <input
                    value={form.lat}
                    onChange={(event) => setField("lat", event.target.value)}
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    placeholder="33.6844"
                  />
                </Field>
                <Field label="Longitude" error={errors.coordinates}>
                  <input
                    value={form.lng}
                    onChange={(event) => setField("lng", event.target.value)}
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    placeholder="73.0479"
                  />
                </Field>
              </div>
            </details>
          </Section>

          <Section
            title="Rent and pricing"
            description="Provide the available rent intervals and choose which one should be displayed by default."
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Monthly rent" error={errors.pricing}>
                <input
                  value={form.monthlyRent}
                  onChange={(event) =>
                    setField("monthlyRent", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Weekly rent" error={errors.pricing}>
                <input
                  value={form.weeklyRent}
                  onChange={(event) =>
                    setField("weeklyRent", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Daily rent" error={errors.pricing}>
                <input
                  value={form.dailyRent}
                  onChange={(event) =>
                    setField("dailyRent", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Security deposit" error={errors.SecuritybasePrice}>
                <input
                  value={form.SecuritybasePrice}
                  onChange={(event) =>
                    setField("SecuritybasePrice", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <Field label="Default rent type" error={errors.defaultRentType}>
              <div className="flex flex-wrap gap-2">
                {(["monthly", "weekly", "daily"] as const).map((option) => {
                  const active = form.defaultRentType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setField("defaultRentType", option)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                          : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          <Section
            title="Capacity and size"
            description="Only show fields relevant to the selected property type."
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
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Beds" error={errors.capacityBeds}>
                <input
                  value={toText(form.capacityState.beds)}
                  onChange={(event) =>
                    setCapacityValue("beds", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Bathrooms" error={errors.capacityBathrooms}>
                <input
                  value={toText(form.capacityState.bathrooms)}
                  onChange={(event) =>
                    setCapacityValue("bathrooms", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Floor level">
                <input
                  value={toText(form.capacityState.floorLevel)}
                  onChange={(event) =>
                    setCapacityValue("floorLevel", event.target.value)
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  inputMode="numeric"
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
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    inputMode="numeric"
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
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
          </Section>

          <Section
            title="Amenities and bills"
            description="Pick the real amenities and included utilities from the supported option sets."
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
          </Section>

          <Section
            title="Photos"
            description="Upload image files directly to the existing Cloudinary flow, then save the returned URLs to the listing."
          >
            <Field
              label="Property photos"
              error={errors.photos}
              hint={`Supported: JPG, PNG, WEBP, HEIC, HEIF. Max ${MAX_IMAGE_COUNT} images, 5 MB each.`}
            >
              <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-8 text-center text-sm font-semibold text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]">
                <UploadCloud className="h-5 w-5" />
                <span className="text-base font-bold">Select images</span>
                <span className="max-w-sm text-sm font-medium text-[var(--admin-muted)]">
                  Add bright, clear property photos. Larger galleries help
                  listings feel more complete.
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
                  className="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white"
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
                  className="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white"
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
                <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-6 w-6" />
                    <p className="mt-2 text-sm font-medium">
                      No photos selected yet
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Section>

          <Section
            title="Rules and description"
            description="Highlights, safety, hostel rules, and any extra disclosures supported by the backend."
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
                  className="admin-input min-h-28 w-full rounded-2xl px-4 py-3 text-sm"
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
          </Section>
        </form>

        <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_36px_-30px_var(--admin-shadow)] sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--admin-secondary)]">
                  Summary
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-[var(--admin-text)]">
                  Ready to publish
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                  Review the key choices here, then save as draft or send for
                  moderation.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                  Property type
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                  {form.hostOption}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                  Rent display
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                  {form.defaultRentType}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                  Photos
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                  {existingPhotoCount} selected
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                  Review
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                  Approval required
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--admin-secondary)]" />
                <p className="text-sm leading-6 text-[var(--admin-muted)]">
                  The backend still controls approval, promotion, ownership, and
                  moderation fields after submission.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
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
                disabled={submitting || uploadingImages}
                onClick={(event) => {
                  event.preventDefault();
                  void submitForm(true);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
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
        </aside>
      </div>
    </div>
  );
}
