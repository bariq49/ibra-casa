import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const SEED_DIR = path.join(process.cwd(), "data", "seed");

// @desc    Synchronize seed configuration data into Mongo
// @route   POST /api/setup/sync-seed
// @access  Private/Admin
const syncSeedData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!fs.existsSync(SEED_DIR)) {
      res.status(404).json({ message: "Seed directory not found.", path: SEED_DIR });
      return;
    }

    const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith(".json"));
    if (files.length === 0) {
      res.status(404).json({ message: "No seed config files found.", path: SEED_DIR });
      return;
    }

    const db = mongoose.connection.db;
    if (!db) {
       res.status(500).json({ message: "Database not resolved" });
       return;
    }

    const report: Record<string, any> = {};

    for (const file of files) {
      const collectionName = file.replace(".json", "");
      const filePath = path.join(SEED_DIR, file);
      const rawData = fs.readFileSync(filePath, "utf-8");
      let data = JSON.parse(rawData);

      // Map string _id representation to actual Mongo ObjectIds
      data = data.map((doc: any) => {
         if (doc._id && typeof doc._id === "string") {
            try {
              doc._id = new mongoose.Types.ObjectId(doc._id);
            } catch (err) {
              // Ignore invalid objectIDs and let Mongo create a new one
            }
         }
         return doc;
      });

      if (data.length > 0) {
        // Safe upsert logic
        const bulkOps = data.map((doc: any) => {
          const filter = { _id: doc._id };
          return {
            updateOne: {
              filter,
              update: { $set: doc },
              upsert: true
            }
          };
        });

        const result = await db.collection(collectionName).bulkWrite(bulkOps);
        report[collectionName] = {
          processed: data.length,
          matched: result.matchedCount,
          upserted: result.upsertedCount,
          modified: result.modifiedCount
        };
      }
    }

    res.json({
       success: true,
       message: "Database seed configuration synchronized successfully.",
       report
    });
  } catch (error: any) {
    console.error("API Seed Import failed:", error);
    res.status(500).json({ message: "Import failed", error: error?.message });
  }
};

export { syncSeedData };
