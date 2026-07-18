import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Country, State, City } from "country-state-city";

// @desc    Get all countries
// @route   GET /api/locations/countries
// @access  Public
export const getCountries = asyncHandler(
  async (req: Request, res: Response) => {
    // country-state-city provides a nice .getAllCountries() which maps nicely
    const countries = Country.getAllCountries().map((country) => ({
      name: country.name,
      isoCode: country.isoCode,
      flag: country.flag,
      phonecode: country.phonecode,
      currency: country.currency,
    }));

    res.json({
      success: true,
      data: countries,
    });
  },
);

// @desc    Get states by country ISO code
// @route   GET /api/locations/states/:countryCode
// @access  Public
export const getStatesByCountry = asyncHandler(
  async (req: any, res: Response) => {
    const { countryCode } = req.params;

    if (!countryCode) {
      res.status(400);
      throw new Error("Country code is required");
    }

    const states = State.getStatesOfCountry(countryCode).map((state) => ({
      name: state.name,
      isoCode: state.isoCode,
      countryCode: state.countryCode,
    }));

    res.json({
      success: true,
      data: states,
    });
  },
);

// @desc    Get cities by country ISO code and state ISO code
// @route   GET /api/locations/cities/:countryCode/:stateCode
// @access  Public
export const getCitiesByState = asyncHandler(
  async (req: any, res: Response) => {
    const { countryCode, stateCode } = req.params;

    if (!countryCode || !stateCode) {
      res.status(400);
      throw new Error("Country code and state code are required");
    }

    const cities = City.getCitiesOfState(countryCode, stateCode).map(
      (city) => ({
        name: city.name,
        stateCode: city.stateCode,
        countryCode: city.countryCode,
      }),
    );

    res.json({
      success: true,
      data: cities,
    });
  },
);
