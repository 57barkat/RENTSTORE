"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type {
  FurnishingType,
  HostelType,
  PropertyCategory,
  PropertySearchFilters,
  PropertySort,
  SizeUnit,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  getCategoryLabel,
} from "@/app/lib/property-utils";

interface PublicSearchHeroProps {
  category: PropertyCategory;
  filters: PropertySearchFilters;
  total: number;
  backgroundImage?: string;
}

type NumericFilterValue = number | "";

const CATEGORY_TABS: Array<{ label: string; value: PropertyCategory }> = [
  { label: "All", value: "property" },
  { label: "Hostels", value: "hostel" },
  { label: "Apartments", value: "apartment" },
  { label: "Houses", value: "home" },
  { label: "Offices", value: "office" },
  { label: "Shops", value: "shop" },
];

const CITY_OPTIONS = [
  // { label: "All cities", value: "" },
  { label: "Islamabad", value: "Islamabad" },
  // { label: "Rawalpindi", value: "Rawalpindi" },
] as const;

const AMENITY_FILTERS = [
  { label: "WiFi", value: "wifi" },
  { label: "AC", value: "ac" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Laundry", value: "laundry" },
  { label: "CCTV", value: "cctv" },
  { label: "Lift", value: "lift" },
  { label: "Gym", value: "gym" },
  { label: "Workspace", value: "workspace" },
] as const;

const SIZE_UNITS: SizeUnit[] = ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."];

const BUDGET_PRESETS = [
  { label: "Under Rs. 25k", minRent: "" as const, maxRent: 25000 },
  { label: "Rs. 25k - 50k", minRent: 25000, maxRent: 50000 },
  { label: "Rs. 50k - 100k", minRent: 50000, maxRent: 100000 },
  { label: "Above Rs. 100k", minRent: 100000, maxRent: "" as const },
] as const;

const parseNumericFilter = (value: string): NumericFilterValue => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0) return "";

  return parsed;
};

const hasRangeError = (minValue: string, maxValue: string) => {
  const min = parseNumericFilter(minValue);
  const max = parseNumericFilter(maxValue);

  return typeof min === "number" && typeof max === "number" && min > max;
};

const stringifyNumericFilter = (value: number | "" | undefined) =>
  typeof value === "number" ? String(value) : "";

const formatBudgetLabel = (minRent?: number | "", maxRent?: number | "") => {
  const min = typeof minRent === "number" && minRent > 0 ? minRent : null;
  const max = typeof maxRent === "number" && maxRent > 0 ? maxRent : null;

  if (!min && !max) return "Any budget";

  const formatter = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
    notation: "compact",
  });

  if (min && max)
    return `Rs. ${formatter.format(min)} - ${formatter.format(max)}`;

  return min
    ? `From Rs. ${formatter.format(min)}`
    : `Up to Rs. ${formatter.format(max!)}`;
};

const getActiveFilterCount = (filters: PropertySearchFilters) =>
  [
    filters.category !== "property",
    // filters.city,
    filters.location,
    filters.minRent,
    filters.maxRent,
    filters.bedrooms,
    filters.bathrooms,
    filters.minSize,
    filters.maxSize,
    filters.sizeUnit,
    filters.hostelType,
    filters.furnishing,
    filters.parking !== "" && filters.parking !== undefined,
    filters.familyFriendly === true,
    filters.sortBy && filters.sortBy !== "newest",
    ...(filters.amenities || []),
  ].filter(Boolean).length;

const makeChipLabel = (label: string, value?: string | number | boolean) =>
  value === undefined || value === "" || value === true
    ? label
    : `${label}: ${value}`;

