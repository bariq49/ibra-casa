import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

// Base currency for the platform: prices are stored in USD in the database.
// `rate` = how many units of the target currency equal 1 USD.
// Update this table (or swap for a live FX provider / DB-backed rates) as needed.
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", rate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", rate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", rate: 0.79 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", rate: 1.35 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", rate: 1.52 },
];

// @desc    Get supported currencies and their exchange rates relative to USD (base)
// @route   GET /api/currencies
// @access  Public
export const getCurrencies = asyncHandler(
  async (_req: Request, res: Response) => {
    res.json({
      success: true,
      base: "USD",
      data: CURRENCIES,
    });
  },
);
