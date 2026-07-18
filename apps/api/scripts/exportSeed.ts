import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Snapshot lives at the repository root so it is decoupled from the api app
// and can be checked in / shipped without bundling it inside the API package.
// scripts/exportSeed.ts is run from apps/api, so go up two levels.
const SEED_DIR = path.resolve(process.cwd(), "..", "..", "data", "seed");

// User-flow collections — production user data must NEVER be exported into
// the seed snapshot, otherwise re-seeding into a fresh DB would create
// fake users / fake orders / etc. Keep this list in sync with importSeed.ts.
export const USER_FLOW_COLLECTIONS = [
  "users",
  "orders",
  "carts",
  "abandonedcarts",
  "addresses",
  "reviews",
  "customerreviews",
  "notifications",
  "vendors",
];

// Operational / transient collections that should never be part of seed.
const TRANSIENT_COLLECTIONS = [
  "system.indexes",
  "apilogs",
  "sessions",
  "payments",
  "wishlists",
];

const EXCLUDE_COLLECTIONS = [
  ...USER_FLOW_COLLECTIONS,
  ...TRANSIENT_COLLECTIONS,
];

async function exportSeedData() {
  try {
    console.log("Connecting to Database for Exporting...");
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB.");

    if (!fs.existsSync(SEED_DIR)) {
      fs.mkdirSync(SEED_DIR, { recursive: true });
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not resolved.");

    // Fetch all collections in the database
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    let exportedCount = 0;

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      if (EXCLUDE_COLLECTIONS.includes(collectionName)) {
        console.log(
          `Skipping collection (user-flow / transient): ${collectionName}`,
        );
        continue;
      }

      console.log(`Exporting collection: ${collectionName}...`);

      const documents = await db.collection(collectionName).find({}).toArray();

      if (documents.length > 0) {
        const filePath = path.join(SEED_DIR, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), "utf-8");
        console.log(
          `Successfully exported ${documents.length} records from ${collectionName}`,
        );
        exportedCount++;
      } else {
        console.log(`Collection ${collectionName} is empty, skipping.`);
      }
    }

    console.log(
      `Database exported successfully! Extracted data from ${exportedCount} collections into ${SEED_DIR}`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Export failed:", error);
    process.exit(1);
  }
}

exportSeedData();
