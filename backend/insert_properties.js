const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

async function insertProperties() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = client.db("RentStore");
  const collection = db.collection("properties");

  const filePath = path.join(__dirname, "dummy_properties_dto.json");

  if (!fs.existsSync(filePath)) {
    console.error("JSON file not found:", filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const properties = parsed.data;

  // Convert _id to ObjectId, leave ownerId as string (your service expects string)
  properties.forEach((p) => {
    p._id = new ObjectId(p._id);
  });

  // Batch insert
  const batchSize = 1000;
  const totalBatches = Math.ceil(properties.length / batchSize);

  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    const bulkOps = batch.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $setOnInsert: p },
        upsert: true,
      },
    }));

    try {
      await collection.bulkWrite(bulkOps);
      console.log(`Processed batch ${i / batchSize + 1}/${totalBatches}`);
    } catch (err) {
      console.error(`Error on batch ${i / batchSize + 1}:`, err.message);
    }
  }

  console.log("Insertion complete!");
  await client.close();
}

insertProperties().catch((err) => console.error(err));
