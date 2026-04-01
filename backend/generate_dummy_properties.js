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
const HOSTEL_TYPES = ["male", "female", "mixed"]; // ✅ FIXED
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
  const randomDaysAgo = Math.floor(Math.random() * days);
  date.setDate(date.getDate() - randomDaysAgo);
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
};

// -------------------- Users & Agencies --------------------

// Convert your existing IDs to ObjectId
const VALID_OWNER_IDS = [
  new ObjectId("69cbd76f87d1db00d2ce2d6f"),
  new ObjectId("69aae2a4959b9e5637261c36"),
  new ObjectId("69a065e517835a522774978a"),
  new ObjectId("6984d4a9ba69fbd9561e82e5"),
  new ObjectId("6984a2178e47a637cd2188fe"),
  new ObjectId("6977a444cd991a27eb2a1e52"),
  new ObjectId("691dde15a9165ac7f6c1a92c"),
];

// Create dummy agencies
const AGENCIES = VALID_OWNER_IDS.slice(0, 3).map((ownerId) => ({
  _id: new ObjectId(),
  name: `agent ${ownerId.toString().slice(-4)}`,
  owner: ownerId,
  agents: randomSubarray(VALID_OWNER_IDS, 1, 3),
}));

// -------------------- Generate Properties --------------------
function generateI10Properties(count = 500) {
  const properties = [];

  for (let i = 0; i < count; i++) {
    const area = randomChoice(SECTORS);
    const areaOnly = area.split("/")[0];
    const hostOption = randomChoice(HOST_OPTIONS);

    const bedrooms = randomInt(1, hostOption === "hostel" ? 1 : 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const Persons = beds + 1;

    const floorLevel =
      hostOption === "home" ? randomInt(0, 1) : randomInt(0, 4);

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

    const cameraDescription = safetyDetails.includes("exterior_camera")
      ? "Visible exterior camera above main entrance."
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

    const createdAt = randomDateInLastDays(45);
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + randomInt(1, 48));

    const ownerId = randomChoice(VALID_OWNER_IDS);

    // Randomly assign agent
    const agent = Math.random() > 0.6 ? randomChoice(AGENCIES) : null;

    properties.push({
      _id: new ObjectId(),

      ownerId: ownerId, // ✅ ObjectId
      agent: agent ? agent._id : undefined, // ✅ linked agent
      listedBy: ownerId, // ✅ uploader

      title: `${bedrooms} Bed ${
        hostOption.charAt(0).toUpperCase() + hostOption.slice(1)
      } in ${area}`,

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
      photos,

      capacityState: {
        Persons,
        bedrooms,
        beds,
        bathrooms,
        floorLevel,
      },

      description: { highlighted },

      safetyDetailsData: {
        safetyDetails,
        cameraDescription,
      },

      apartmentType,
      furnishing,
      parking,

      hostelType,
      mealPlan,
      rules,

      status: true,
      featured: Math.random() > 0.9,
      isApproved: Math.random() > 0.3,

      moderationStatus: "ACTIVE", // ✅ NEW FIELD
      isVisible: true,
      reportCount: randomInt(0, 5),
      strikeCount: randomInt(0, 2),

      views: randomInt(0, 500),

      createdAt,
      updatedAt,
    });
  }

  return properties;
}

// -------------------- Execution --------------------
const PROPERTY_COUNT = 50000;

const properties = generateI10Properties(PROPERTY_COUNT);

const filePath = path.join(__dirname, "dummy_properties.json");

fs.writeFileSync(
  filePath,
  JSON.stringify(
    {
      data: properties,
      agencies: AGENCIES,
      total: properties.length,
    },
    null,
    2,
  ),
);

console.log("🚀 Generation Complete!");
console.log("📅 Dates distributed over last 45 days for Trend Calculations.");
console.log(`📂 File saved to: ${filePath}`);
