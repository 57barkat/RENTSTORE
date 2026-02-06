const fs = require("fs");
const path = require("path");
const { ObjectId } = require("bson");

// -------------------- Constants --------------------
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
  Lahore: { lat: [31.45, 31.6], lng: [74.2, 74.4] },
  Karachi: { lat: [24.8, 25.1], lng: [66.9, 67.2] },
  Islamabad: { lat: [33.65, 33.75], lng: [72.95, 73.1] },
  Rawalpindi: { lat: [33.55, 33.65], lng: [72.95, 73.1] },
  Peshawar: { lat: [34.0, 34.05], lng: [71.45, 71.6] },
  Quetta: { lat: [30.2, 30.3], lng: [67.0, 67.05] },
};

const HOST_OPTIONS = ["home", "apartment", "hostel"];
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
const CLOUDINARY_PHOTOS = Array.from(
  { length: 20 },
  (_, i) => `https://picsum.photos/300/200?random=${i + 1}`,
);
const APARTMENT_TYPES = ["studio", "1BHK", "2BHK", "penthouse"];
const FURNISHINGS = ["furnished", "semi-furnished", "unfurnished"];
const HOSTEL_TYPES = ["boys", "girls", "co-ed"];
const MEAL_PLANS = ["breakfast", "lunch", "dinner"];
const RULES = ["no_smoking", "no_pets", "quiet_hours", "no_party"];

// -------------------- Helpers --------------------
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubarray = (arr, min = 0, max = arr.length) =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));

// -------------------- Owners (MODIFIED) --------------------
// These are the specific IDs you provided to ensure the lookup finds a user
const VALID_OWNER_IDS = [
  "6984d4a9ba69fbd9561e82e5",
  "6984a2178e47a637cd2188fe",
  "6977a444cd991a27eb2a1e52",
  "6965056a49669152a2a6890d",
  "691dde15a9165ac7f6c1a92c",
];

// -------------------- Generate Properties --------------------
function generateDummyProperties(count = 30000) {
  const properties = [];

  for (let i = 0; i < count; i++) {
    const city = randomChoice(CITIES);
    const area = randomChoice(AREAS[city]);
    const hostOption = randomChoice(HOST_OPTIONS);

    const bedrooms = randomInt(1, hostOption === "hostel" ? 1 : 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const Persons = beds + 1;

    const monthlyRent = randomInt(500, 500000);
    const dailyRent = Math.round(monthlyRent / 30);
    const weeklyRent = Math.round(monthlyRent / 4);
    const SecuritybasePrice = monthlyRent * 1.5;

    const address = [
      {
        street: `Plot No. ${randomInt(1, 500)}`,
        city,
        stateTerritory: "Punjab",
        country: "PAKISTAN",
        zipCode: `${randomInt(40000, 60000)}`,
        aptSuiteUnit:
          hostOption === "hostel"
            ? `Room ${randomInt(1, 4)}`
            : `Unit ${randomInt(1, 20)}`,
      },
    ];

    const cityRange = CITY_COORDS[city];
    const lat =
      Math.random() * (cityRange.lat[1] - cityRange.lat[0]) + cityRange.lat[0];
    const lng =
      Math.random() * (cityRange.lng[1] - cityRange.lng[0]) + cityRange.lng[0];

    const photos = randomSubarray(
      CLOUDINARY_PHOTOS,
      1,
      CLOUDINARY_PHOTOS.length,
    );
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
        : null;

    const apartmentType =
      hostOption === "apartment" ? randomChoice(APARTMENT_TYPES) : undefined;
    const furnishing =
      hostOption === "apartment" ? randomChoice(FURNISHINGS) : undefined;
    const parking =
      hostOption === "apartment" ? Math.random() > 0.5 : undefined;

    const hostelType =
      hostOption === "hostel" ? randomChoice(HOSTEL_TYPES) : undefined;
    const mealPlan =
      hostOption === "hostel" ? randomSubarray(MEAL_PLANS, 1, 3) : undefined;
    const rules =
      hostOption === "hostel" ? randomSubarray(RULES, 1, 3) : undefined;

    properties.push({
      _id: new ObjectId().toHexString(),
      ownerId: randomChoice(VALID_OWNER_IDS), // Picks from your valid list
      title: `${bedrooms} Bed ${
        hostOption === "home"
          ? "House"
          : hostOption === "hostel"
            ? "Hostel"
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
      status: true, // Set to true to ensure they are fetchable
      featured: Math.random() > 0.8,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return properties;
}

// -------------------- Save to JSON --------------------
const PROPERTY_COUNT = 30000;
const properties = generateDummyProperties(PROPERTY_COUNT);

const filePath = path.join(__dirname, "dummy_properties_dto.json");
fs.writeFileSync(
  filePath,
  JSON.stringify({ data: properties, total: properties.length }, null, 2),
);

console.log(`\n🚀 Generation Complete!`);
console.log(`✅ Saved ${PROPERTY_COUNT} properties to: ${filePath}`);
console.log(
  `🔗 Distribution: All items assigned to the ${VALID_OWNER_IDS.length} specified IDs.`,
);
