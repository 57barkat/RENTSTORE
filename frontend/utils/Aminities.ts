import { AmenityItem } from "@/types/Aminities.types";

export const AMENITIES_DATA = [
  {
    title: "What about these guest favorites?",
    items: [
      { key: "wifi", label: "WiFi", iconName: "wifi" },
      { key: "tv", label: "TV", iconName: "television" },
      { key: "kitchen", label: "Kitchen", iconName: "silverware-fork-knife" },
      { key: "washer", label: "Washer", iconName: "washing-machine" },
      {
        key: "free_parking",
        label: "Free parking on premises",
        iconName: "car-brake-parking",
      },
      {
        key: "paid_parking",
        label: "Paid parking on premises",
        iconName: "parking",
      },
      { key: "ac", label: "Air conditioning", iconName: "air-conditioner" },
      { key: "workspace", label: "Dedicated workspace", iconName: "desk-case" },
    ] as AmenityItem[],
  },
  {
    title: "Do you have any standout amenities?",
    items: [
      { key: "pool", label: "Pool", iconName: "pool" },
      { key: "hot_tub", label: "Hot tub", iconName: "bathtub" },
      { key: "patio", label: "Patio", iconName: "table-furniture" },
      { key: "bbq", label: "BBQ grill", iconName: "grill" },
      {
        key: "outdoor_dining",
        label: "Outdoor dining area",
        iconName: "table-chair",
      },
      { key: "fire_pit", label: "Fire pit", iconName: "fire-pit" },
      { key: "pool_table", label: "Pool table", iconName: "pool-cue" },
      { key: "fireplace", label: "Indoor fireplace", iconName: "fireplace" },
      { key: "piano", label: "Piano", iconName: "piano" },
      { key: "exercise", label: "Exercise equipment", iconName: "dumbbell" },
      { key: "lake_access", label: "Lake access", iconName: "boat" },
      { key: "beach_access", label: "Beach access", iconName: "beach" },
      { key: "ski_in_out", label: "Ski-in/Ski-out", iconName: "ski" },
      {
        key: "outdoor_shower",
        label: "Outdoor shower",
        iconName: "shower-head",
      },
    ] as AmenityItem[],
  },
  {
    title: "Do you have any of these safety items?",
    items: [
      { key: "smoke_alarm", label: "Smoke alarm", iconName: "fire-alert" },
      { key: "first_aid", label: "First aid kit", iconName: "medical-bag" },
      {
        key: "fire_extinguisher",
        label: "Fire extinguisher",
        iconName: "fire-extinguisher",
      },
      {
        key: "co_alarm",
        label: "Carbon monoxide alarm",
        iconName: "molecule-co",
      },
    ] as AmenityItem[],
  },
];
export const getAmenityLabel = (key: string): string => {
  for (const section of AMENITIES_DATA) {
    const found = section.items.find((item) => item.key === key);
    if (found) return found.label;
  }
  return key;
};

export const toggleAmenity = (
  selected: Set<string>,
  key: string
): Set<string> => {
  const newSet = new Set(selected);
  if (newSet.has(key)) newSet.delete(key);
  else newSet.add(key);
  return newSet;
};

export const isNextDisabled = (selected: Set<string>): boolean =>
  selected.size === 0;
