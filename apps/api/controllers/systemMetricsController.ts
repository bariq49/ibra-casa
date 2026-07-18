import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import ApiLog from "../models/apiLogModel.js";
import { clearConfigCache } from "../middleware/apiMonitorMiddleware.js";
import {
  getOrCreateSystemConfig,
  getStoreSettings as loadStoreSettings,
} from "../utils/storeSettings.js";

/**
 * @desc    Get paginated chronological API logs
 * @route   GET /api/system-metrics/logs
 * @access  Private/Admin
 */
export const getApiLogs = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await ApiLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await ApiLog.countDocuments({});

    res.json({
      success: true,
      logs,
      pagination: {
        total: totalLogs,
        page,
        pages: Math.ceil(totalLogs / limit),
      },
    });
  },
);

/**
 * @desc    Get aggregated API metrics summary
 * @route   GET /api/system-metrics/summary
 * @access  Private/Admin
 */
export const getApiMetricsSummary = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // Basic aggregation counts
    const totalRequests = await ApiLog.countDocuments();
    const errorRequests = await ApiLog.countDocuments({
      statusCode: { $gte: 400 },
    });
    const successRequests = totalRequests - errorRequests;

    // A rough "uptime" tracking success vs fail ratio based on all recorded traffic
    const uptimeRatio =
      totalRequests > 0 ? (successRequests / totalRequests) * 100 : 100;

    // Aggregating Average Response Time safely
    const avgResponseData = await ApiLog.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$responseTimeMs" },
        },
      },
    ]);

    const averageResponseTime =
      avgResponseData.length > 0 ? Math.round(avgResponseData[0].avgTime) : 0;

    res.json({
      success: true,
      summary: {
        totalRequests,
        errorRequests,
        successRequests,
        uptimeRatio: parseFloat(uptimeRatio.toFixed(2)),
        averageResponseTime,
      },
    });
  },
);

/**
 * @desc    Flush all API logs
 * @route   DELETE /api/system-metrics/flush
 * @access  Private/Admin
 */
export const flushApiLogs = expressAsyncHandler(
  async (req: Request, res: Response) => {
    await ApiLog.deleteMany({});
    res.json({
      success: true,
      message: "All API logs have been successfully flushed.",
    });
  },
);

/**
 * @desc    Get system configuration
 * @route   GET /api/system-metrics/config
 * @access  Private/Admin
 */
export const getSystemConfig = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const config = await getOrCreateSystemConfig();

    res.json({
      success: true,
      config,
    });
  },
);

/**
 * @desc    Get public store settings (payment methods, tax, shipping)
 * @route   GET /api/system-metrics/store-settings
 * @access  Public
 */
export const getStoreSettings = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const settings = await loadStoreSettings();

    res.json({
      success: true,
      settings: {
        enableStripe: settings.enableStripe,
        enableCod: settings.enableCod,
        enableBankTransfer: settings.enableBankTransfer,
        enablePaypal: settings.enablePaypal,
        taxRate: settings.taxRate,
        shippingCost: settings.shippingCost,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        currency: settings.currency,
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
      },
    });
  },
);

/**
 * @desc    Update system / store configuration
 * @route   PUT /api/system-metrics/config
 * @access  Private/Admin
 */
export const updateSystemConfig = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const {
      apiLogLevel,
      enableStripe,
      enableCod,
      enableBankTransfer,
      enablePaypal,
      taxRate,
      shippingCost,
      freeDeliveryThreshold,
      currency,
      storeName,
      supportEmail,
    } = req.body;

    if (
      apiLogLevel !== undefined &&
      !["all", "error", "success", "none"].includes(apiLogLevel)
    ) {
      res.status(400);
      throw new Error(
        "Invalid API log level. Allowed: all, error, success, none",
      );
    }

    const config = await getOrCreateSystemConfig();

    const nextStripe =
      typeof enableStripe === "boolean" ? enableStripe : config.enableStripe;
    const nextCod =
      typeof enableCod === "boolean" ? enableCod : config.enableCod;

    if (nextStripe === false && nextCod === false) {
      res.status(400);
      throw new Error(
        "At least one payment method (Stripe or COD) must stay enabled.",
      );
    }

    if (apiLogLevel !== undefined) config.apiLogLevel = apiLogLevel;
    if (typeof enableStripe === "boolean") config.enableStripe = enableStripe;
    if (typeof enableCod === "boolean") config.enableCod = enableCod;
    if (typeof enableBankTransfer === "boolean")
      config.enableBankTransfer = enableBankTransfer;
    if (typeof enablePaypal === "boolean") config.enablePaypal = enablePaypal;
    if (typeof taxRate === "number") config.taxRate = taxRate;
    if (typeof shippingCost === "number") config.shippingCost = shippingCost;
    if (typeof freeDeliveryThreshold === "number")
      config.freeDeliveryThreshold = freeDeliveryThreshold;
    if (typeof currency === "string" && currency.trim())
      config.currency = currency.trim().toUpperCase();
    if (typeof storeName === "string") config.storeName = storeName.trim();
    if (typeof supportEmail === "string")
      config.supportEmail = supportEmail.trim();

    const updatedConfig = await config.save();
    clearConfigCache();

    res.json({
      success: true,
      config: updatedConfig,
    });
  },
);
