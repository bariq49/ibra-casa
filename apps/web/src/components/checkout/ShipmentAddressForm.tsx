"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import {
  fetchCountriesAction,
  fetchStatesAction,
  fetchCitiesAction,
} from "@/app/actions/location";
import { saveAddressAction } from "@/app/actions/address";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Country {
  name: string;
  isoCode: string;
}

interface StateData {
  name: string;
  isoCode: string;
  countryCode: string;
}

interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
}

interface ShipmentAddressFormProps {
  onAddressValid?: (isValid: boolean, id?: string) => void;
  onAddressSaved?: (id: string) => void;
  isEmbedded?: boolean;
}

const ShipmentAddressForm = ({
  onAddressValid,
  onAddressSaved,
  isEmbedded = false,
}: ShipmentAddressFormProps) => {
  const { user, token, isAuthenticated, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [addressId, setAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    apartment: "",
    deliveryTime: "08:00 AM - 11:00 AM",
    shipmentType: "Flat Rate Shipment",
    addressType: "Home Address",
  });

  // Dynamic Location Data States
  const [countries, setCountries] = useState<Country[]>([]);
  const [statesList, setStatesList] = useState<StateData[]>([]);
  const [citiesList, setCitiesList] = useState<CityData[]>([]);

  // Combobox Popover States
  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const isFormValid = !!(
    formData.firstName &&
    formData.lastName &&
    formData.phoneNumber &&
    formData.country &&
    formData.city &&
    formData.state &&
    formData.zipCode
  );

  // Check validity whenever data changes
  useEffect(() => {
    const isValid = !!(
      isFormValid &&
      addressId // An address physically exists on the backend
    );
    if (onAddressValid) onAddressValid(isValid, addressId || undefined);
  }, [isFormValid, addressId, onAddressValid]);

  useEffect(() => {
    const loadCountries = async () => {
      const response = await fetchCountriesAction();
      if (response.success) {
        setCountries(response.data);
      }
    };
    loadCountries();
  }, []);

  // Fetch States when a native Country changes
  useEffect(() => {
    const loadStates = async () => {
      const matchedCountry = countries.find((c) => c.name === formData.country);
      if (matchedCountry) {
        const response = await fetchStatesAction(matchedCountry.isoCode);
        if (response.success) {
          setStatesList(response.data);
        }
      } else {
        setStatesList([]);
        setCitiesList([]);
      }
    };
    loadStates();
  }, [formData.country, countries]);

  // Fetch Cities when State explicitly changes
  useEffect(() => {
    const loadCities = async () => {
      const matchedCountry = countries.find((c) => c.name === formData.country);
      const matchedState = statesList.find((s) => s.name === formData.state);

      if (matchedCountry && matchedState) {
        const response = await fetchCitiesAction(
          matchedCountry.isoCode,
          matchedState.isoCode,
        );
        if (response.success) {
          setCitiesList(response.data);
        }
      } else {
        setCitiesList([]);
      }
    };
    loadCities();
  }, [formData.state, formData.country, countries, statesList]);

  // Prefill from user profile on mount
  useEffect(() => {
    if (user) {
      // Only prefill personal details for a new address, not geographic ones from an old address
      setFormData((prev) => ({
        ...prev,
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        emailAddress: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?._id) return;

    // Validate requirements
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.country ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast.error("Please fill in all mandatory address fields");
      return;
    }

    try {
      setIsLoading(true);
      const payload = { ...formData, isDefault: true };

      const response = await saveAddressAction(user._id, addressId, payload);

      if (response.success && response.addresses) {
        toast.success(response.message);

        // Update local zustand store so it persists visually immediately
        if (token) {
          login({ ...user, addresses: response.addresses }, token);

          // Extract new ID if created
          const updatedDefault = response.addresses.find(
            (a: any) => a.isDefault,
          );
          if (updatedDefault?._id) {
            setAddressId(updatedDefault._id);
            if (onAddressSaved) onAddressSaved(updatedDefault._id);
          }
        }
      } else {
        toast.error(response.message || "Failed to save address");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Internal Client Error saving address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full flex flex-col bg-background border border-border rounded-[16px] overflow-hidden ${
        isEmbedded ? "" : "mt-8 lg:mt-0"
      }`}
    >
      {/* Header */}
      {!isEmbedded && (
        <div className="bg-muted px-6 md:px-8 py-5 border-b border-border flex justify-between items-center">
          <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text">
            Shipment Address
          </h3>
          {addressId && (
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              Verified ✅
            </span>
          )}
        </div>
      )}

      <fieldset
        disabled={!isAuthenticated || isLoading}
        className={`p-6 md:p-8 flex flex-col gap-6 ${!isAuthenticated || isLoading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {/* Row 1 & 2 - Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name *"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name *"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
          />
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Phone Number *"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
          />
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleInputChange}
            readOnly
            disabled
            placeholder="Email Address"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors bg-muted/50 text-light-disabled-text cursor-not-allowed pointer-events-none"
          />
        </div>

        {/* Row 3 & 4 - Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Country Combobox */}
          <Popover open={openCountry} onOpenChange={setOpenCountry}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCountry}
                disabled={!isAuthenticated || isLoading}
                className="w-full h-[52px] justify-between bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-left font-normal"
              >
                {formData.country ? formData.country : "Country / Region *"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[300px] p-0 shadow-lg border-border z-9999">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.isoCode}
                        value={country.name}
                        onSelect={(currentValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            country: country.name,
                            state: "",
                            city: "",
                          }));
                          setOpenCountry(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.country === country.name
                              ? "opacity-100 text-primary"
                              : "opacity-0",
                          )}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* State Combobox or Input */}
          {statesList.length > 0 ? (
            <Popover open={openState} onOpenChange={setOpenState}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openState}
                  disabled={!isAuthenticated || isLoading}
                  className="w-full h-[52px] justify-between bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-left font-normal"
                >
                  {formData.state ? formData.state : "State / Province *"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[300px] p-0 shadow-lg border-border z-9999">
                <Command>
                  <CommandInput placeholder="Search state..." />
                  <CommandList>
                    <CommandEmpty>No state found.</CommandEmpty>
                    <CommandGroup>
                      {statesList.map((st) => (
                        <CommandItem
                          key={st.isoCode}
                          value={st.name}
                          onSelect={(currentValue) => {
                            setFormData((prev) => ({
                              ...prev,
                              state: st.name,
                              city: "",
                            }));
                            setOpenState(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.state === st.name
                                ? "opacity-100 text-primary"
                                : "opacity-0",
                            )}
                          />
                          {st.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              disabled={!isAuthenticated || isLoading}
              placeholder="State *"
              className="w-full h-[52px] bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          )}

          {/* City Combobox or Input */}
          {citiesList.length > 0 ? (
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                  <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  disabled={!isAuthenticated || isLoading}
                  className="w-full h-[52px] justify-between bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-left font-normal"
                >
                  {formData.city ? formData.city : "City *"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[300px] p-0 shadow-lg border-border z-9999">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {citiesList.map((cityData) => (
                        <CommandItem
                          key={cityData.name}
                          value={cityData.name}
                          onSelect={(currentValue) => {
                            setFormData((prev) => ({
                              ...prev,
                              city: cityData.name,
                            }));
                            setOpenCity(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.city === cityData.name
                                ? "opacity-100 text-primary"
                                : "opacity-0",
                            )}
                          />
                          {cityData.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!isAuthenticated || isLoading}
              placeholder="City *"
              className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
            />
          )}

          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            disabled={!isAuthenticated || isLoading}
            placeholder="ZIP Code *"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
          />
        </div>

        {/* Text area */}
        <textarea
          name="apartment"
          value={formData.apartment}
          onChange={handleInputChange}
          placeholder="Apartments, suit, unit, etc (Optional)"
          className="w-full min-h-[120px] rounded-[12px] border border-border p-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors resize-y"
        ></textarea>

        {/* Delivery Time */}
        <div className="flex flex-col gap-3 mt-2">
          <span className="font-dm-sans text-[15px] font-medium text-light-secondary-text">
            Delivery Time
          </span>
          <div className="flex gap-4 flex-wrap">
            {[
              "08:00 AM - 11:00 AM",
              "11:00 AM - 03:00 PM",
              "02:00 PM - 04:00 PM",
              "04:00 PM - 08:00 PM",
            ].map((time, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="deliveryTime"
                  value={time}
                  checked={formData.deliveryTime === time}
                  onChange={handleInputChange}
                  className="size-5 accent-primary text-primary focus:ring-primary border-border"
                />
                <span className="font-dm-sans text-[14px] text-light-primary-text group-hover:text-primary transition-colors">
                  {time}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Shipment Type */}
        <div className="flex flex-col gap-3 mt-2">
          <span className="font-dm-sans text-[15px] font-medium text-light-secondary-text">
            Shipment Type
          </span>
          <div className="flex gap-8 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="shipmentType"
                value="Flat Rate Shipment"
                checked={formData.shipmentType === "Flat Rate Shipment"}
                onChange={handleInputChange}
                className="size-5 accent-primary text-primary focus:ring-primary border-border"
              />
              <span className="font-dm-sans text-[14px] text-light-primary-text group-hover:text-primary transition-colors">
                Flat Rate Shipment
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="shipmentType"
                value="Free Shipment"
                checked={formData.shipmentType === "Free Shipment"}
                onChange={handleInputChange}
                className="size-5 accent-primary text-primary focus:ring-primary border-border"
              />
              <span className="font-dm-sans text-[14px] text-light-primary-text group-hover:text-primary transition-colors">
                Free Shipment
              </span>
            </label>
          </div>
        </div>

        {/* Address Type */}
        <div className="flex flex-col gap-3 mt-2">
          <span className="font-dm-sans text-[15px] font-medium text-light-secondary-text">
            Address Type
          </span>
          <div className="flex gap-8 flex-wrap">
            {["Home Address", "Office Address", "Others"].map((type, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="addressType"
                  value={type}
                  checked={formData.addressType === type}
                  onChange={handleInputChange}
                  className="size-5 accent-primary text-primary focus:ring-primary border-border"
                />
                <span className="font-dm-sans text-[14px] text-light-primary-text group-hover:text-primary transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-4">
          <button
            type="button"
            className="h-[48px] px-8 rounded-[80px] bg-background border border-border font-dm-sans font-semibold text-[16px] text-light-primary-text hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className="h-[48px] px-10 rounded-[80px] bg-primary text-white font-dm-sans font-semibold text-[16px] hover:bg-primary-dark shadow-color-primary transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Address"}
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default ShipmentAddressForm;
