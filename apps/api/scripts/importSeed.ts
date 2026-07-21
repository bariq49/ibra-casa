import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Read the snapshot from the repository root (../../data/seed relative to apps/api).
const SEED_DIR = path.resolve(process.cwd(), "..", "..", "data", "seed");

// PRODUCTION SAFETY: never reseed user-flow collections, even if a stale
// JSON for them happens to exist in data/seed/. Keep in sync with exportSeed.ts.
const USER_FLOW_COLLECTIONS = [
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

// Catalog collections we fully replace on every seed so old products/categories
// do not linger after the JSON snapshot is slimmed down.
const REPLACE_COLLECTIONS = [
  "products",
  "categories",
  "sizes",
  "colors",
  "brands",
  "productbases",
  "producttypes",
  "weights",
  "menus",
  "banners",
  "adsbanners",
  "bannerpages",
  "purchases",
  "badges",
  "pagebanners",
  "blogs",
  "blogauthors",
  "blogcategories",
  "blogtags",
  "comments",
  "todaysoffers",
];

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

/** Keys that look like hex but are never Mongo ObjectIds. */
const SKIP_OBJECT_ID_KEYS = new Set([
  "value", // color hex / size codes
  "bgColor",
  "textColor",
  "cardColor",
  "bg",
  "slug",
  "name",
  "title",
  "description",
  "image",
  "icon",
  "href",
  "buttonHref",
  "link",
]);

function castObjectIds(value: unknown, key?: string): unknown {
  if (key && SKIP_OBJECT_ID_KEYS.has(key)) {
    return value;
  }

  if (typeof value === "string" && OBJECT_ID_RE.test(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => castObjectIds(item, key));
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = castObjectIds(v, k);
    }
    return out;
  }

  return value;
}

async function importSeedData() {
  try {
    console.log("Connecting to Database for Seeding...");
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected.");

    if (!fs.existsSync(SEED_DIR)) {
      console.error("ERROR: Seed directory not found at " + SEED_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".json"));
    if (files.length === 0) {
      console.log("No seed files found.");
      process.exit(0);
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not resolved.");

    for (const file of files) {
      const collectionName = file.replace(".json", "");

      if (USER_FLOW_COLLECTIONS.includes(collectionName)) {
        console.log(`Skipping user-flow collection: ${collectionName}`);
        continue;
      }

      console.log(`Importing to collection: ${collectionName}...`);

      const filePath = path.join(SEED_DIR, file);
      const rawData = fs.readFileSync(filePath, "utf-8");
      let data: any[] = JSON.parse(rawData);

      // Cast _id and all ObjectId-looking ref fields (category, brand, colors, …)
      data = data.map((doc: any) => castObjectIds(doc) as any);

      if (REPLACE_COLLECTIONS.includes(collectionName)) {
        const deleted = await db.collection(collectionName).deleteMany({});
        console.log(
          `Cleared ${deleted.deletedCount} existing docs from ${collectionName}`,
        );
      }

      if (data.length > 0) {
        const bulkOps = data.map((doc: any) => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: doc },
            upsert: true,
          },
        }));

        const result = await db.collection(collectionName).bulkWrite(bulkOps);
        console.log(
          `Successfully synced ${data.length} records into ${collectionName} ` +
            `(Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount})`,
        );
      } else {
        console.log(`No documents to insert for ${collectionName}.`);
      }
    }

    console.log("Database seeded successfully! Your demo store is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importSeedData();
