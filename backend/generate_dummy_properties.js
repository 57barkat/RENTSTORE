const fs = require("fs");
// If you are using Mongoose or MongoDB, ensure you have the 'bson' package installed
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

// Place your Cloudinary/image URLs here
const CLOUDINARY_PHOTOS = [
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/dghcwhzx6ybbwduvtadb.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/kkhwil8tm35deyqyasgr.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/gp8e4bkoz5rvfikulfek.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/rd8urpckgtidczr1crgd.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/synzyaj62qiqgfz35zrl.jpg",
];

// --- Helper Functions ---
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubarray(arr, min = 0, max = arr.length) {
  const len = randomInt(min, max);
  // Shuffle the array and slice
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, len);
}

// --- Main Generator Function ---
function generateProperties(count = 30000) {
  const properties = [];
  const baseOwnerId = new ObjectId().toHexString();
  const baseOwnerName = "Barkat Khan";
  const baseOwnerEmail = "barkat.host@dummy.com";

  for (let i = 0; i < count; i++) {
    const city = randomChoice(CITIES);
    const area = randomChoice(AREAS[city]);

    const hostOption = randomChoice(HOST_OPTIONS);
    const bedrooms = randomInt(1, hostOption === "room" ? 1 : 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const guests = beds + 1;

    const rentPrice = randomInt(500, 500000);
    const securityPrice = rentPrice * 1.5;

    // Use a subset of the images for variety, sometimes empty
    const photos =
      Math.random() < 0.2
        ? []
        : randomSubarray(CLOUDINARY_PHOTOS, 1, CLOUDINARY_PHOTOS.length);

    // Random safety details, sometimes including camera
    const safetyDetails = randomSubarray(SAFETY_DETAILS, 0, 4);
    const hasCamera =
      safetyDetails.includes("exterior_camera") ||
      safetyDetails.includes("noise_monitor");
    const cameraDescription = hasCamera
      ? randomChoice([
          "Visible exterior camera above main entrance.",
          "Ring doorbell camera is active.",
          "Noise monitoring in shared areas.",
        ])
      : "";

    properties.push({
      // Core Identifiers
      _id: new ObjectId().toHexString(),
      ownerId: {
        _id: baseOwnerId,
        name: baseOwnerName,
        email: baseOwnerEmail,
      },
      views: randomInt(0, 100),
      isFav: Math.random() > 0.8, // 20% chance of being favorited

      // Property Basics
      title: `${bedrooms} Bed ${
        hostOption === "home"
          ? "House"
          : hostOption === "room"
          ? "Room"
          : "Apartment"
      } in ${area}`,
      hostOption: hostOption,
      location: `${area}, ${city}`,

      // Pricing
      monthlyRent: rentPrice,
      SecuritybasePrice: securityPrice,
      ALL_BILLS: randomSubarray(BILLS, 0, 4),

      // Address Details
      address: [
        {
          street: `Plot No. ${randomInt(1, 500)}`,
          city: city,
          stateTerritory: "Punjab", // Simplified for Pakistan example
          country: "PAKISTAN",
          zipCode: `${randomInt(40000, 60000)}`,
          aptSuiteUnit:
            hostOption === "room"
              ? `Room ${randomInt(1, 4)}`
              : `Unit ${randomInt(1, 20)}`,
        },
      ],

      // Features
      amenities: randomSubarray(AMENITIES, 2, 7),
      capacityState: {
        guests: guests,
        bedrooms: bedrooms,
        beds: beds,
        bathrooms: bathrooms,
      },

      // Description and Highlights
      description: {
        // Add a simple overview for better context in the app
        overview: `Experience comfort in this ${bedrooms}-bedroom property in the heart of ${area}. Perfect for a small family or group of ${guests}.`,
        highlighted: randomSubarray(HIGHLIGHTS, 1, 3),
      },

      // Safety
      safetyDetailsData: {
        safetyDetails: safetyDetails,
        cameraDescription: cameraDescription,
      },

      // Media
      photos: photos,

      // Timestamps
      createdAt: new Date(
        Date.now() - randomInt(86400000, 31536000000)
      ).toISOString(), // 1 day to 1 year ago
      updatedAt: new Date().toISOString(),
      __v: 0,
    });
  }
  return properties;
}

// --- Execution ---
const PROPERTY_COUNT = 30000;
const properties = generateProperties(PROPERTY_COUNT);

const outputData = {
  data: properties,
  total: properties.length,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(properties.length / 10), // Calculation is generic
};

// Save to file
fs.writeFileSync(
  "dummy_30k_properties_v2.json",
  JSON.stringify(outputData, null, 2)
);

console.log(
  `Successfully generated ${PROPERTY_COUNT} properties and saved to dummy_30k_properties_v2.json`
);
