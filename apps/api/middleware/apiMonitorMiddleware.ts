import { Request, Response, NextFunction } from "express";
import ApiLog from "../models/apiLogModel.js";
import SystemConfig from "../models/systemConfigModel.js";

const MAX_LOGS = 10000;
let isCleanupIntervalSet = false;

// Auto-cleanup interval to prevent storage exhaustion
if (!isCleanupIntervalSet) {
  setInterval(
    () => {
      ApiLog.countDocuments()
        .then((count) => {
          if (count > MAX_LOGS) {
            console.log(
              `[API Monitor] Storage limit exceeded (${count} > ${MAX_LOGS}). Flushing old logs...`,
            );
            // Delete all to keep storage clean, or optionally keep the newest 1000
            ApiLog.deleteMany({})
              .then(() => {
                console.log("[API Monitor] Flushed all API logs successfully.");
              })
              .catch((err) =>
                console.error("[API Monitor] Error flushing logs:", err),
              );
          }
        })
        .catch(console.error);
    },
    60 * 60 * 1000,
  ); // Check every 1 hour
  isCleanupIntervalSet = true;
}

// In-memory cache for API log level
let cachedApiLogLevel: "all" | "error" | "success" | "none" | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000 * 5; // 5 minutes

export const clearConfigCache = () => {
  cachedApiLogLevel = null;
  lastCacheTime = 0;
};

const getLogLevel = async () => {
  const now = Date.now();
  if (cachedApiLogLevel && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedApiLogLevel;
  }

  try {
    const config = await SystemConfig.findOne();
    if (config && config.apiLogLevel) {
      cachedApiLogLevel = config.apiLogLevel;
    } else {
      cachedApiLogLevel = "error"; // default
    }
  } catch (error) {
    cachedApiLogLevel = "error"; // fallback on error
  }

  lastCacheTime = now;
  return cachedApiLogLevel;
};

/**
 * Middleware to monitor and log all incoming API requests
 * Calculates response time and logs to the database asynchronously.
 */
export const apiMonitorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Start high-resolution timer
  const startHrTime = process.hrtime();

  // We only want to track our main `/api` requests, excluding the stats/logs endpoint itself
  // to prevent infinite recursive logging when the dashboard checks metrics.
  if (req.originalUrl.includes("/api/stats")) {
    return next();
  }

  // Exclude swagger docs
  if (req.originalUrl.includes("/api/docs")) {
    return next();
  }

  // Hook into the finish event of the response to log after it completes
  res.on("finish", async () => {
    // Check the config level
    const logLevel = await getLogLevel();

    if (logLevel === "none") return;

    const isError = res.statusCode >= 400;

    if (logLevel === "error" && !isError) return;
    if (logLevel === "success" && isError) return;
    // If "all", we proceed naturally

    // Calculate elapsed time in milliseconds
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    // Build log data
    const logData = {
      method: req.method,
      originalUrl: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(elapsedTimeInMs),
      ip: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      // Optional: We can't trivially capture the JSON response body via standard middleware
      // without overriding res.send/res.json. For this scope, tracking the status code natively suffices.
      errorObj: isError ? { message: res.statusMessage } : null,
    };

    // Save asynchronously without blocking the thread
    ApiLog.create(logData).catch((err) => {
      console.error("❌ Failed to save API Log to database:", err);
    });
  });

  next();
};
