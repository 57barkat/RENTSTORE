import { AmenityItem } from "@/types/Aminities.types";

export const AMENITIES_DATA = [
  {
    title: "Living Spaces & Layout",
    items: [
      {
        key: "drawing_dining",
        label: "Drawing & Dining",
        iconName: "sofa-single",
      },
      { key: "tv_lounge", label: "TV Lounge", iconName: "television-classic" },
      { key: "kitchen", label: "Kitchen", iconName: "countertop" },
      {
        key: "laundry_area",
        label: "Laundry Area",
        iconName: "washing-machine",
      },
      {
        key: "car_parking_outside",
        label: "Car Parking (Outside)",
        iconName: "car-outline",
      },
      {
        key: "mumty_store",
        label: "Mumty / Store Room",
        iconName: "home-storage",
      },
    ] as AmenityItem[],
  },
  {
    title: "Core Utilities & Essentials",
    items: [
      {
        key: "water_bore",
        label: "Water Bore / Boring",
        iconName: "water-pump",
      },
      {
        key: "gas_separate",
        label: "Separate Gas Meter",
        iconName: "gas-cylinder",
      },
      {
        key: "elec_separate",
        label: "Separate Electricity Meter",
        iconName: "meter-electric",
      },
      {
        key: "ups_wiring",
        label: "UPS / Inverter Wiring",
        iconName: "battery-charging",
      },
      { key: "solar_panels", label: "Solar System", iconName: "solar-panel" },
      { key: "generator", label: "Backup Generator", iconName: "engine" },
      {
        key: "security_guard",
        label: "Security Guard / Chowkidar",
        iconName: "shield-account",
      },
      { key: "cctv", label: "CCTV Surveillance", iconName: "video-security" },
    ] as AmenityItem[],
  },
  {
    title: "Hostel & Apartment Specifics",
    items: [
      {
        key: "mess",
        label: "Mess / Food Service",
        iconName: "silverware-fork-knife",
      },
      { key: "laundry", label: "Laundry Service", iconName: "washing-machine" },
      {
        key: "filtered_water",
        label: "Filtered Drinking Water",
        iconName: "water-filter",
      },
      { key: "gym", label: "Gym Access", iconName: "dumbbell" },
      { key: "lift", label: "Elevator / Lift", iconName: "elevator" },
      {
        key: "boundary_wall",
        label: "Gated / Boundary Wall",
        iconName: "wall",
      },
    ] as AmenityItem[],
  },
  {
    title: "Common Favorites",
    items: [
      { key: "wifi", label: "High-Speed WiFi", iconName: "wifi" },
      { key: "ac", label: "Air Conditioning", iconName: "air-conditioner" },
      { key: "workspace", label: "Study Desk / Workspace", iconName: "desk" },
      { key: "parking", label: "Car/Bike Parking", iconName: "car" },
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
  key: string,
): Set<string> => {
  const newSet = new Set(selected);
  if (newSet.has(key)) newSet.delete(key);
  else newSet.add(key);
  return newSet;
};

export const isNextDisabled = (selected: Set<string>): boolean =>
  selected.size === 0;
