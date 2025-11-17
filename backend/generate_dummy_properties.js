const fs = require("fs");
const { ObjectId } = require("bson");

// --- Constants ---
const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
];
const AREAS = {
  Lahore: ["DHA Phase 5", "Gulberg 3", "Johar Town", "Bahria Town"],
  Karachi: [
    "Clifton Block 2",
    "PECHS Society",
    "DHA Karachi Phase 6",
    "North Nazimabad",
  ],
  Islamabad: ["F-6 Sector", "F-7 Sector", "G-9 Sector", "E-11 Sector"],
  Rawalpindi: ["Satellite Town", "Bahria Town", "Askari 14", "Saddar"],
  Peshawar: ["Hayatabad Phase 4", "University Road", "Palosi"],
  Quetta: ["Cantonment Area", "Airport Road"],
};

const CITY_COORDS = {
  Lahore: { lat: [31.45, 31.60], lng: [74.20, 74.40] },
  Karachi: { lat: [24.80, 25.10], lng: [66.90, 67.20] },
  Islamabad: { lat: [33.65, 33.75], lng: [72.95, 73.10] },
  Rawalpindi: { lat: [33.55, 33.65], lng: [72.95, 73.10] },
  Peshawar: { lat: [34.00, 34.05], lng: [71.45, 71.60] },
  Quetta: { lat: [30.20, 30.30], lng: [67.00, 67.05] },
};

const HOST_OPTIONS = ["home", "room", "entire_place"];
const AMENITIES = [
  "wifi",
  "tv",
  "washer",
  "kitchen",
  "pool",
  "heating",
  "ac",
  "workspace",
];
const BILLS = ["gas", "water", "electricity", "internet", "maintenance"];
const HIGHLIGHTS = [
  "family_friendly",
  "peaceful",
  "central_location",
  "newly_renovated",
  "pet_friendly",
];
const SAFETY_DETAILS = [
  "smoke_alarm",
  "first_aid_kit",
  "exterior_camera",
  "fire_extinguisher",
  "weapons",
  "noise_monitor",
];
const CLOUDINARY_PHOTOS = [
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/dghcwhzx6ybbwduvtadb.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/kkhwil8tm35deyqyasgr.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/gp8e4bkoz5rvfikulfek.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/rd8urpckgtidczr1crgd.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/synzyaj62qiqgfz35zrl.jpg",
];
const APARTMENT_TYPES = ["studio", "1BHK", "2BHK", "penthouse"];
const FURNISHINGS = ["furnished", "semi-furnished", "unfurnished"];
const HOSTEL_TYPES = ["boys", "girls", "co-ed"];
const MEAL_PLANS = ["breakfast", "lunch", "dinner"];
const RULES = ["no_smoking", "no_pets", "quiet_hours", "no_party"];

// --- Helpers ---
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubarray = (arr, min = 0, max = arr.length) =>
  arr.sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));

// --- Main Generator ---
function generateDummyProperties(count = 30000) {
  const properties = [];
  const baseOwnerId = new ObjectId().toHexString();

  for (let i = 0; i < count; i++) {
    const city = randomChoice(CITIES);
    const area = randomChoice(AREAS[city]);
    const hostOption = randomChoice(HOST_OPTIONS);

    const bedrooms = randomInt(1, hostOption === "room" ? 1 : 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const Persons = beds + 1;

    const monthlyRent = randomInt(500, 500000);
    const dailyRent = Math.round(monthlyRent / 30);
    const weeklyRent = Math.round(monthlyRent / 4);
    const SecuritybasePrice = monthlyRent * 1.5;

    // Address
    const address = [
      {
        street: `Plot No. ${randomInt(1, 500)}`,
        city,
        stateTerritory: "Punjab",
        country: "PAKISTAN",
        zipCode: `${randomInt(40000, 60000)}`,
        aptSuiteUnit:
          hostOption === "room"
            ? `Room ${randomInt(1, 4)}`
            : `Unit ${randomInt(1, 20)}`,
      },
    ];

    // Coordinates
    const cityRange = CITY_COORDS[city];
    const lat = Math.random() * (cityRange.lat[1] - cityRange.lat[0]) + cityRange.lat[0];
    const lng = Math.random() * (cityRange.lng[1] - cityRange.lng[0]) + cityRange.lng[0];

    const photos =
      Math.random() < 0.2
        ? []
        : randomSubarray(CLOUDINARY_PHOTOS, 1, CLOUDINARY_PHOTOS.length);
    const amenities = randomSubarray(AMENITIES, 2, 7);
    const ALL_BILLS = randomSubarray(BILLS, 0, 4);
    const highlighted = randomSubarray(HIGHLIGHTS, 1, 3);
    const safetyDetails = randomSubarray(SAFETY_DETAILS, 0, 4);
    const cameraDescription =
      safetyDetails.includes("exterior_camera") ||
      safetyDetails.includes("noise_monitor")
        ? randomChoice([
            "Visible exterior camera above main entrance.",
            "Ring doorbell camera is active.",
            "Noise monitoring in shared areas.",
          ])
        : undefined;

    // Apartment-specific
    const apartmentType = hostOption === "entire_place" ? randomChoice(APARTMENT_TYPES) : undefined;
    const furnishing = hostOption === "entire_place" ? randomChoice(FURNISHINGS) : undefined;
    const parking = hostOption === "entire_place" ? Math.random() > 0.5 : undefined;

    // Hostel-specific
    const hostelType = hostOption === "room" ? randomChoice(HOSTEL_TYPES) : undefined;
    const mealPlan = hostOption === "room" ? randomSubarray(MEAL_PLANS, 1, 3) : undefined;
    const rules = hostOption === "room" ? randomSubarray(RULES, 1, 3) : undefined;

    properties.push({
      _id: new ObjectId().toHexString(),
      ownerId: baseOwnerId,
      title: `${bedrooms} Bed ${
        hostOption === "home"
          ? "House"
          : hostOption === "room"
          ? "Room"
          : "Apartment"
      } in ${area}`,
      hostOption,
      location: `${area}, ${city}`,
      lat,
      lng,
      monthlyRent,
      dailyRent,
      weeklyRent,
      SecuritybasePrice,
      ALL_BILLS,
      address,
      amenities,
      capacityState: { Persons, bedrooms, beds, bathrooms },
      description: { highlighted },
      safetyDetailsData: { safetyDetails, cameraDescription },
      photos,
      apartmentType,
      furnishing,
      parking,
      hostelType,
      mealPlan,
      rules,
      status: Math.random() > 0.2, // 80% active
    });
  }

  return properties;
}

// --- Execution ---
const PROPERTY_COUNT = 30000;
const properties = generateDummyProperties(PROPERTY_COUNT);

fs.writeFileSync(
  "dummy_properties_dto.json",
  JSON.stringify({ data: properties, total: properties.length }, null, 2)
);

console.log(`Generated ${PROPERTY_COUNT} properties with full CreatePropertyDto fields.`);
