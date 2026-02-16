const fs = require("fs");
const path = require("path");
const { ObjectId } = require("bson");

// -------------------- Constants --------------------
const CITY = "Islamabad";
const SECTORS = ["I-10/1", "I-10/2", "I-10/3", "I-10/4"];

const CITY_COORDS = { lat: [33.65, 33.68], lng: [73.03, 73.07] };

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

// -------------------- Owners (Replace with your actual User IDs if needed) --------------------
const VALID_OWNER_IDS = [
  "6984d4a9ba69fbd9561e82e5",
  "6984a2178e47a637cd2188fe",
  "6977a444cd991a27eb2a1e52",
  "6965056a49669152a2a6890d",
  "691dde15a9165ac7f6c1a92c",
];

// -------------------- Generate Properties --------------------
function generateI10Properties(count = 5000) {
  const properties = [];

  for (let i = 0; i < count; i++) {
    const area = randomChoice(SECTORS);
    const areaOnly = area.split("/")[0]; // "I-10"
    const hostOption = randomChoice(HOST_OPTIONS);

    // Filter Logic Compatibility: Bedrooms and beds
    const bedrooms = randomInt(1, hostOption === "hostel" ? 1 : 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const Persons = beds + 1;

    // Floor Level Logic: 0 = Ground, 1 = 1st, 2 = 2nd, etc.
    // Homes usually 0-1, Apartments/Hostels 0-4
    const floorLevel =
      hostOption === "home" ? randomInt(0, 1) : randomInt(0, 4);

    // Realistic Pakistani Rent (PKR)
    const monthlyRent = randomInt(20000, 150000);
    const dailyRent = Math.round(monthlyRent / 30);
    const weeklyRent = Math.round(monthlyRent / 4);
    const SecuritybasePrice = monthlyRent * 2;

    const address = [
      {
        street: `Street ${randomInt(1, 20)}`,
        city: CITY,
        stateTerritory: "Islamabad Capital Territory",
        country: "Pakistan",
        zipCode: "44000",
        aptSuiteUnit:
          hostOption === "hostel"
            ? `Room ${randomInt(1, 40)}`
            : `House/Unit ${randomInt(1, 200)}`,
      },
    ];

    const lat =
      Math.random() * (CITY_COORDS.lat[1] - CITY_COORDS.lat[0]) +
      CITY_COORDS.lat[0];
    const lng =
      Math.random() * (CITY_COORDS.lng[1] - CITY_COORDS.lng[0]) +
      CITY_COORDS.lng[0];
    const locationGeo = { type: "Point", coordinates: [lng, lat] };

    const photos = randomSubarray(CLOUDINARY_PHOTOS, 3, 8);
    const amenities = randomSubarray(AMENITIES, 3, 7);
    const ALL_BILLS = randomSubarray(BILLS, 1, 4);
    const highlighted = randomSubarray(HIGHLIGHTS, 1, 3);
    const safetyDetails = randomSubarray(SAFETY_DETAILS, 2, 5);

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
      ownerId: randomChoice(VALID_OWNER_IDS),
      title: `${bedrooms} Bed ${hostOption.charAt(0).toUpperCase() + hostOption.slice(1)} in ${area}`,
      hostOption,
      area: areaOnly,
      location: `${area}, ${CITY}`,
      lat,
      lng,
      locationGeo,
      monthlyRent,
      dailyRent,
      weeklyRent,
      SecuritybasePrice,
      ALL_BILLS,
      address,
      amenities,
      // Fixed: Nested Object for Search Filter
      capacityState: {
        Persons,
        bedrooms,
        beds,
        bathrooms,
        floorLevel,
      },
      description: { highlighted },
      safetyDetailsData: { safetyDetails, cameraDescription },
      photos,
      apartmentType,
      furnishing,
      parking,
      hostelType,
      mealPlan,
      rules,
      status: true,
      featured: Math.random() > 0.9,
      views: randomInt(0, 500),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return properties;
}

// -------------------- Execution --------------------
const PROPERTY_COUNT = 50000; // Adjusted for better performance during test
const properties = generateI10Properties(PROPERTY_COUNT);

const filePath = path.join(__dirname, "dummy_properties.json");
fs.writeFileSync(
  filePath,
  JSON.stringify({ data: properties, total: properties.length }, null, 2),
);

console.log(
  `🚀 Generation Complete! Saved ${PROPERTY_COUNT} properties with floorLevel to: ${filePath}`,
);
