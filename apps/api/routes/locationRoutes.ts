import express from "express";
import {
  getCountries,
  getStatesByCountry,
  getCitiesByState,
} from "../controllers/locationController.js";

const router = express.Router();

router.route("/countries").get(getCountries);
router.route("/states/:countryCode").get(getStatesByCountry);
router.route("/cities/:countryCode/:stateCode").get(getCitiesByState);

export default router;
