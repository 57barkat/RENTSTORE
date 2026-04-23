import type { PropertyCategory } from "@/app/lib/property-types";

export interface AdminUserOption {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

export interface AdminPropertyAddress {
  aptSuiteUnit: string;
  street: string;
  city: string;
  stateTerritory: string;
  country: string;
  zipCode: string;
}

export interface AdminPropertyUploadForm {
  ownerId: string;
  propertyType: PropertyCategory;
  hostOption: PropertyCategory;
  title: string;
  location: string;
  area: string;
  lat: string;
  lng: string;
  address: AdminPropertyAddress[];
  capacityState: {
    Persons?: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    floorLevel?: number;
  };
  amenities: string[];
  photos: string[];
  monthlyRent: string;
  dailyRent: string;
  weeklyRent: string;
  SecuritybasePrice: string;
  ALL_BILLS: string[];
  safetyDetailsData: {
    safetyDetails: string[];
    cameraDescription: string;
  };
  description: {
    highlighted: string[];
  };
  size: {
    value: string;
    unit: string;
  };
  apartmentType: string;
  furnishing: string;
  parking: boolean;
  hostelType: string;
  mealPlan: string[];
  rules: string[];
}

export type AdminPropertyFieldErrors = Record<string, string>;

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME ||
  "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_UPLOAD_PRESET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  "";

const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : "";

export const PROPERTY_HOST_OPTIONS: PropertyCategory[] = [
  "home",
  "apartment",
  "hostel",
  "shop",
  "office",
];

export const APARTMENT_TYPES = [
  "studio",
  "1BHK",
  "2BHK",
  "3BHK",
  "penthouse",
];

export const FURNISHING_TYPES = [
  "furnished",
  "semi-furnished",
  "unfurnished",
];

export const HOSTEL_TYPES = ["male", "female", "mixed"];

export const PROPERTY_SIZE_UNITS = ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."];

export const BILL_OPTIONS = ["electricity", "water", "gas"];

export const SAFETY_DETAILS = [
  { key: "exterior_camera", label: "Exterior security camera present" },
  { key: "noise_monitor", label: "Noise decibel monitor present" },
  { key: "weapons", label: "Weapon(s) on the property" },
];

export const HIGHLIGHT_OPTIONS = [
  { key: "peaceful", label: "Peaceful" },
  { key: "unique", label: "Unique" },
  { key: "family_friendly", label: "Family-friendly" },
  { key: "stylish", label: "Stylish" },
  { key: "central", label: "Central" },
  { key: "spacious", label: "Spacious" },
];

export const MEAL_PLAN_OPTIONS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

export const RULE_OPTIONS = [
  { key: "No smoking", label: "No smoking" },
  { key: "No loud music after 10 PM", label: "No loud music after 10 PM" },
  { key: "Visitors not allowed", label: "Visitors not allowed" },
  { key: "Keep rooms clean", label: "Keep rooms clean" },
  { key: "Respect others' privacy", label: "Respect others' privacy" },
];

export const AMENITY_OPTIONS = [
  { key: "drawing_dining", label: "Drawing & Dining" },
  { key: "tv_lounge", label: "TV Lounge" },
  { key: "kitchen", label: "Kitchen" },
  { key: "laundry_area", label: "Laundry Area" },
  { key: "car_parking_outside", label: "Car Parking (Outside)" },
  { key: "mumty_store", label: "Mumty / Store Room" },
  { key: "water_bore", label: "Water Bore / Boring" },
  { key: "gas_separate", label: "Separate Gas Meter" },
  { key: "elec_separate", label: "Separate Electricity Meter" },
  { key: "ups_wiring", label: "UPS / Inverter Wiring" },
  { key: "solar_panels", label: "Solar System" },
  { key: "generator", label: "Backup Generator" },
  { key: "security_guard", label: "Security Guard / Chowkidar" },
  { key: "cctv", label: "CCTV Surveillance" },
  { key: "mess", label: "Mess / Food Service" },
  { key: "laundry", label: "Laundry Service" },
  { key: "filtered_water", label: "Filtered Drinking Water" },
  { key: "gym", label: "Gym Access" },
  { key: "lift", label: "Elevator / Lift" },
  { key: "boundary_wall", label: "Gated / Boundary Wall" },
  { key: "wifi", label: "High-Speed WiFi" },
  { key: "ac", label: "Air Conditioning" },
  { key: "workspace", label: "Study Desk / Workspace" },
  { key: "parking", label: "Car/Bike Parking" },
];

export const createEmptyPropertyUploadForm = (): AdminPropertyUploadForm => ({
  ownerId: "",
  propertyType: "home",
  hostOption: "home",
  title: "",
  location: "",
  area: "",
  lat: "",
  lng: "",
  address: [
    {
      aptSuiteUnit: "",
      street: "",
      city: "",
      stateTerritory: "",
      country: "PAKISTAN",
      zipCode: "",
    },
  ],
  capacityState: {
    Persons: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    floorLevel: 0,
  },
  amenities: [],
  photos: [],
  monthlyRent: "",
  dailyRent: "",
  weeklyRent: "",
  SecuritybasePrice: "",
  ALL_BILLS: [],
  safetyDetailsData: {
    safetyDetails: [],
    cameraDescription: "",
  },
  description: {
    highlighted: [],
  },
  size: {
    value: "",
    unit: "Marla",
  },
  apartmentType: "1BHK",
  furnishing: "unfurnished",
  parking: false,
  hostelType: "male",
  mealPlan: [],
  rules: [],
});

const dedupeStrings = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
};

