// generate_dummy_properties.js
const fs = require('fs');
const { ObjectId } = require('bson');

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi"];
const areas = {
  "Lahore": ["DHA Phase 5", "Gulberg", "Johar Town"],
  "Karachi": ["Clifton", "PECHS", "DHA Karachi"],
  "Islamabad": ["F-6", "F-7", "G-9"],
  "Rawalpindi": ["Satellite Town", "G-11", "Saddar"]
};

function randomPhone() {
  return `+92${Math.floor(Math.random() * 1000000000 + 3000000000)}`;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProperties(count = 30000) {
  const properties = [];
  for (let i = 0; i < count; i++) {
    const city = randomChoice(cities);
    const area = randomChoice(areas[city]);
    const bedrooms = Math.floor(Math.random() * 5) + 1;
    const rentPrice = Math.floor(Math.random() * 180000) + 20000;
    const floor = Math.floor(Math.random() * 10) + 1;
    const furnished = Math.random() > 0.5;

    properties.push({
      _id: new ObjectId(),
      propertyType: randomChoice(["apartment", "house", "villa"]),
      title: `${bedrooms} Bed ${randomChoice(["Apartment","House","Villa"])} for Rent in ${area}`,
      description: `A ${bedrooms}-bedroom property in ${area}, ${city}, suitable for families or professionals.`,
      address: `${area}, ${city}, Pakistan`,
      city: city,
      area: area,
      latitude: parseFloat((Math.random() * (37 - 24) + 24).toFixed(6)),
      longitude: parseFloat((Math.random() * (75 - 66) + 66).toFixed(6)),
      bedrooms: bedrooms,
      bathrooms: bedrooms,
      kitchens: 1,
      livingRooms: 1,
      floor: floor,
      totalArea: `${Math.floor(Math.random() * 16) + 5} Marla`,
      rentPrice: rentPrice,
      utilitiesIncluded: Math.random() > 0.5,
      furnished: furnished,
      ownerName: `Owner ${i}`,
      phone: randomPhone(),
      email: `owner${i}@example.com`,
      images: [],
      videos: [],
      amenities: ["electricity", "water", "gas", "internet", "parking"],
      preferences: [],
      ownerId: new ObjectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    });
  }
  return properties;
}

const properties = generateProperties(30000);
fs.writeFileSync('dummy_30k_properties.json', JSON.stringify({ data: properties, total: properties.length }, null, 2));
console.log('dummy_30k_properties.json generated successfully!');
