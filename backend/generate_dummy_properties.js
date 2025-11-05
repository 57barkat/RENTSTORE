const fs = require("fs");
const { ObjectId } = require("bson");

// --- Constants ---
const CITIES = [
  "Lahore",
  "Karachi", // <-- Target City
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
    "DHA Karachi Phase 6", // <-- Target Area
    "North Nazimabad",
  ],
  Islamabad: ["F-6 Sector", "F-7 Sector", "G-9 Sector", "E-11 Sector"],
  Rawalpindi: ["Satellite Town", "Bahria Town", "Askari 14", "Saddar"],
  Peshawar: ["Hayatabad Phase 4", "University Road", "Palosi"],
  Quetta: ["Cantonment Area", "Airport Road"],
};

const PROPERTY_TYPES = ["house", "apartment", "room", "hostel"];
const HOSTEL_TYPES = ["male", "female", "mixed"];
const ROOM_TYPES = ["single", "double"];
const RENT_TYPES = ["daily", "weekly", "monthly"];
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
];
const RULES = ["no_smoking", "no_parties", "quiet_hours_after_10pm", "no_pets"];
const CLOUDINARY_PHOTOS = [
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/dghcwhzx6ybbwduvtadb.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/kkhwil8tm35deyqyasgr.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/gp8e4bkoz5rvfikulfek.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/rd8urpckgtidczr1crgd.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/synzyaj62qiqgfz35zrl.jpg",
];

// --- Helpers ---
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubarray = (arr, min = 0, max = arr.length) =>
  arr.sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));

/**
 * Creates rent rates for all types based on a base monthly amount.
 * @param {number} monthlyAmount
 */
function createRentRates(monthlyAmount) {
  const dailyAmount = Math.ceil(monthlyAmount / 20 / 100) * 100;
  const weeklyAmount = Math.ceil(monthlyAmount / 4.5 / 100) * 100;

  return [
    { type: "daily", amount: dailyAmount },
    { type: "weekly", amount: weeklyAmount },
    { type: "monthly", amount: monthlyAmount },
  ];
}

