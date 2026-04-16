const fs = require("fs");
const path = require("path");
const { ObjectId } = require("bson");

// -------------------- Constants --------------------
const CITY = "Islamabad";
const SECTORS = ["I-10/1", "I-10/2", "I-10/3", "I-10/4", "F-6", "F-7", "G-11"];
const CITY_COORDS = { lat: [33.6, 33.75], lng: [72.9, 73.1] };

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
  { length: 50 },
  (_, i) => `https://picsum.photos/800/600?random=${i + 1}`,
);

const APARTMENT_TYPES = ["studio", "1BHK", "2BHK", "3BHK", "penthouse"];
const FURNISHINGS = ["furnished", "semi-furnished", "unfurnished"];
const HOSTEL_TYPES = ["male", "female", "mixed"];
const MEAL_PLANS = ["breakfast", "lunch", "dinner"];
const RULES = ["no_smoking", "no_pets", "quiet_hours", "no_party"];

// -------------------- Helpers --------------------
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubarray = (arr, min = 0, max = arr.length) =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));

const randomDateInLastDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, days));
  return date;
};

const getFutureDate = (daysMin, daysMax) => {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(daysMin, daysMax));
  return date;
};

// -------------------- Users & Agencies --------------------
// Fixed your list of ObjectIDs
const VALID_OWNER_IDS = [
  new ObjectId("691dde15a9165ac7f6c1a92c"),
  new ObjectId("6977a444cd991a27eb2a1e52"),
  new ObjectId("6984d4a9ba69fbd9561e82e5"),
  new ObjectId("69a065e517835a522774978a"),
  new ObjectId("69aae2a4959b9e5637261c36"),
  new ObjectId("69cbd76f87d1db00d2ce2d6f"),
  new ObjectId("69cc232ba557cc6baa0b22b0"),
  new ObjectId("69cc30642ceebadcea087b02"),
  new ObjectId("69ce6200182193afb2868349"),
  new ObjectId("69d3ba84a2a61e084c5b1f01"),
  new ObjectId("69d41bee7d22bab0b56095e9"),
  new ObjectId("69d52e0f69213e68b9558ca6"),
  new ObjectId("69d52fef199384cbda309dac"),
];

const AGENCIES = VALID_OWNER_IDS.slice(0, 3).map((ownerId) => ({
  _id: new ObjectId(),
  name: `Premium Realty ${ownerId.toString().slice(-4)}`,
  owner: ownerId,
}));

// -------------------- Generate Properties --------------------
function generateProperties(count = 500) {
  const properties = [];

  for (let i = 0; i < count; i++) {
    const area = randomChoice(SECTORS);
    const hostOption = randomChoice(HOST_OPTIONS);
    const bedrooms = randomInt(1, hostOption === "hostel" ? 1 : 5);
    const monthlyRent = randomInt(25000, 250000);

    const lat =
      Math.random() * (CITY_COORDS.lat[1] - CITY_COORDS.lat[0]) +
      CITY_COORDS.lat[0];
    const lng =
      Math.random() * (CITY_COORDS.lng[1] - CITY_COORDS.lng[0]) +
      CITY_COORDS.lng[0];
    const ownerId = randomChoice(VALID_OWNER_IDS);

    // Distribution for Interleaving: 10% Business (3), 20% Standard (2), 70% Basic (1)
    const weightRand = Math.random();
    const sortWeight = weightRand > 0.9 ? 3 : weightRand > 0.7 ? 2 : 1;

    const isFeatured = sortWeight === 3; // Typically Weight 3 properties are featured
    const featuredUntil = isFeatured ? getFutureDate(15, 45) : undefined;
    const isBoosted = sortWeight === 2;

    const createdAt = randomDateInLastDays(60);

    properties.push({
      _id: new ObjectId(),
      ownerId: ownerId,
      agency: Math.random() > 0.6 ? randomChoice(AGENCIES)._id : null,
      listedBy: ownerId,
      title: `${bedrooms} BHK ${hostOption} available in ${area}`,
      hostOption,
      area: area,
      location: `${area}, ${CITY}`,
      lat,
      lng,
      locationGeo: { type: "Point", coordinates: [lng, lat] },
      monthlyRent,
      dailyRent: Math.round(monthlyRent / 28),
      weeklyRent: Math.round(monthlyRent / 4),
      SecuritybasePrice: monthlyRent * 2,
      ALL_BILLS: randomSubarray(BILLS, 1, 3),

      // Updated to match Schema: Address as an object inside an array or single object
      address: [
        {
          aptSuiteUnit: `Floor ${randomInt(1, 4)}, Suite ${randomInt(10, 50)}`,
          street: `Street ${randomInt(1, 40)}`,
          city: CITY,
          stateTerritory: "Federal",
          country: "Pakistan",
          zipCode: "44000",
        },
      ],

      amenities: randomSubarray(AMENITIES, 3, 7),
      photos: randomSubarray(CLOUDINARY_PHOTOS, 4, 8),

      capacityState: {
        Persons: randomInt(1, 8),
        bedrooms: bedrooms,
        beds: randomInt(bedrooms, bedrooms + 2),
        bathrooms: randomInt(1, bedrooms + 1),
        floorLevel: randomInt(0, 5),
      },

      size: {
        value: randomInt(5, 50),
        unit: randomChoice(["Marla", "Kanal", "Sq. Ft."]),
      },

      description: { highlighted: randomSubarray(HIGHLIGHTS, 2, 4) },
      safetyDetailsData: {
        safetyDetails: randomSubarray(SAFETY_DETAILS, 2, 5),
        cameraDescription: "Active CCTV monitoring in entry/exit points.",
      },

      apartmentType:
        hostOption === "apartment" ? randomChoice(APARTMENT_TYPES) : null,
      furnishing: hostOption === "apartment" ? randomChoice(FURNISHINGS) : null,
      parking: true,
      hostelType: hostOption === "hostel" ? randomChoice(HOSTEL_TYPES) : null,
      mealPlan: hostOption === "hostel" ? randomSubarray(MEAL_PLANS, 1, 3) : [],
      rules: hostOption === "hostel" ? randomSubarray(RULES, 2, 4) : [],

      status: true,
      isApproved: true,
      isVisible: true,
      moderationStatus: "ACTIVE",
      sortWeight,
      featured: isFeatured,
      featuredUntil,
      isBoosted,
      views: randomInt(50, 5000),
      impressions: randomInt(500, 20000),
      reportCount: 0,
      strikeCount: 0,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return properties;
}

// -------------------- Execution --------------------
const PROPERTY_COUNT = 10000; // Starting with 10k for stability
const properties = generateProperties(PROPERTY_COUNT);
const filePath = path.join(__dirname, "dummy_properties.json");

fs.writeFileSync(
  filePath,
  JSON.stringify({ data: properties, total: properties.length }, null, 2),
);

console.log(`🚀 Done! Generated ${PROPERTY_COUNT} properties.`);
console.log(
  `📊 Weight Distribution: ~10% Business Pro (3), ~20% Standard Pro (2), ~70% Basic (1)`,
);
