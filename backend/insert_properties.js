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

  // Convert IDs to ObjectId, checking for the nested structure
  properties.forEach(p => {
    // 1. Convert the main property _id (the string) to an ObjectId instance
    p._id = new ObjectId(p._id);

    // 2. Convert the nested ownerId._id field:
    // We access p.ownerId._id (which is a string) and convert it, 
    // keeping ownerId as a complete object: { _id: ObjectId(), name: '...', email: '...' }
    if (p.ownerId && p.ownerId._id) {
      p.ownerId._id = new ObjectId(p.ownerId._id);
    } else if (p.ownerId && typeof p.ownerId === 'string') {
        // Fallback for an unlikely case where ownerId is just a string ID
        p.ownerId = new ObjectId(p.ownerId);
    }
  });

  // Insert in batches with "upsert" to skip duplicates
  const batchSize = 1000;
  const totalBatches = Math.ceil(properties.length / batchSize);
  
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    const batchNumber = i / batchSize + 1;

    const bulkOps = batch.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $setOnInsert: p },
        upsert: true, 
      },
    }));

    try {
      await collection.bulkWrite(bulkOps);
      console.log(`Processed batch ${batchNumber}/${totalBatches}`);
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error.message);
    }
  }

  console.log('\nInsertion complete!');
  await client.close();
}

insertProperties().catch(err => console.error(err));