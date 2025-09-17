const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function insertProperties() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();

  const db = client.db('RentStore'); // Use exact existing DB
  const collection = db.collection('properties');

  // Load JSON
  const filePath = path.join(__dirname, 'dummy_30k_properties.json');
  if (!fs.existsSync(filePath)) {
    console.error('JSON file not found:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  const properties = parsed.data;

  // Convert _id and ownerId to ObjectId
  properties.forEach(p => {
    p._id = new ObjectId(p._id);
    p.ownerId = new ObjectId(p.ownerId);
  });

  // Insert in batches with "upsert" to skip duplicates
  const batchSize = 1000;
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);

    const bulkOps = batch.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $setOnInsert: p },
        upsert: true, 
      },
    }));

    await collection.bulkWrite(bulkOps);
    console.log(`Processed batch ${i / batchSize + 1}`);
  }

  console.log('All properties inserted successfully!');
  await client.close();
}

insertProperties().catch(err => console.error(err));
