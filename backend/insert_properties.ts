// import_properties.ts
import mongoose from "mongoose";
import fs from "fs";
import { PropertySchema, Property } from "./src/modules/property/property.schema";

const MONGO_URI = "mongodb://localhost:27017/RentStore"; // <-- replace with your DB

async function importProperties() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Create Mongoose model with schema (indexes defined in schema)
    const PropertyModel = mongoose.model<Property>("Property", PropertySchema);

    // 3️⃣ Read JSON data
    const rawData = fs.readFileSync(
      __dirname + "/dummy_properties.json",
      "utf-8"
    );
    const properties: Property[] = JSON.parse(rawData); // <-- JSON is now array

    console.log(`⚡ Inserting ${properties.length} properties...`);
    await PropertyModel.insertMany(properties);

    // 4️⃣ Ensure indexes are created
    await PropertyModel.init(); // creates indexes defined in schema
    console.log("✅ Indexes created: propertyType, ownerId");

    console.log("🎉 Import complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing properties:", error);
    process.exit(1);
  }
}

importProperties();
