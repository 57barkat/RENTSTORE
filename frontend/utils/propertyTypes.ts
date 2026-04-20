export const PROPERTY_HOST_OPTIONS = [
  "home",
  "apartment",
  "hostel",
  "shop",
  "office",
] as const;

export type PropertyHostOption = (typeof PROPERTY_HOST_OPTIONS)[number];

export const PROPERTY_HOST_OPTION_LABELS: Record<PropertyHostOption, string> = {
  home: "Home",
  apartment: "Apartment",
  hostel: "Hostel",
  shop: "Shop",
  office: "Office",
};

export const PROPERTY_HOST_OPTIONS_CONFIG: Array<{
  title: string;
  value: PropertyHostOption;
  icon: string;
}> = [
  { title: "Home", value: "home", icon: "home-city-outline" },
  {
    title: "Apartment",
    value: "apartment",
    icon: "office-building-outline",
  },
  { title: "Hostel", value: "hostel", icon: "bed-empty" },
  { title: "Shop", value: "shop", icon: "storefront-outline" },
  { title: "Office", value: "office", icon: "briefcase-outline" },
];

export const PROPERTY_UPLOAD_TOTAL_STEPS = 11;

export const getPropertyTypeLabel = (value?: string | null) => {
  if (!value) {
    return "property";
  }

  if (value in PROPERTY_HOST_OPTION_LABELS) {
    return PROPERTY_HOST_OPTION_LABELS[value as PropertyHostOption];
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const isCommercialProperty = (value?: string | null) =>
  value === "shop" || value === "office";

export const getPropertyLayoutLabels = (value?: string | null) => {
  if (value === "shop") {
    return {
      title: "Share the basic layout of your shop",
      subtitle:
        "Add the core space details renters need before they decide to enquire.",
      roomLabel: "Rooms / sections",
      sizeLabel: "Shop Size",
    };
  }

  if (value === "office") {
    return {
      title: "Share the basic layout of your office",
      subtitle:
        "Add the core workspace details so teams understand the setup clearly.",
      roomLabel: "Private rooms",
      sizeLabel: "Office Size",
    };
  }

  return {
    title: "Share the basic layout of your home",
    subtitle: "Just the structural details for now. No furniture needed.",
    roomLabel: "Bedrooms",
    sizeLabel: "Property Size",
  };
};

export const buildDisabledReason = (messages: Array<string | undefined>) => {
  return messages.find(Boolean);
};