export default function PublicSearchHero({
  category,
  filters,
  total,
  backgroundImage,
}: PublicSearchHeroProps) {
  const { updateFilters } = useProperties(category);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<PropertySearchFilters>(filters);
  const [locationInput, setLocationInput] = useState(filters.location || "");
  const [minRentInput, setMinRentInput] = useState(
    stringifyNumericFilter(filters.minRent),
  );
  const [maxRentInput, setMaxRentInput] = useState(
    stringifyNumericFilter(filters.maxRent),
  );
  const [minSizeInput, setMinSizeInput] = useState(
    stringifyNumericFilter(filters.minSize),
  );
  const [maxSizeInput, setMaxSizeInput] = useState(
    stringifyNumericFilter(filters.maxSize),
  );

  const rentRangeHasError = hasRangeError(minRentInput, maxRentInput);
  const sizeRangeHasError = hasRangeError(minSizeInput, maxSizeInput);

  const displayFilters: PropertySearchFilters = {
    ...optimisticFilters,
    location: locationInput,
    minRent: parseNumericFilter(minRentInput),
    maxRent: parseNumericFilter(maxRentInput),
    minSize: parseNumericFilter(minSizeInput),
    maxSize: parseNumericFilter(maxSizeInput),
  };

  const activeFilterCount = getActiveFilterCount(displayFilters);

  const heroLocation = useMemo(() => {
    if (displayFilters.location && displayFilters.city)
      return `${displayFilters.location}, ${displayFilters.city}`;

    if (displayFilters.location) return displayFilters.location;

    if (displayFilters.city) return displayFilters.city;

    return "Islamabad ";
  }, [displayFilters.city, displayFilters.location]);

  const selectedAmenities = displayFilters.amenities || [];

  const commitFilters = (nextFilters: Partial<PropertySearchFilters>) => {
    setOptimisticFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));

    updateFilters(nextFilters);
  };

  const handleResetFilters = () => {
    setIsResetting(true);
    setFiltersOpen(false);

    const clearedFilterPatch: Partial<PropertySearchFilters> = {
      category: "property",
      city: "",
      location: "",
      minRent: "",
      maxRent: "",
      bedrooms: "",
      bathrooms: "",
      minSize: "",
      maxSize: "",
      sizeUnit: "",
      hostelType: "",
      furnishing: "",
      parking: "",
      familyFriendly: "",
      amenities: [],
      sortBy: "newest",
    };

    setLocationInput("");
    setMinRentInput("");
    setMaxRentInput("");
    setMinSizeInput("");
    setMaxSizeInput("");

    setOptimisticFilters((currentFilters) => ({
      ...currentFilters,
      ...clearedFilterPatch,
    }));

    updateFilters(clearedFilterPatch);

    window.setTimeout(() => {
      setIsResetting(false);
    }, 450);
  };

  const applyPrimarySearch = () => {
    if (rentRangeHasError) return;

    const nextFilters: Partial<PropertySearchFilters> = {
      location: locationInput.trim(),
      city: displayFilters.city,
      minRent: parseNumericFilter(minRentInput),
      maxRent: parseNumericFilter(maxRentInput),
    };

    commitFilters(nextFilters);
  };

  const applyAdvancedFilters = () => {
    if (rentRangeHasError || sizeRangeHasError) return;

    const nextFilters: Partial<PropertySearchFilters> = {
      minRent: parseNumericFilter(minRentInput),
      maxRent: parseNumericFilter(maxRentInput),
      minSize: parseNumericFilter(minSizeInput),
      maxSize: parseNumericFilter(maxSizeInput),
    };

    commitFilters(nextFilters);
    setFiltersOpen(false);
  };

  const handleCategoryChange = (nextCategory: PropertyCategory) => {
    commitFilters({
      category: nextCategory,
      hostelType: nextCategory === "hostel" ? displayFilters.hostelType : "",
    });
  };

  const handleCityChange = (nextCity: string) => {
    setLocationInput("");
    commitFilters({
      city: nextCity,
      location: "",
    });
  };

  const applyBudgetPreset = (
    minRent: NumericFilterValue,
    maxRent: NumericFilterValue,
  ) => {
    setMinRentInput(stringifyNumericFilter(minRent));
    setMaxRentInput(stringifyNumericFilter(maxRent));
    commitFilters({ minRent, maxRent });
  };

  const toggleAmenity = (amenity: string) => {
    const selected = selectedAmenities.includes(amenity);
    const nextAmenities = selected
      ? selectedAmenities.filter((item) => item !== amenity)
      : [...selectedAmenities, amenity];

    commitFilters({ amenities: nextAmenities });
  };

  const removeAmenity = (amenity: string) => {
    commitFilters({
      amenities: selectedAmenities.filter((item) => item !== amenity),
    });
  };

  const activeChips = [
    displayFilters.category !== "property"
      ? {
          key: "category",
          label: getCategoryLabel(displayFilters.category, true),
          onRemove: () =>
            commitFilters({ category: "property", hostelType: "" }),
        }
      : null,
    displayFilters.location
      ? {
          key: "location",
          label: makeChipLabel("Area", displayFilters.location),
          onRemove: () => {
            setLocationInput("");
            commitFilters({ location: "" });
          },
        }
      : null,
    // displayFilters.city
    //   ? {
    //       key: "city",
    //       label: makeChipLabel("City", displayFilters.city),
    //       onRemove: () => {
    //         setLocationInput("");
    //         commitFilters({ city: "", location: "" });
    //       },
    //     }
    //   : null,
    displayFilters.minRent || displayFilters.maxRent
      ? {
          key: "budget",
          label: formatBudgetLabel(
            displayFilters.minRent,
            displayFilters.maxRent,
          ),
          onRemove: () => {
            setMinRentInput("");
            setMaxRentInput("");
            commitFilters({ minRent: "", maxRent: "" });
          },
        }
      : null,
    displayFilters.bedrooms
      ? {
          key: "bedrooms",
          label: makeChipLabel("Bedrooms", displayFilters.bedrooms),
          onRemove: () => commitFilters({ bedrooms: "" }),
        }
      : null,
    displayFilters.bathrooms
      ? {
          key: "bathrooms",
          label: makeChipLabel("Bathrooms", displayFilters.bathrooms),
          onRemove: () => commitFilters({ bathrooms: "" }),
        }
      : null,
    displayFilters.minSize || displayFilters.maxSize || displayFilters.sizeUnit
      ? {
          key: "size",
          label:
            [
              displayFilters.minSize ? `Min ${displayFilters.minSize}` : "",
              displayFilters.maxSize ? `Max ${displayFilters.maxSize}` : "",
              displayFilters.sizeUnit || "",
            ]
              .filter(Boolean)
              .join(" ") || "Size",
          onRemove: () => {
            setMinSizeInput("");
            setMaxSizeInput("");
            commitFilters({ minSize: "", maxSize: "", sizeUnit: "" });
          },
        }
      : null,
    displayFilters.hostelType
      ? {
          key: "hostelType",
          label: makeChipLabel("Hostel type", displayFilters.hostelType),
          onRemove: () => commitFilters({ hostelType: "" }),
        }
      : null,
    displayFilters.furnishing
      ? {
          key: "furnishing",
          label: makeChipLabel("Furnishing", displayFilters.furnishing),
          onRemove: () => commitFilters({ furnishing: "" }),
        }
      : null,
    displayFilters.parking === true
      ? {
          key: "parking",
          label: "Parking",
          onRemove: () => commitFilters({ parking: "" }),
        }
      : null,
    displayFilters.familyFriendly === true
      ? {
          key: "familyFriendly",
          label: "Family friendly",
          onRemove: () => commitFilters({ familyFriendly: "" }),
        }
      : null,
    displayFilters.sortBy && displayFilters.sortBy !== "newest"
      ? {
          key: "sortBy",
          label:
            displayFilters.sortBy === "popular"
              ? "Most popular"
              : displayFilters.sortBy === "price_asc"
                ? "Price low to high"
                : displayFilters.sortBy === "price_desc"
                  ? "Price high to low"
                  : "Latest listings",
          onRemove: () => commitFilters({ sortBy: "newest" }),
        }
      : null,
    ...selectedAmenities.map((amenity) => ({
      key: `amenity-${amenity}`,
      label:
        AMENITY_FILTERS.find((item) => item.value === amenity)?.label ||
        amenity,
      onRemove: () => removeAmenity(amenity),
    })),
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }>;

  const advancedPanel = (
    <div className="space-y-5">
      <FilterGroup title="Budget">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={minRentInput}
            onChange={(event) => setMinRentInput(event.target.value)}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min price"
            aria-invalid={rentRangeHasError}
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <input
            value={maxRentInput}
            onChange={(event) => setMaxRentInput(event.target.value)}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max price"
            aria-invalid={rentRangeHasError}
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
        </div>
        {rentRangeHasError && (
          <p className="mt-2 text-xs text-red-600">
            Min price cannot be higher than max price.
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const active =
              displayFilters.minRent === preset.minRent &&
              displayFilters.maxRent === preset.maxRent;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  applyBudgetPreset(preset.minRent, preset.maxRent)
                }
                className={`rounded-full border px-3 py-2 text-xs transition ${
                  active
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                    : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Bedrooms">
          <SegmentedOptions
            options={[1, 2, 3, 4].map((value) => ({
              label: `${value}`,
              active: displayFilters.bedrooms === value,
              onClick: () =>
                commitFilters({
                  bedrooms: displayFilters.bedrooms === value ? "" : value,
                }),
            }))}
          />
        </FilterGroup>

        <FilterGroup title="Bathrooms">
          <SegmentedOptions
            options={[1, 2, 3].map((value) => ({
              label: `${value}`,
              active: displayFilters.bathrooms === value,
              onClick: () =>
                commitFilters({
                  bathrooms: displayFilters.bathrooms === value ? "" : value,
                }),
            }))}
          />
        </FilterGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Furnishing">
          <SelectControl
            value={displayFilters.furnishing || ""}
            onChange={(value) =>
              commitFilters({
                furnishing: value as FurnishingType | "",
              })
            }
            options={[
              ["", "Any furnishing"],
              ["furnished", "Furnished"],
              ["semi-furnished", "Semi-furnished"],
              ["unfurnished", "Unfurnished"],
            ]}
          />
        </FilterGroup>

        <FilterGroup title="Hostel type">
          <SelectControl
            value={displayFilters.hostelType || ""}
            onChange={(value) =>
              commitFilters({
                hostelType: value as HostelType | "",
              })
            }
            options={[
              ["", "All hostel types"],
              ["male", "Male"],
              ["female", "Female"],
              ["mixed", "Mixed"],
            ]}
          />
        </FilterGroup>
      </div>

      <FilterGroup title="Size">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_150px]">
          <input
            value={minSizeInput}
            onChange={(event) => setMinSizeInput(event.target.value)}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min size"
            aria-invalid={sizeRangeHasError}
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <input
            value={maxSizeInput}
            onChange={(event) => setMaxSizeInput(event.target.value)}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max size"
            aria-invalid={sizeRangeHasError}
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <SelectControl
            value={displayFilters.sizeUnit || ""}
            onChange={(value) =>
              commitFilters({
                sizeUnit: value as SizeUnit | "",
              })
            }
            options={[
              ["", "Any unit"],
              ...SIZE_UNITS.map((unit) => [unit, unit] as [string, string]),
            ]}
          />
        </div>
        {sizeRangeHasError && (
          <p className="mt-2 text-xs text-red-600">
            Min size cannot be higher than max size.
          </p>
        )}
      </FilterGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Parking">
          <SegmentedOptions
            options={[
              {
                label: "Any",
                active:
                  displayFilters.parking === "" ||
                  displayFilters.parking === undefined,
                onClick: () => commitFilters({ parking: "" }),
              },
              {
                label: "Parking available",
                active: displayFilters.parking === true,
                onClick: () => commitFilters({ parking: true }),
              },
            ]}
          />
        </FilterGroup>

        <FilterGroup title="Family friendly">
          <SegmentedOptions
            options={[
              {
                label: "Any",
                active:
                  displayFilters.familyFriendly === "" ||
                  displayFilters.familyFriendly === undefined,
                onClick: () => commitFilters({ familyFriendly: "" }),
              },
              {
                label: "Family friendly",
                active: displayFilters.familyFriendly === true,
                onClick: () => commitFilters({ familyFriendly: true }),
              },
            ]}
          />
        </FilterGroup>
      </div>

      <FilterGroup title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_FILTERS.map((item) => {
            const active = selectedAmenities.includes(item.value);

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleAmenity(item.value)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  active
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                    : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Sort">
        <SelectControl
          value={displayFilters.sortBy || "newest"}
          onChange={(value) =>
            commitFilters({
              sortBy: value as PropertySort,
            })
          }
          options={[
            ["newest", "Latest listings"],
            ["popular", "Most popular"],
            ["price_asc", "Price: low to high"],
            ["price_desc", "Price: high to low"],
          ]}
        />
      </FilterGroup>
    </div>
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#001f8f]">
        <div className="absolute inset-0">
          <Image
            src={backgroundImage || DEFAULT_PROPERTY_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#001a9b_0%,rgba(0,45,178,0.88)_42%,rgba(0,167,145,0.86)_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[360px] max-w-[1500px] flex-col items-center px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8 lg:pt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase text-white shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Verified property discovery
          </span>

          <h1 className="mt-5 max-w-4xl text-[2.2rem] font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Find your perfect{" "}
            <span className="italic text-[#22C55E]">angan</span> in{" "}
            {heroLocation}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            Browse {total.toLocaleString("en-PK")} verified listings with live
            pricing, photos, and location-aware filters.
            <span className="mt-2 block text-sm text-white/85">
              AnganStay is currently focused on Islamabad. More cities are
              coming soon.
            </span>
          </p>
        </div>
      </section>

      <section
        className="sticky z-40 -mt-16 border-b border-[var(--admin-border)] bg-white/92 px-4 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:px-6 lg:px-8"
        style={{ top: "calc(var(--public-header-height, 0px))" }}
      >
        <div className="mx-auto max-w-[1500px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyPrimarySearch();
            }}
            className="rounded-[1.25rem] border border-[var(--admin-border)] bg-white p-2 shadow-sm"
          >
            <div className="grid gap-2 lg:grid-cols-[minmax(180px,220px)_minmax(260px,1fr)_minmax(220px,0.7fr)_auto_auto]">
              <label className="relative hidden lg:block">
                <span className="sr-only">Property category</span>
                <select
                  value={displayFilters.category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value as PropertyCategory)
                  }
                  className="admin-input h-12 w-full appearance-none rounded-2xl px-4 pr-9 text-sm"
                >
                  {CATEGORY_TABS.map((tab) => (
                    <option key={tab.value} value={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              </label>

              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-white px-4 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                <span className="relative shrink-0 border-r border-[var(--admin-border)] pr-3">
                  <span className="sr-only">City</span>
                  {/* <select
                    value={displayFilters.city || ""}
                    onChange={(event) => handleCityChange(event.target.value)}
                    className="w-[104px] appearance-none bg-transparent pr-5 text-sm text-[var(--admin-text)] outline-none sm:w-[118px]"
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option
                        key={city.value || "all-cities"}
                        value={city.value}
                      >
                        {city.label}
                      </option>
                    ))}
                  </select> */}
                  {"Islamabad"}
                  {/* <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-muted)]" /> */}
                </span>
                <input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Sector, area, or landmark"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
              </label>

              <div className="hidden min-h-12 grid-cols-2 items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 md:grid">
                <input
                  value={minRentInput}
                  onChange={(event) => setMinRentInput(event.target.value)}
                  inputMode="numeric"
                  type="number"
                  min={0}
                  placeholder="Min price"
                  aria-invalid={rentRangeHasError}
                  className="min-w-0 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
                <input
                  value={maxRentInput}
                  onChange={(event) => setMaxRentInput(event.target.value)}
                  inputMode="numeric"
                  type="number"
                  min={0}
                  placeholder="Max price"
                  aria-invalid={rentRangeHasError}
                  className="min-w-0 border-l border-[var(--admin-border)] bg-transparent pl-3 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[var(--admin-primary)] px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="submit"
                disabled={rentRangeHasError}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm text-white shadow-[0_16px_30px_-24px_var(--admin-primary)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {rentRangeHasError && (
              <p className="mt-2 px-2 text-xs text-red-600">
                Min price cannot be higher than max price.
              </p>
            )}

            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {CATEGORY_TABS.map((tab) => {
                const active = displayFilters.category === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleCategoryChange(tab.value)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                      active
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                        : "border-[var(--admin-border)] bg-white text-[var(--admin-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </form>

          {activeChips.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 text-xs text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="shrink-0 rounded-full px-3 py-2 text-xs text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary-soft)]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 px-0 backdrop-blur-sm sm:items-center sm:px-4">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0"
          />

          <div className="relative max-h-[88vh] w-full overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.7)] transition sm:max-w-3xl sm:rounded-[1.75rem]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2 className="text-lg text-[var(--admin-text)]">
                  More filters
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  Refine listings without leaving the search page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-background)] text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-142px)] overflow-y-auto px-5 py-5">
              {advancedPanel}
            </div>

            <div className="sticky bottom-0 grid gap-3 border-t border-[var(--admin-border)] bg-white px-5 py-4 sm:grid-cols-[1fr_1fr]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-12 rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={applyAdvancedFilters}
                disabled={rentRangeHasError || sizeRangeHasError}
                className="min-h-12 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--admin-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SegmentedOptions({
  options,
}: {
  options: Array<{ label: string; active: boolean; onClick: () => void }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.onClick}
          className={`min-h-10 rounded-xl border px-4 text-sm transition ${
            option.active
              ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
              : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Select filter</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue || label} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
    </label>
  );
}
