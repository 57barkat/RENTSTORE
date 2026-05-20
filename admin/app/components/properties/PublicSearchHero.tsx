"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import { usePublicScrollHeader } from "@/app/components/public/PublicScrollHeaderContext";
import type {
  FurnishingType,
  HostelType,
  PropertyCategory,
  PublicFilterOption,
  PublicPropertyFilterOptions,
  PropertySearchFilters,
  PropertySort,
  SizeUnit,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  formatReadableLabel,
} from "@/app/lib/property-utils";

interface PublicSearchHeroProps {
  category: PropertyCategory;
  filters: PropertySearchFilters;
  filterOptions: PublicPropertyFilterOptions;
  total?: number | null;
  backgroundImage?: string;
}

type NumericFilterValue = number | "";

const CATEGORY_TABS: Array<{ label: string; value: PropertyCategory }> = [
  { label: "All Properties", value: "property" },
  { label: "Houses", value: "home" },
  { label: "Apartments", value: "apartment" },
  { label: "Hostels", value: "hostel" },
  { label: "Shops", value: "shop" },
  { label: "Offices", value: "office" },
];

const HERO_TRUST_ITEMS = [
  {
    title: "Verified Listings",
    description: "Platform-reviewed rental listings",
    icon: ShieldCheck,
  },
  {
    title: "Islamabad Focused",
    description: "All listings are from Islamabad only",
    icon: MapPin,
  },
  {
    title: "Smart Filters",
    description: "Search by sector, budget, and amenities",
    icon: SlidersHorizontal,
  },
  {
    title: "Managed Marketplace",
    description: "A cleaner way to browse local rentals",
    icon: Building2,
  },
];

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

  if (!min && !max) {
    return "Any budget";
  }

  const formatter = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
    notation: "compact",
  });

  if (min && max) {
    return `Rs. ${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min) {
    return `From Rs. ${formatter.format(min)}`;
  }

  return `Up to Rs. ${formatter.format(max!)}`;
};

const getActiveFilterCount = (filters: PropertySearchFilters) =>
  [
    // filters.category !== "property",
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

const EMPTY_FILTER_OPTIONS: PublicPropertyFilterOptions = {
  amenities: [],
  furnishing: [],
  hostelTypes: [],
  sizeUnits: [],
  bedrooms: [],
  bathrooms: [],
  parkingAvailable: false,
  familyFriendlyAvailable: false,
};

const mergeTextOptions = (
  options: PublicFilterOption[],
  selectedValues: Array<string | undefined | null>,
) => {
  const seen = new Set<string>();
  const merged: PublicFilterOption[] = [];

  [
    ...options,
    ...selectedValues.map((value) => ({
      value: value || "",
      label: "",
      count: undefined,
    })),
  ].forEach((option) => {
    const value = option.value.trim();
    const key = value.toLowerCase();

    if (!value || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push({
      value,
      label: formatReadableLabel(option.label || value),
      count: option.count,
    });
  });

  return merged;
};

const mergeNumberOptions = (
  options: number[],
  selectedValue: number | "" | undefined,
) =>
  Array.from(
    new Set([
      ...options.filter((value) => Number.isFinite(value) && value > 0),
      ...(typeof selectedValue === "number" && selectedValue > 0
        ? [selectedValue]
        : []),
    ]),
  ).sort((left, right) => left - right);

const getOptionLabel = (options: PublicFilterOption[], value: string) =>
  options.find((option) => option.value === value)?.label ||
  formatReadableLabel(value);

export default function PublicSearchHero({
  category,
  filters,
  filterOptions,
  backgroundImage,
}: PublicSearchHeroProps) {
  const { updateFilters } = useProperties(category);
  const { isHeaderHidden } = usePublicScrollHeader();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersStuck, setFiltersStuck] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<PropertySearchFilters>(filters);
  const stickyFilterSentinelRef = useRef<HTMLDivElement>(null);
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

  const activeFilterCount = getActiveFilterCount({
    ...displayFilters,
    hostelType:
      displayFilters.category === "hostel" ? displayFilters.hostelType : "",
  });
  const showStickyCategorySelector = filtersStuck && isHeaderHidden;
  const stickyFilterRowClass = showStickyCategorySelector
    ? "grid grid-cols-2 gap-2 md:grid-cols-[minmax(160px,220px)_minmax(0,1fr)_auto_auto] xl:grid-cols-[minmax(180px,220px)_minmax(280px,1fr)_minmax(260px,360px)_auto_auto]"
    : "grid grid-cols-2 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(360px,1fr)_minmax(280px,420px)_auto_auto]";
  const locationFieldClass = showStickyCategorySelector
    ? "col-span-1 min-w-0 xl:col-span-1"
    : "col-span-2 min-w-0 xl:col-span-1";
  const priceFieldClass = showStickyCategorySelector
    ? "hidden min-h-12 min-w-0 items-center rounded-2xl border border-[var(--admin-border)] bg-white xl:col-span-1 xl:grid xl:w-full xl:grid-cols-2"
    : "hidden min-h-12 min-w-0 items-center rounded-2xl border border-[var(--admin-border)] bg-white md:col-span-2 md:grid md:w-full md:grid-cols-2 xl:col-span-1";
  const compactPriceRowClass = showStickyCategorySelector
    ? "mt-2 grid grid-cols-2 gap-2 xl:hidden"
    : "mt-2 grid grid-cols-2 gap-2 md:hidden";
  const priceRangeErrorMessage = "Enter a valid price range";
  const priceRangeContainerClass = rentRangeHasError
    ? "border-red-500 bg-red-50/40 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10"
    : "focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10";
  const priceRangeInputClass = rentRangeHasError
    ? "text-red-700 placeholder:text-red-400"
    : "text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]";

  const heroLocation = "Islamabad";

  const selectedAmenities = displayFilters.amenities || [];
  const resolvedFilterOptions = {
    ...EMPTY_FILTER_OPTIONS,
    ...filterOptions,
  };
  const amenityFilterOptions = mergeTextOptions(
    resolvedFilterOptions.amenities,
    selectedAmenities,
  );
  const furnishingOptions = mergeTextOptions(resolvedFilterOptions.furnishing, [
    displayFilters.furnishing || "",
  ]);
  const hostelTypeOptions = mergeTextOptions(
    resolvedFilterOptions.hostelTypes,
    [displayFilters.hostelType || ""],
  );
  const sizeUnitOptions = mergeTextOptions(resolvedFilterOptions.sizeUnits, [
    displayFilters.sizeUnit || "",
  ]);
  const bedroomOptions = mergeNumberOptions(
    resolvedFilterOptions.bedrooms,
    displayFilters.bedrooms,
  );
  const bathroomOptions = mergeNumberOptions(
    resolvedFilterOptions.bathrooms,
    displayFilters.bathrooms,
  );
  const showBedroomFilters = bedroomOptions.length > 0;
  const showBathroomFilters = bathroomOptions.length > 0;
  const showFurnishingFilters = furnishingOptions.length > 0;
  const showHostelTypeFilters =
    displayFilters.category === "hostel" && hostelTypeOptions.length > 0;
  const showSizeFilters =
    sizeUnitOptions.length > 0 ||
    Boolean(displayFilters.minSize || displayFilters.maxSize);
  const showParkingFilters =
    resolvedFilterOptions.parkingAvailable || displayFilters.parking === true;
  const showFamilyFriendlyFilters =
    resolvedFilterOptions.familyFriendlyAvailable ||
    displayFilters.familyFriendly === true;
  const showAmenitiesFilters = amenityFilterOptions.length > 0;

  useEffect(() => {
    const sentinel = stickyFilterSentinelRef.current;
    if (!sentinel) return;

    let frameId: number | null = null;

    const getHeaderHeight = () =>
      Number.parseFloat(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--public-header-height"),
      ) || 74;

    const updateStuckState = () => {
      const shouldStick =
        sentinel.getBoundingClientRect().top <= getHeaderHeight() + 1;

      setFiltersStuck((current) =>
        current === shouldStick ? current : shouldStick,
      );
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateStuckState();
      });
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const commitFilters = (nextFilters: Partial<PropertySearchFilters>) => {
    setOptimisticFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));

    updateFilters(nextFilters);
  };
  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [filtersOpen]);
  const handleResetFilters = () => {
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
      location: locationInput.trim(),
      city: displayFilters.city,
      hostelType:
        displayFilters.category === "hostel" ? displayFilters.hostelType : "",
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
    // displayFilters.category !== "property"
    //   ? {
    //       key: "category",
    //       label: getCategoryLabel(displayFilters.category, true),
    //       onRemove: () =>
    //         commitFilters({ category: "property", hostelType: "" }),
    //     }
    //   : null,
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
    displayFilters.minRent
      ? {
          key: "budget",
          label: formatBudgetLabel(displayFilters.minRent, ""),
          onRemove: () => {
            setMinRentInput("");
            commitFilters({ minRent: "" });
          },
        }
      : null,

    displayFilters.maxRent
      ? {
          key: "budget1",
          label: formatBudgetLabel("", displayFilters.maxRent),
          onRemove: () => {
            setMaxRentInput("");
            commitFilters({ maxRent: "" });
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
    displayFilters.category === "hostel" && displayFilters.hostelType
      ? {
          key: "hostelType",
          label: makeChipLabel(
            "Hostel type",
            getOptionLabel(hostelTypeOptions, displayFilters.hostelType),
          ),
          onRemove: () => commitFilters({ hostelType: "" }),
        }
      : null,
    displayFilters.furnishing
      ? {
          key: "furnishing",
          label: makeChipLabel(
            "Furnishing",
            getOptionLabel(furnishingOptions, displayFilters.furnishing),
          ),
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
      label: getOptionLabel(amenityFilterOptions, amenity),
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
            className={`admin-input h-11 rounded-xl px-3 text-sm ${
              rentRangeHasError
                ? "border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500/10"
                : ""
            }`}
          />
          <input
            value={maxRentInput}
            onChange={(event) => setMaxRentInput(event.target.value)}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max price"
            aria-invalid={rentRangeHasError}
            className={`admin-input h-11 rounded-xl px-3 text-sm ${
              rentRangeHasError
                ? "border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500/10"
                : ""
            }`}
          />
        </div>
        {rentRangeHasError && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
            {/* <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> */}
            <span>{priceRangeErrorMessage}</span>
          </div>
        )}
      </FilterGroup>

      {(showBedroomFilters || showBathroomFilters) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {showBedroomFilters && (
            <FilterGroup title="Bedrooms">
              <SegmentedOptions
                options={bedroomOptions.map((value) => ({
                  label: `${value}`,
                  active: displayFilters.bedrooms === value,
                  onClick: () =>
                    commitFilters({
                      bedrooms: displayFilters.bedrooms === value ? "" : value,
                    }),
                }))}
              />
            </FilterGroup>
          )}

          {showBathroomFilters && (
            <FilterGroup title="Bathrooms">
              <SegmentedOptions
                options={bathroomOptions.map((value) => ({
                  label: `${value}`,
                  active: displayFilters.bathrooms === value,
                  onClick: () =>
                    commitFilters({
                      bathrooms:
                        displayFilters.bathrooms === value ? "" : value,
                    }),
                }))}
              />
            </FilterGroup>
          )}
        </div>
      )}

      {(showFurnishingFilters || showHostelTypeFilters) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {showFurnishingFilters && (
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
                  ...furnishingOptions.map((option): [string, string] => [
                    option.value,
                    option.label,
                  ]),
                ]}
              />
            </FilterGroup>
          )}

          {showHostelTypeFilters && (
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
                  ...hostelTypeOptions.map((option): [string, string] => [
                    option.value,
                    option.label,
                  ]),
                ]}
              />
            </FilterGroup>
          )}
        </div>
      )}

      {showSizeFilters && (
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
                ...sizeUnitOptions.map((option): [string, string] => [
                  option.value,
                  option.label,
                ]),
              ]}
            />
          </div>
          {sizeRangeHasError && (
            <p className="mt-2 text-xs text-red-600">
              Min size cannot be higher than max size.
            </p>
          )}
        </FilterGroup>
      )}

      {(showParkingFilters || showFamilyFriendlyFilters) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {showParkingFilters && (
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
          )}

          {showFamilyFriendlyFilters && (
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
          )}
        </div>
      )}

      {showAmenitiesFilters && (
        <FilterGroup title="Amenities">
          <div className="flex flex-wrap gap-2">
            {amenityFilterOptions.map((item) => {
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
      )}

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
            className="object-cover opacity-28 [object-position:center_43%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,23,168,0.60)_0%,rgba(0,49,180,0.45)_44%,rgba(0,151,139,0.40)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#00226f]/45 to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[480px] max-w-[1500px] flex-col items-center px-4 pb-10 pt-10 text-center sm:px-6 md:min-h-[540px] lg:min-h-[560px] lg:px-8 lg:pb-12 lg:pt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase text-white shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Find Your Angan
          </span>

          <h1 className="mt-5 max-w-4xl text-[2.35rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-[3.25rem] lg:text-[4.25rem]">
            Find your <span className="text-[#34D399]">Angan</span>
            <span className="block">in {heroLocation}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm font-normal leading-6 text-white/82 sm:text-[18px]">
            Browse trusted rental listings by area, budget, property type, and
            lifestyle needs.
          </p>
          <div className="mt-7 hidden w-full max-w-5xl items-center justify-center gap-7 text-left md:flex">
            {HERO_TRUST_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex min-w-0 items-center gap-2.5 text-white"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-emerald-300 backdrop-blur-sm">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-[14px] font-semibold leading-4 text-white">
                      {item.title}
                    </span>

                    <span className="mt-0.5 block max-w-[120px] text-[10px] font-normal leading-3 text-white/70">
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div
        ref={stickyFilterSentinelRef}
        data-public-sticky-filter-sentinel="true"
        aria-hidden="true"
        className="-mt-32 h-px"
      />

      <section
        data-stuck={filtersStuck ? "true" : "false"}
        className={`public-sticky-filter-bar has-sticky-filters sticky top-0 z-40 transform-gpu px-4 transition-[transform,box-shadow,background-color] duration-300 ease-out will-change-transform sm:px-6 lg:px-8 ${
          filtersStuck
            ? "border-b border-[var(--admin-border)] bg-white/95 py-3 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.45)]"
            : "border-b border-transparent bg-transparent pb-0 pt-0 shadow-none"
        }`}
        style={{
          transform: filtersStuck
            ? "translate3d(0, var(--public-sticky-filter-offset, var(--public-header-height, 74px)), 0)"
            : "translate3d(0, 0, 0)",
        }}
      >
        <div className="mx-auto w-full min-w-0 md:max-w-[1500px] md:px-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyPrimarySearch();
            }}
            className={`hidden min-w-0 overflow-visible rounded-[1.35rem] border bg-white p-2.5 md:block ${
              filtersStuck
                ? "border-[var(--admin-border)] shadow-sm"
                : "mx-auto max-w-[1040px] border-white/80 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]"
            }`}
          >
            <div className={`relative ${stickyFilterRowClass}`}>
              <label
                className={`min-h-12 shrink-0 transform-gpu transition-[opacity,transform] duration-300 ease-out ${
                  showStickyCategorySelector
                    ? "relative col-span-1 min-w-0 translate-y-0 scale-100 opacity-100 xl:col-span-1"
                    : "pointer-events-none absolute left-0 top-0 w-[190px] -translate-y-1 scale-95 opacity-0"
                }`}
                aria-hidden={!showStickyCategorySelector}
              >
                <span className="sr-only">Property category</span>

                <select
                  value={displayFilters.category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value as PropertyCategory)
                  }
                  disabled={!showStickyCategorySelector}
                  tabIndex={showStickyCategorySelector ? undefined : -1}
                  className="h-12 w-full appearance-none rounded-2xl border border-[var(--admin-border)] bg-white px-3 pr-8 text-sm font-semibold text-[var(--admin-text)] shadow-sm outline-none transition hover:border-[var(--admin-primary)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10 sm:px-4 sm:pr-10"
                >
                  {CATEGORY_TABS.map((tab) => (
                    <option key={tab.value} value={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              </label>

              <label
                className={`flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface,#fff)] px-4 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10 ${
                  locationFieldClass
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />

                <span className="hidden shrink-0 border-r border-[var(--admin-border)] pr-3 text-sm font-semibold text-[var(--admin-text)] sm:inline-flex">
                  Islamabad
                </span>

                <input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Sector, area, or landmark"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
              </label>

              <div className="relative min-w-0">
                <div
                  className={`${priceFieldClass} ${priceRangeContainerClass}`}
                >
                  <input
                    value={minRentInput}
                    onChange={(event) => setMinRentInput(event.target.value)}
                    inputMode="numeric"
                    type="number"
                    min={0}
                    placeholder="Min price"
                    aria-invalid={rentRangeHasError}
                    aria-describedby={
                      rentRangeHasError
                        ? "desktop-price-range-error"
                        : undefined
                    }
                    className={`min-w-0 bg-transparent px-4 text-sm outline-none ${priceRangeInputClass}`}
                  />

                  <input
                    value={maxRentInput}
                    onChange={(event) => setMaxRentInput(event.target.value)}
                    inputMode="numeric"
                    type="number"
                    min={0}
                    placeholder="Max price"
                    aria-invalid={rentRangeHasError}
                    aria-describedby={
                      rentRangeHasError
                        ? "desktop-price-range-error"
                        : undefined
                    }
                    className={`min-w-0 border-l bg-transparent px-4 text-sm outline-none ${
                      rentRangeHasError
                        ? "border-red-300 text-red-700 placeholder:text-red-400"
                        : "border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]"
                    }`}
                  />
                </div>

                {rentRangeHasError && (
                  <div
                    id="desktop-price-range-error"
                    className="pointer-events-none absolute left-3 top-[calc(100%+6px)] z-50 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-[0_12px_28px_-18px_rgba(220,38,38,0.75)]"
                  >
                    {/* <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> */}
                    <span>{priceRangeErrorMessage}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-3 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary)] sm:px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="submit"
                disabled={rentRangeHasError}
                className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 sm:px-6"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            <div className={`relative ${compactPriceRowClass}`}>
              <input
                value={minRentInput}
                onChange={(event) => setMinRentInput(event.target.value)}
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Min price"
                aria-invalid={rentRangeHasError}
                aria-describedby={
                  rentRangeHasError ? "compact-price-range-error" : undefined
                }
                className={`min-h-11 min-w-0 rounded-2xl border bg-white px-4 text-sm outline-none ${
                  rentRangeHasError
                    ? "border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10"
                }`}
              />

              <input
                value={maxRentInput}
                onChange={(event) => setMaxRentInput(event.target.value)}
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Max price"
                aria-invalid={rentRangeHasError}
                aria-describedby={
                  rentRangeHasError ? "compact-price-range-error" : undefined
                }
                className={`min-h-11 min-w-0 rounded-2xl border bg-white px-4 text-sm outline-none ${
                  rentRangeHasError
                    ? "border-red-500 text-red-700 placeholder:text-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10"
                }`}
              />
            </div>

            {rentRangeHasError && (
              <div
                id="compact-price-range-error"
                className="pointer-events-none absolute left-3 top-[calc(100%+6px)] z-50 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-[0_12px_28px_-18px_rgba(220,38,38,0.75)] xl:hidden"
              >
                {/* <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> */}
                <span>{priceRangeErrorMessage}</span>
              </div>
            )}

            <div
              className={`mt-3 gap-2 pb-1 lg:hidden ${
                showStickyCategorySelector ? "hidden" : "flex flex-wrap"
              }`}
            >
              {CATEGORY_TABS.map((tab) => {
                const active = displayFilters.category === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleCategoryChange(tab.value)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      active
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-sm"
                        : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </form>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 text-sm font-semibold text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary)] md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-primary)] px-1.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeChips.length > 0 && (
            <div
              className={`mt-3 flex items-center gap-2 overflow-x-auto pb-1 transition-[opacity,transform] duration-200 ease-out md:flex-wrap md:overflow-visible ${
                filtersStuck ? "" : "mx-auto max-w-[1040px]"
              }`}
            >
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}

              <button
                type="button"
                onClick={handleResetFilters}
                className="shrink-0 rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {!filtersStuck && (
        <div
          aria-hidden="true"
          className={activeChips.length > 0 ? "h-8" : "h-12"}
        />
      )}

      {filtersOpen && (
        <div
          className={`fixed inset-0 z-[1000] flex min-h-dvh items-stretch justify-center overflow-hidden bg-slate-950/80 px-0 transition-opacity duration-300 ease-out sm:px-4 ${
            filtersOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="More filters"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div
            className={`relative z-10 flex h-dvh w-full flex-col overflow-hidden bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.8)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:my-6 sm:h-[calc(100dvh-3rem)] sm:max-w-3xl sm:rounded-[1.75rem] ${
              filtersOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-95 opacity-0"
            }`}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-white px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                  More filters
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  Refine listings without leaving the search page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-background)] text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <div className="mb-5 space-y-5 md:hidden">
                <FilterGroup title="Location">
                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface,#fff)] px-3 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                    <input
                      value={locationInput}
                      onChange={(event) => setLocationInput(event.target.value)}
                      placeholder="Sector, area, or landmark"
                      className="min-w-0 flex-1 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                    />
                  </label>
                </FilterGroup>
              </div>

              {advancedPanel}
            </div>

            <div className="grid shrink-0 gap-3 border-t border-[var(--admin-border)] bg-white px-5 py-4 sm:grid-cols-[1fr_1fr]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-12 rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                Reset Filters
              </button>

              <button
                type="button"
                onClick={applyAdvancedFilters}
                disabled={rentRangeHasError || sizeRangeHasError}
                className="min-h-12 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
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
