import { existsSync } from "fs";
import { join } from "path";
import mongoose, { Schema } from "mongoose";
import { preparePropertySearchFields } from "../src/modules/property/utils/property.utils";

const loadEnvFileIfPresent = () => {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  for (const candidate of [
    join(__dirname, "..", ".env.local"),
    join(__dirname, "..", ".env"),
  ]) {
    if (existsSync(candidate)) {
      process.loadEnvFile(candidate);
      return;
    }
  }
};

type PropertyDocumentShape = {
  _id: mongoose.Types.ObjectId;
  title?: string;
  area?: string;
  location?: string;
  addressQuery?: string;
  address?: Array<{
    aptSuiteUnit?: string;
    street?: string;
    city?: string;
    stateTerritory?: string;
    country?: string;
  }>;
};

async function run() {
  loadEnvFileIfPresent();

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required to run normalize:address-query");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || undefined,
    autoIndex: false,
  });

  const propertySchema = new Schema({}, { strict: false, collection: "properties" });
  const PropertyModel = mongoose.model<PropertyDocumentShape>(
    "PropertyMigration",
    propertySchema,
  );

  const cursor = PropertyModel.find(
    {},
    {
      title: 1,
      area: 1,
      location: 1,
      addressQuery: 1,
      address: 1,
    },
  )
    .lean()
    .cursor();

  const operations: Array<mongoose.AnyBulkWriteOperation<PropertyDocumentShape>> = [];
  let scanned = 0;
  let updated = 0;

  for await (const property of cursor) {
    scanned += 1;
    const nextFields = preparePropertySearchFields(property);

    operations.push({
      updateOne: {
        filter: { _id: property._id },
        update: {
          $set: nextFields,
        },
      },
    });

    if (operations.length >= 500) {
      const result = await PropertyModel.bulkWrite(operations, { ordered: false });
      updated += result.modifiedCount;
      operations.length = 0;
    }
  }

  if (operations.length > 0) {
    const result = await PropertyModel.bulkWrite(operations, { ordered: false });
    updated += result.modifiedCount;
  }

  console.log(
    `[normalize:address-query] scanned=${scanned} updated=${updated}`,
  );
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("[normalize:address-query] failed", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