// --- Generate Properties ---
function generateDummyProperties(count = 30000) {
  const properties = [];
  const baseOwnerId = new ObjectId().toHexString();

  // --- 🎯 1. Guaranteed Match Property (Monthly Rent: 35,000) ---
  const targetCity = "Karachi";
  const targetArea = "DHA Karachi Phase 6";
  const targetBeds = 2; // beds >= 2
  const targetMonthlyRent = 35000; // 10000 <= amount <= 50000

  properties.push({
    _id: new ObjectId().toHexString(),
    ownerId: baseOwnerId,
    propertyType: "apartment",
    title: `${targetBeds} Bed Apartment in ${targetArea} (Target Match 1)`,
    location: {
      city: targetCity,
      area: targetArea,
      street: `Plot No. ${randomInt(100, 200)}`,
      fullAddress: `Plot No. ${randomInt(
        100,
        200
      )}, ${targetArea}, ${targetCity}`,
    },
    rentRates: createRentRates(targetMonthlyRent),
    securityDeposit: Math.floor(targetMonthlyRent * 1.5),
    billsIncluded: randomSubarray(BILLS, 0, 4),
    amenities: randomSubarray(AMENITIES, 2, 7),
    capacity: {
      persons: targetBeds + 1,
      bedrooms: targetBeds,
      beds: targetBeds,
      bathrooms: 1,
    },
    safetyFeatures: randomSubarray(SAFETY_DETAILS, 0, 4),
    rules: randomSubarray(RULES, 1, 3),
    description: {
      highlights: ["central_location", "family_friendly"],
      details: `Guaranteed search result for Karachi/2 Beds/10k-50k.`,
    },
    photos: randomSubarray(CLOUDINARY_PHOTOS, 1, CLOUDINARY_PHOTOS.length),
    status: true,
  });

  // --- 🎯 2. Guaranteed Match Property (Monthly Rent: 49,000) ---
  const targetMonthlyRent2 = 49000; // Another valid amount
  const targetBeds2 = 3; // Also valid (beds >= 2)

  properties.push({
    _id: new ObjectId().toHexString(),
    ownerId: baseOwnerId,
    propertyType: "house",
    title: `${targetBeds2} Bed House in ${targetArea} (Target Match 2)`,
    location: {
      city: targetCity,
      area: targetArea,
      street: `Plot No. ${randomInt(201, 300)}`,
      fullAddress: `Plot No. ${randomInt(
        201,
        300
      )}, ${targetArea}, ${targetCity}`,
    },
    rentRates: createRentRates(targetMonthlyRent2),
    securityDeposit: Math.floor(targetMonthlyRent2 * 1.5),
    billsIncluded: randomSubarray(BILLS, 0, 4),
    amenities: randomSubarray(AMENITIES, 2, 7),
    capacity: {
      persons: targetBeds2 + 2,
      bedrooms: targetBeds2,
      beds: targetBeds2,
      bathrooms: 2,
    },
    safetyFeatures: randomSubarray(SAFETY_DETAILS, 0, 4),
    rules: randomSubarray(RULES, 1, 3),
    description: {
      highlights: ["newly_renovated", "peaceful"],
      details: `Second guaranteed search result for Karachi/3 Beds/10k-50k.`,
    },
    photos: randomSubarray(CLOUDINARY_PHOTOS, 1, CLOUDINARY_PHOTOS.length),
    status: true,
  });

  // --- 🔄 3. Generate Remaining Random Properties ---
  for (let i = 2; i < count; i++) {
    const city = randomChoice(CITIES);
    const area = randomChoice(AREAS[city]);
    const propertyType = randomChoice(PROPERTY_TYPES);

    let subType;
    if (propertyType === "hostel") subType = randomChoice(HOSTEL_TYPES);
    else if (propertyType === "room") subType = randomChoice(ROOM_TYPES);

    const monthlyAmount = randomInt(50000, 500000); // Higher rent for random data
    const rentRates = createRentRates(monthlyAmount);

    const securityDeposit = Math.floor(monthlyAmount * 1.5);
    const bedrooms = propertyType === "room" ? 1 : randomInt(1, 5);
    const beds = randomInt(bedrooms, bedrooms + 2);
    const bathrooms = randomInt(1, bedrooms);
    const persons = beds + 1;
    const street = `Plot No. ${randomInt(1, 500)}`;
    const safetyDetails = randomSubarray(SAFETY_DETAILS, 0, 4);
    const cameraDescription = safetyDetails.includes("exterior_camera")
      ? "Visible exterior camera above main entrance."
      : undefined;

    properties.push({
      _id: new ObjectId().toHexString(),
      ownerId: baseOwnerId,
      propertyType,
      title: `${bedrooms} Bed ${
        propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
      } in ${area}`,
      subType,
      location: {
        city,
        area,
        street,
        fullAddress: `${street}, ${area}, ${city}`,
      },
      rentRates,
      securityDeposit,
      billsIncluded: randomSubarray(BILLS, 0, 4),
      amenities: randomSubarray(AMENITIES, 2, 7),
      capacity: { persons, bedrooms, beds, bathrooms },
      safetyFeatures: safetyDetails,
      rules: randomSubarray(RULES, 1, 3),
      description: {
        highlights: randomSubarray(HIGHLIGHTS, 1, 3),
        details: `A beautiful ${propertyType} located in the heart of ${area}. ${
          cameraDescription || ""
        }`,
      },
      photos: randomSubarray(CLOUDINARY_PHOTOS, 1, CLOUDINARY_PHOTOS.length),
      status: true, // ✅ ensure all are active
    });
  }

  return properties;
}

// --- Execution ---
const PROPERTY_COUNT = 30000;
const properties = generateDummyProperties(PROPERTY_COUNT);

fs.writeFileSync(
  __dirname + "/dummy_properties.json",
  JSON.stringify(properties, null, 2) // Changed format to an array of properties
);

console.log(
  `✅ Generated ${properties.length} properties. GUARANTEED 2 matches for Karachi/Beds>=2/Monthly Rent 10k-50k.`
);
