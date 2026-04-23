"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search, Upload, X } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import apiClient from "@/app/lib/api-client";
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
  type AdminPropertyFieldErrors,
  type AdminPropertyUploadForm,
  type AdminUserOption,
  uploadImagesToCloudinary,
  validateAdminPropertyForm,
} from "@/app/lib/admin-property-upload";

interface AdminUserSearchResponse {
  data?: AdminUserOption[];
}

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

const categoryLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const emptyErrors: AdminPropertyFieldErrors = {};

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
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option.key);

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onToggle(option.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminUploadPropertyForm() {
  const router = useRouter();
  const [form, setForm] = useState<AdminPropertyUploadForm>(() =>
    createEmptyPropertyUploadForm(),
  );
  const [errors, setErrors] = useState<AdminPropertyFieldErrors>(emptyErrors);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userOptions, setUserOptions] = useState<AdminUserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserOption | null>(
    null,
  );
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const searchCacheRef = useRef(new Map<string, AdminUserOption[]>());
  const activeSearchRef = useRef("");
  const localPhotosRef = useRef<LocalPhoto[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUserSearchQuery(userSearchInput.trim());
    }, 450);

    return () => window.clearTimeout(timer);
  }, [userSearchInput]);

  useEffect(() => {
    if (userSearchQuery.length < 2) {
      setUserOptions([]);
      setUserSearchLoading(false);
      activeSearchRef.current = "";
      return;
    }

    if (searchCacheRef.current.has(userSearchQuery)) {
      setUserOptions(searchCacheRef.current.get(userSearchQuery) || []);
      return;
    }

    if (activeSearchRef.current === userSearchQuery) {
      return;
    }

    activeSearchRef.current = userSearchQuery;
    setUserSearchLoading(true);

    void apiClient
      .get<AdminUserSearchResponse>("/users/admin/all", {
        params: { page: 1, limit: 8, search: userSearchQuery },
      })
      .then(({ data }) => {
        const nextUsers = Array.isArray(data?.data) ? data.data : [];
        searchCacheRef.current.set(userSearchQuery, nextUsers);
        setUserOptions(nextUsers);
      })
      .catch(() => {
        searchCacheRef.current.set(userSearchQuery, []);
        setUserOptions([]);
        toast.error("User search failed. Please try again.");
      })
      .finally(() => {
        if (activeSearchRef.current === userSearchQuery) {
          activeSearchRef.current = "";
        }
        setUserSearchLoading(false);
      });
  }, [userSearchQuery]);

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

  const summaryCards = useMemo(
    () => [
      {
        label: "Owner",
        value: selectedUser?.name || "No owner selected",
      },
      {
        label: "Listing type",
        value: categoryLabel(form.hostOption),
      },
      {
        label: "Photos ready",
        value: String(localPhotos.length + form.photos.length),
      },
    ],
    [
      form.hostOption,
      form.photos.length,
      localPhotos.length,
      selectedUser?.name,
    ],
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

  const toggleArrayValue = (
    key: "amenities" | "ALL_BILLS" | "mealPlan" | "rules" | "photos",
    value: string,
  ) => {
    setForm((current) => {
      const currentValues = current[key] as string[];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const toggleNestedArrayValue = (
    key: "highlighted" | "safetyDetails",
    value: string,
  ) => {
    setForm((current) => {
      if (key === "highlighted") {
        const values = current.description.highlighted.includes(value)
          ? current.description.highlighted.filter((entry) => entry !== value)
          : [...current.description.highlighted, value];

        return {
          ...current,
          description: {
            highlighted: values,
          },
        };
      }

      const values = current.safetyDetailsData.safetyDetails.includes(value)
        ? current.safetyDetailsData.safetyDetails.filter(
            (entry) => entry !== value,
          )
        : [...current.safetyDetailsData.safetyDetails, value];

      return {
        ...current,
        safetyDetailsData: {
          ...current.safetyDetailsData,
          safetyDetails: values,
          cameraDescription:
            value === "exterior_camera" || values.includes("exterior_camera")
              ? current.safetyDetailsData.cameraDescription
              : "",
        },
      };
    });
  };

  const updateCapacity = (
    key: keyof AdminPropertyUploadForm["capacityState"],
    nextValue: number,
  ) => {
    setForm((current) => ({
      ...current,
      capacityState: {
        ...current.capacityState,
        [key]: Math.max(0, nextValue),
      },
    }));
  };

  const handleSelectUser = (user: AdminUserOption) => {
    setSelectedUser(user);
    setUserSearchInput(user.name || user.email || user.phone || "");
    setUserOptions([]);
    setField("ownerId", user._id);
    setErrors((current) => ({ ...current, ownerId: "" }));
  };

  const handleHostOptionChange = (
    value: AdminPropertyUploadForm["hostOption"],
  ) => {
    setForm((current) => ({
      ...current,
      hostOption: value,
      propertyType: value,
      apartmentType: current.apartmentType || "1BHK",
      furnishing: current.furnishing || "unfurnished",
      hostelType: current.hostelType || "male",
      size:
        value === "home" || value === "shop" || value === "office"
          ? current.size
          : { value: "", unit: "Marla" },
    }));
  };

  const handlePhotoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const nextPhotos = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setLocalPhotos((current) => [...current, ...nextPhotos]);
    setErrors((current) => ({ ...current, photos: "" }));
    event.target.value = "";
  };

  const removeLocalPhoto = (photoId: string) => {
    setLocalPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const addAddress = () => {
    setForm((current) => ({
      ...current,
      address: [
        ...current.address,
        {
          aptSuiteUnit: "",
          street: "",
          city: "",
          stateTerritory: "",
          country: "PAKISTAN",
          zipCode: "",
        },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    setForm((current) => ({
      ...current,
      address: current.address.filter(
        (_, addressIndex) => addressIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateAdminPropertyForm(form, {
      photoCount: form.photos.length + localPhotos.length,
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

      await apiClient.post("/properties/admin/create", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Property uploaded successfully.");
      localPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setLocalPhotos([]);
      setForm(createEmptyPropertyUploadForm());
      setSelectedUser(null);
      setUserSearchInput("");
      setUserOptions([]);
      setErrors(emptyErrors);
      window.setTimeout(() => {
        router.push("/properties");
      }, 450);
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
            : "Property upload failed. Please try again.";
      toast.error(String(message));
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/properties"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to properties
          </Link>
          <h1 className="text-3xl font-black text-foreground">
            Upload Property
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create a listing on behalf of any user using the same field
            structure the mobile upload flow sends to the backend.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 truncate text-lg font-black text-foreground">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form className="space-y-6 pb-8" onSubmit={handleSubmit}>
        <Section
          title="Assigned User"
          description="Search by name, email, or phone and attach the selected user as the property owner."
        >
          <Field label="Search user" error={errors.ownerId}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={userSearchInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setUserSearchInput(nextValue);
                  if (
                    selectedUser &&
                    nextValue !==
                      (selectedUser.name ||
                        selectedUser.email ||
                        selectedUser.phone ||
                        "")
                  ) {
                    setSelectedUser(null);
                    setField("ownerId", "");
                  }
                }}
                placeholder="Search users by name, email, or phone"
                className="admin-input w-full rounded-2xl px-11 py-3 text-sm"
              />
              {userSearchLoading ? (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          </Field>

          {selectedUser ? (
            <div className="rounded-2xl border border-[var(--admin-secondary-strong)] bg-[var(--admin-secondary-soft)] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-secondary)]">
                Selected owner
              </p>
              <p className="mt-1 text-base font-bold text-foreground">
                {selectedUser.name || "Unnamed user"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedUser.email || "No email"}{" "}
                {selectedUser.phone ? `• ${selectedUser.phone}` : ""}
              </p>
            </div>
          ) : null}

          {userSearchQuery.length >= 2 && !selectedUser ? (
            <div className="rounded-2xl border border-border bg-background">
              {userOptions.length > 0 ? (
                userOptions.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-start justify-between gap-4 border-b border-border px-4 py-3 text-left transition last:border-b-0 hover:bg-accent"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.name || "Unnamed user"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || "No email"}{" "}
                        {user.phone ? `• ${user.phone}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Select
                    </span>
                  </button>
                ))
              ) : userSearchLoading ? null : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No matching users found.
                </div>
              )}
            </div>
          ) : null}
        </Section>

        <Section
          title="Listing Basics"
          description="These fields mirror the opening steps of the mobile property upload flow."
        >
          <Field label="Property type" error={errors.hostOption}>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_HOST_OPTIONS.map((option) => {
                const active = form.hostOption === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleHostOptionChange(option)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {categoryLabel(option)}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Listing title" error={errors.title}>
              <input
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="Family home near F-6 Markaz"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Location label" error={errors.location}>
              <input
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="Islamabad"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Area">
              <input
                value={form.area}
                onChange={(event) => setField("area", event.target.value)}
                placeholder="G-11"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" error={errors.coordinates}>
                <input
                  value={form.lat}
                  onChange={(event) => setField("lat", event.target.value)}
                  placeholder="33.6844"
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
              <Field label="Longitude">
                <input
                  value={form.lng}
                  onChange={(event) => setField("lng", event.target.value)}
                  placeholder="73.0479"
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section
          title="Photos"
          description="Upload property images now. The admin form uploads them to Cloudinary first and then sends the same photo URL array the app uses."
        >
          <Field label="Property images" error={errors.photos}>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary">
              <Upload className="h-4 w-4" />
              Choose images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelection}
              />
            </label>
          </Field>

          {localPhotos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {localPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.file.name}
                    className="h-40 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 px-3 py-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {photo.file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLocalPhoto(photo.id)}
                      className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-[var(--admin-error)] hover:text-[var(--admin-error)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
              No photos selected yet.
            </div>
          )}
        </Section>

        <Section
          title="Property Details"
          description="Conditional fields stay aligned with the same host-option logic used in the app upload flow."
        >
          {isApartment ? (
            <div className="grid gap-5 md:grid-cols-3">
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
                      {option.toUpperCase()}
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

              <Field label="Parking">
                <select
                  value={form.parking ? "yes" : "no"}
                  onChange={(event) =>
                    setField("parking", event.target.value === "yes")
                  }
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
            </div>
          ) : null}

          {isHostel ? (
            <Field label="Hostel type" error={errors.hostelType}>
              <div className="flex flex-wrap gap-2">
                {HOSTEL_TYPES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setField("hostelType", option)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      form.hostelType === option
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {categoryLabel(option)}
                  </button>
                ))}
              </div>
            </Field>
          ) : null}

          {usesSize ? (
            <div className="grid gap-5 md:grid-cols-[1fr_220px]">
              <Field label="Property size" error={errors.sizeValue}>
                <input
                  value={form.size.value}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      size: { ...current.size, value: event.target.value },
                    }))
                  }
                  placeholder="10"
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </Field>
              <Field label="Size unit" error={errors.sizeUnit}>
                <select
                  value={form.size.unit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      size: { ...current.size, unit: event.target.value },
                    }))
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

          <div className="grid gap-4 md:grid-cols-4">
            {isHostel ? (
              <>
                <Field label="Guests" error={errors.capacityPersons}>
                  <input
                    type="number"
                    min={1}
                    value={form.capacityState.Persons ?? 1}
                    onChange={(event) =>
                      updateCapacity("Persons", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Rooms">
                  <input
                    type="number"
                    min={0}
                    value={form.capacityState.bedrooms ?? 0}
                    onChange={(event) =>
                      updateCapacity("bedrooms", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Beds" error={errors.capacityBeds}>
                  <input
                    type="number"
                    min={1}
                    value={form.capacityState.beds ?? 1}
                    onChange={(event) =>
                      updateCapacity("beds", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Bathrooms" error={errors.capacityBathrooms}>
                  <input
                    type="number"
                    min={1}
                    value={form.capacityState.bathrooms ?? 1}
                    onChange={(event) =>
                      updateCapacity("bathrooms", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field
                  label={
                    form.hostOption === "home" ? "Bedrooms" : "Rooms / sections"
                  }
                  error={errors.capacityBedrooms}
                >
                  <input
                    type="number"
                    min={1}
                    value={form.capacityState.bedrooms ?? 1}
                    onChange={(event) =>
                      updateCapacity("bedrooms", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Bathrooms" error={errors.capacityBathrooms}>
                  <input
                    type="number"
                    min={1}
                    value={form.capacityState.bathrooms ?? 1}
                    onChange={(event) =>
                      updateCapacity("bathrooms", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Floor level">
                  <input
                    type="number"
                    min={0}
                    value={form.capacityState.floorLevel ?? 0}
                    onChange={(event) =>
                      updateCapacity("floorLevel", Number(event.target.value))
                    }
                    className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </Field>
                {isApartment ? (
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                    Ground floor is represented as{" "}
                    <span className="font-semibold text-foreground">0</span>.
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Section>

        <Section
          title="Pricing"
          description="Use the same pricing fields the standard upload flow submits."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Monthly rent" error={errors.pricing}>
              <input
                value={form.monthlyRent}
                onChange={(event) =>
                  setField("monthlyRent", event.target.value)
                }
                placeholder="65000"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>
            <Field label="Weekly rent">
              <input
                value={form.weeklyRent}
                onChange={(event) => setField("weeklyRent", event.target.value)}
                placeholder="20000"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>
            <Field label="Daily rent">
              <input
                value={form.dailyRent}
                onChange={(event) => setField("dailyRent", event.target.value)}
                placeholder="4500"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>
            <Field
              label="Default displayed rent"
              error={errors.defaultRentType}
              hint="Controls which rent shows first on listing cards and property details."
            >
              <select
                value={form.defaultRentType}
                onChange={(event) =>
                  setField(
                    "defaultRentType",
                    event.target.value as "daily" | "weekly" | "monthly",
                  )
                }
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label="Security deposit" error={errors.SecuritybasePrice}>
              <input
                value={form.SecuritybasePrice}
                onChange={(event) =>
                  setField("SecuritybasePrice", event.target.value)
                }
                placeholder="50000"
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>
          </div>

          <Field label="Bills included in rent">
            <ChipGroup
              options={BILL_OPTIONS.map((option) => ({
                key: option,
                label: categoryLabel(option),
              }))}
              values={form.ALL_BILLS}
              onToggle={(value) => toggleArrayValue("ALL_BILLS", value)}
            />
          </Field>
        </Section>

        <Section
          title="Amenities And Highlights"
          description="These map directly to the amenity keys and highlighted-description array the app already uses."
        >
          <Field label="Amenities" error={errors.amenities}>
            <ChipGroup
              options={AMENITY_OPTIONS}
              values={form.amenities}
              onToggle={(value) => toggleArrayValue("amenities", value)}
            />
          </Field>

          <Field label="Listing highlights" error={errors.highlights}>
            <ChipGroup
              options={HIGHLIGHT_OPTIONS}
              values={form.description.highlighted}
              onToggle={(value) => toggleNestedArrayValue("highlighted", value)}
            />
          </Field>

          {isHostel ? (
            <>
              <Field label="Meal plan" error={errors.mealPlan}>
                <ChipGroup
                  options={MEAL_PLAN_OPTIONS}
                  values={form.mealPlan}
                  onToggle={(value) => toggleArrayValue("mealPlan", value)}
                />
              </Field>

              <Field label="Hostel rules" error={errors.rules}>
                <ChipGroup
                  options={RULE_OPTIONS}
                  values={form.rules}
                  onToggle={(value) => toggleArrayValue("rules", value)}
                />
              </Field>
            </>
          ) : null}
        </Section>

        <Section
          title="Safety"
          description="This section matches the mobile safety checklist and still requires disclosure text for exterior cameras."
        >
          <Field label="Safety details" error={errors.safetyDetails}>
            <ChipGroup
              options={SAFETY_DETAILS}
              values={form.safetyDetailsData.safetyDetails}
              onToggle={(value) =>
                toggleNestedArrayValue("safetyDetails", value)
              }
            />
          </Field>

          {form.safetyDetailsData.safetyDetails.includes("exterior_camera") ? (
            <Field
              label="Exterior camera disclosure"
              error={errors.cameraDescription}
            >
              <textarea
                value={form.safetyDetailsData.cameraDescription}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    safetyDetailsData: {
                      ...current.safetyDetailsData,
                      cameraDescription: event.target.value,
                    },
                  }))
                }
                rows={4}
                placeholder="Describe where the exterior camera is located and what it covers."
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
              />
            </Field>
          ) : null}
        </Section>

        <Section
          title="Address"
          description="The backend expects the same address array shape as the mobile final submission step."
        >
          <div className="space-y-5">
            {form.address.map((entry, index) => (
              <div
                key={`${index}-${entry.street}`}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Address {index + 1}
                  </h3>
                  {form.address.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-error)]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Street address"
                    error={index === 0 ? errors.street : undefined}
                  >
                    <input
                      value={entry.street}
                      onChange={(event) =>
                        setAddressField(index, "street", event.target.value)
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                  <Field label="Apt / suite / unit">
                    <input
                      value={entry.aptSuiteUnit}
                      onChange={(event) =>
                        setAddressField(
                          index,
                          "aptSuiteUnit",
                          event.target.value,
                        )
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                  <Field
                    label="City"
                    error={index === 0 ? errors.city : undefined}
                  >
                    <input
                      value={entry.city}
                      onChange={(event) =>
                        setAddressField(index, "city", event.target.value)
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                  <Field
                    label="State / territory"
                    error={index === 0 ? errors.stateTerritory : undefined}
                  >
                    <input
                      value={entry.stateTerritory}
                      onChange={(event) =>
                        setAddressField(
                          index,
                          "stateTerritory",
                          event.target.value,
                        )
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={entry.country}
                      onChange={(event) =>
                        setAddressField(index, "country", event.target.value)
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                  <Field
                    label="ZIP code"
                    error={index === 0 ? errors.zipCode : undefined}
                  >
                    <input
                      value={entry.zipCode}
                      onChange={(event) =>
                        setAddressField(index, "zipCode", event.target.value)
                      }
                      className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAddress}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Add another address
          </button>
        </Section>

        <div className="sticky bottom-4 z-10 rounded-[2rem] border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">
                Admin upload summary
              </p>
              <p className="text-sm text-muted-foreground">
                This will create a published property for{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser?.name || "the selected user"}
                </span>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingImages}
              className="admin-button-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting || uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingImages
                    ? "Uploading images..."
                    : "Creating property..."}
                </>
              ) : (
                "Create property"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
