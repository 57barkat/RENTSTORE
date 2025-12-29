const fs = require("fs");
const { ObjectId } = require("bson");

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
const CLOUDINARY_PHOTOS = [
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/dghcwhzx6ybbwduvtadb.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/kkhwil8tm35deyqyasgr.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/gp8e4bkoz5rvfikulfek.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/rd8urpckgtidczr1crgd.jpg",
  "https://res.cloudinary.com/da2yfuazg/image/upload/v1761156961/synzyaj62qiqgfz35zrl.jpg",
  "https://picsum.photos/300/200?random=1",
  "https://picsum.photos/300/200?random=2",
  "https://picsum.photos/300/200?random=3",
  "https://picsum.photos/300/200?random=4",
  "https://picsum.photos/300/200?random=5",
  "https://picsum.photos/300/200?random=6",
  "https://picsum.photos/300/200?random=7",
  "https://picsum.photos/300/200?random=8",
  "https://picsum.photos/300/200?random=9",
  "https://picsum.photos/300/200?random=10",
  "https://picsum.photos/300/200?random=11",
  "https://picsum.photos/300/200?random=12",
  "https://picsum.photos/300/200?random=13",
  "https://picsum.photos/300/200?random=14",
  "https://picsum.photos/300/200?random=15",
  "https://picsum.photos/300/200?random=16",
  "https://picsum.photos/300/200?random=17",
  "https://picsum.photos/300/200?random=18",
  "https://picsum.photos/300/200?random=19",
  "https://picsum.photos/300/200?random=20",
  "https://picsum.photos/300/200?random=21",
  "https://picsum.photos/300/200?random=22",
  "https://picsum.photos/300/200?random=23",
  "https://picsum.photos/300/200?random=24",
  "https://picsum.photos/300/200?random=25",
  "https://picsum.photos/300/200?random=26",
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
    const hostOption = randomChoice(HOST_OPTIONS); // ✅ Only home/apartment/hostel

    const bedrooms = randomInt(1, hostOption === "hostel" ? 1 : 5);
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
          hostOption === "hostel"
            ? `Room ${randomInt(1, 4)}`
            : `Unit ${randomInt(1, 20)}`,
      },
    ];

    // Coordinates
    const cityRange = CITY_COORDS[city];
    const lat =
      Math.random() * (cityRange.lat[1] - cityRange.lat[0]) + cityRange.lat[0];
    const lng =
      Math.random() * (cityRange.lng[1] - cityRange.lng[0]) + cityRange.lng[0];

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
    const apartmentType =
      hostOption === "apartment" ? randomChoice(APARTMENT_TYPES) : undefined;
    const furnishing =
      hostOption === "apartment" ? randomChoice(FURNISHINGS) : undefined;
    const parking =
      hostOption === "apartment" ? Math.random() > 0.5 : undefined;

    // Hostel-specific
    const hostelType =
      hostOption === "hostel" ? randomChoice(HOSTEL_TYPES) : undefined;
    const mealPlan =
      hostOption === "hostel" ? randomSubarray(MEAL_PLANS, 1, 3) : undefined;
    const rules =
      hostOption === "hostel" ? randomSubarray(RULES, 1, 3) : undefined;

    properties.push({
      _id: new ObjectId().toHexString(),
      ownerId: baseOwnerId,
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
      status: Math.random() > 0.2,
      featured: Math.random() > 0.7,
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

console.log(
  `Generated ${PROPERTY_COUNT} properties: only Home, Apartment, Hostel.`
);
