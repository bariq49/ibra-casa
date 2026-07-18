import express from "express";
import { getCurrencies } from "../controllers/currencyController.js";

const router = express.Router();

router.route("/").get(getCurrencies);

export default router;