export const normalizeDelimitedInput = (value: string) =>
  dedupeStrings(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

const toNumber = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const hasPositiveNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const hasNonNegativeNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export const validateAdminPropertyForm = (
  form: AdminPropertyUploadForm,
  options?: { photoCount?: number },
): AdminPropertyFieldErrors => {
  const errors: AdminPropertyFieldErrors = {};
  const firstAddress = form.address[0];
  const lat = toNumber(form.lat);
  const lng = toNumber(form.lng);
  const monthlyRent = toNumber(form.monthlyRent);
  const dailyRent = toNumber(form.dailyRent);
  const weeklyRent = toNumber(form.weeklyRent);
  const securityDeposit = toNumber(form.SecuritybasePrice);
  const sizeValue = toNumber(form.size.value);

  if (!form.ownerId) {
    errors.ownerId = "Select the user who should own this listing.";
  }

  if (!form.title.trim()) {
    errors.title = "Listing title is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!hasPositiveNumber(lat) || !hasPositiveNumber(lng)) {
    errors.coordinates = "Valid latitude and longitude are required.";
  }

  if (!firstAddress?.street.trim()) {
    errors.street = "Street address is required.";
  }

  if (!firstAddress?.city.trim()) {
    errors.city = "City is required.";
  }

  if (!firstAddress?.stateTerritory.trim()) {
    errors.stateTerritory = "State / territory is required.";
  }

  if (!/^\d{5}$/.test(firstAddress?.zipCode?.trim() || "")) {
    errors.zipCode = "ZIP code must be 5 digits.";
  }

  const totalPhotoCount = options?.photoCount ?? form.photos.length;

  if (totalPhotoCount === 0) {
    errors.photos = "Upload at least one property photo.";
  }

  if (form.amenities.length === 0) {
    errors.amenities = "Select at least one amenity.";
  }

  if (form.description.highlighted.length === 0) {
    errors.highlights = "Select at least one listing highlight.";
  }

  if (
    !hasPositiveNumber(dailyRent) &&
    !hasPositiveNumber(weeklyRent) &&
    !hasPositiveNumber(monthlyRent)
  ) {
    errors.pricing = "Provide at least one valid rent.";
  }

  if (!hasNonNegativeNumber(securityDeposit)) {
    errors.SecuritybasePrice = "Security deposit is required.";
  }

  if (form.safetyDetailsData.safetyDetails.length === 0) {
    errors.safetyDetails = "Select at least one safety detail.";
  }

  if (
    form.safetyDetailsData.safetyDetails.includes("exterior_camera") &&
    !form.safetyDetailsData.cameraDescription.trim()
  ) {
    errors.cameraDescription = "Describe the exterior camera coverage.";
  }

  if (form.hostOption === "hostel") {
    if (!form.hostelType) {
      errors.hostelType = "Hostel type is required.";
    }

    if (form.mealPlan.length === 0) {
      errors.mealPlan = "Select at least one meal plan.";
    }

    if (form.rules.length === 0) {
      errors.rules = "Select at least one hostel rule.";
    }

    if (!hasPositiveNumber(form.capacityState.Persons)) {
      errors.capacityPersons = "Guest capacity must be at least 1.";
    }

    if (!hasPositiveNumber(form.capacityState.beds)) {
      errors.capacityBeds = "Bed count must be at least 1.";
    }
  }

  if (form.hostOption === "apartment") {
    if (!form.apartmentType) {
      errors.apartmentType = "Apartment type is required.";
    }

    if (!form.furnishing) {
      errors.furnishing = "Furnishing status is required.";
    }

    if (!hasPositiveNumber(form.capacityState.bedrooms)) {
      errors.capacityBedrooms = "Bedroom count must be at least 1.";
    }

    if (!hasPositiveNumber(form.capacityState.bathrooms)) {
      errors.capacityBathrooms = "Bathroom count must be at least 1.";
    }
  }

  if (
    form.hostOption === "home" ||
    form.hostOption === "shop" ||
    form.hostOption === "office"
  ) {
    if (!hasPositiveNumber(sizeValue)) {
      errors.sizeValue = "Property size must be greater than 0.";
    }

    if (!form.size.unit.trim()) {
      errors.sizeUnit = "Property size unit is required.";
    }

    if (!hasPositiveNumber(form.capacityState.bedrooms)) {
      errors.capacityBedrooms =
        form.hostOption === "home"
          ? "Bedroom count must be at least 1."
          : "Room count must be at least 1.";
    }

    if (!hasPositiveNumber(form.capacityState.bathrooms)) {
      errors.capacityBathrooms = "Bathroom count must be at least 1.";
    }
  }

  return errors;
};

export const buildAdminPropertyPayload = (form: AdminPropertyUploadForm) => {
  const payload: Record<string, unknown> = {
    ownerId: form.ownerId,
    propertyType: form.hostOption,
    hostOption: form.hostOption,
    title: form.title.trim(),
    location: form.location.trim(),
    area: form.area.trim(),
    lat: toNumber(form.lat),
    lng: toNumber(form.lng),
    address: form.address.map((entry) => ({
      aptSuiteUnit: entry.aptSuiteUnit.trim(),
      street: entry.street.trim(),
      city: entry.city.trim(),
      stateTerritory: entry.stateTerritory.trim(),
      country: entry.country.trim() || "PAKISTAN",
      zipCode: entry.zipCode.trim(),
    })),
    capacityState: {
      Persons: form.capacityState.Persons,
      bedrooms: form.capacityState.bedrooms,
      beds: form.capacityState.beds,
      bathrooms: form.capacityState.bathrooms,
      floorLevel: form.capacityState.floorLevel,
    },
    amenities: dedupeStrings(form.amenities),
    photos: form.photos,
    monthlyRent: toNumber(form.monthlyRent),
    dailyRent: toNumber(form.dailyRent),
    weeklyRent: toNumber(form.weeklyRent),
    SecuritybasePrice: toNumber(form.SecuritybasePrice),
    ALL_BILLS: dedupeStrings(form.ALL_BILLS),
    safetyDetailsData: {
      safetyDetails: dedupeStrings(form.safetyDetailsData.safetyDetails),
      cameraDescription: form.safetyDetailsData.cameraDescription.trim() || null,
    },
    description: {
      highlighted: dedupeStrings(form.description.highlighted),
    },
    status: true,
  };

  if (form.hostOption === "apartment") {
    payload.apartmentType = form.apartmentType;
    payload.furnishing = form.furnishing;
    payload.parking = form.parking;
  }

  if (form.hostOption === "hostel") {
    payload.hostelType = form.hostelType;
    payload.mealPlan = dedupeStrings(form.mealPlan);
    payload.rules = dedupeStrings(form.rules);
  }

  if (
    form.hostOption === "home" ||
    form.hostOption === "shop" ||
    form.hostOption === "office"
  ) {
    payload.size = {
      value: toNumber(form.size.value),
      unit: form.size.unit,
    };
  }

  return payload;
};

export const uploadImagesToCloudinary = async (files: File[]) => {
  if (!files.length) {
    return [];
  }

  if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured for the admin app. Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_UPLOAD_PRESET.",
    );
  }

  const uploads = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const rawError = await response.text();
      throw new Error(
        `Cloudinary upload failed (${response.status}): ${rawError || "Unknown error"}`,
      );
    }

    const result = (await response.json()) as { secure_url?: string };
    if (!result.secure_url) {
      throw new Error("Cloudinary upload completed without a secure_url.");
    }

    return result.secure_url;
  });

  return Promise.all(uploads);
};
