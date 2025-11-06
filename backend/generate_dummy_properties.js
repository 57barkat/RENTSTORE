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

// --- Helpers ---
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubarray = (arr, min = 0, max = arr.length) =>
  arr.sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));

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
    const SecuritybasePrice = monthlyRent * 1.5;

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
      monthlyRent,
      SecuritybasePrice,
      ALL_BILLS,
      address,
      amenities,
      capacityState: { Persons, bedrooms, beds, bathrooms },
      description: { highlighted },
      safetyDetailsData: { safetyDetails, cameraDescription },
      photos,
      status: Math.random() > 0.2, // 80% active, 20% draft
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
  `Generated ${PROPERTY_COUNT} properties according to CreatePropertyDto.`
);
