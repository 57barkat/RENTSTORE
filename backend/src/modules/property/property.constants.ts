export const PROPERTY_HOST_OPTIONS = [
  "home",
  "apartment",
  "hostel",
  "shop",
  "office",
] as const;

export type PropertyHostOption = (typeof PROPERTY_HOST_OPTIONS)[number];

export const APARTMENT_TYPES = [
  "studio",
  "1BHK",
  "2BHK",
  "3BHK",
  "penthouse",
] as const;

export const FURNISHING_TYPES = [
  "furnished",
  "semi-furnished",
  "unfurnished",
] as const;

export const HOSTEL_TYPES = ["male", "female", "mixed"] as const;

export const PROPERTY_SIZE_UNITS = [
  "Marla",
  "Kanal",
  "Sq. Ft.",
  "Sq. Yd.",
] as const;
