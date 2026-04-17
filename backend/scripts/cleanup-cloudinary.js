const { v2: cloudinary } = require("cloudinary");
const mongoose = require("mongoose");
require("dotenv").config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanOrphanedImages() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Database.");

    // Define a minimal schema locally so we don't have to import the TS schema
    const Property = mongoose.model(
      "Property",
      new mongoose.Schema({
        photos: [String],
      }),
    );

    console.log("--- Starting Cloudinary Cleanup ---");

    // 1. Fetch ALL properties and extract all image IDs from the DB
    const properties = await Property.find({}, "photos").lean();
    const usedPublicIds = new Set();

    properties.forEach((prop) => {
      prop.photos?.forEach((url) => {
        // Extracts the public_id from the end of the URL
        const parts = url.split("/");
        const fileName = parts[parts.length - 1];
        if (fileName) {
          const publicId = fileName.split(".")[0];
          usedPublicIds.add(publicId);
        }
      });
    });

    console.log(
      `📊 Found ${usedPublicIds.size} unique images used in database.`,
    );

    // 2. Fetch images from Cloudinary and compare
    let orphanedCount = 0;
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: "upload",
        max_results: 100,
        next_cursor: nextCursor,
      });

      const cloudinaryPublicIds = result.resources.map((res) => res.public_id);

      // 3. Identify IDs that are in Cloudinary but NOT in our database set
      const idsToDelete = cloudinaryPublicIds.filter(
        (id) => !usedPublicIds.has(id),
      );

      if (idsToDelete.length > 0) {
        console.log(`🗑️  Deleting ${idsToDelete.length} orphaned images...`);
        await cloudinary.api.delete_resources(idsToDelete);
        orphanedCount += idsToDelete.length;
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`✨ Cleanup Complete. Total deleted: ${orphanedCount}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Database connection closed.");
  }
}

// Execute the function
cleanOrphanedImages();
