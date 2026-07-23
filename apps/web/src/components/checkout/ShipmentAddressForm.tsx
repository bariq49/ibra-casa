"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { fetchStatesAction, fetchCitiesAction } from "@/app/actions/location";
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

const SPAIN_COUNTRY = "Spain";
const SPAIN_ISO = "ES";

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
  onGuestAddressChange?: (address: Record<string, any> | null) => void;
  onProcessToPay?: (address: Record<string, any>) => void | Promise<void>;
  isEmbedded?: boolean;
  isProcessingPay?: boolean;
}

const ShipmentAddressForm = ({
  onAddressValid,
  onAddressSaved,
  onGuestAddressChange,
  onProcessToPay,
  isEmbedded = false,
  isProcessingPay = false,
}: ShipmentAddressFormProps) => {
  const { user, token, isAuthenticated, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [guestConfirmed, setGuestConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    country: SPAIN_COUNTRY,
    city: "",
    state: "",
    zipCode: "",
    apartment: "",
    addressType: "Home Address",
  });

  const [statesList, setStatesList] = useState<StateData[]>([]);
  const [citiesList, setCitiesList] = useState<CityData[]>([]);

  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const isFormValid = !!(
    formData.firstName &&
    formData.lastName &&
    formData.phoneNumber &&
    formData.emailAddress &&
    formData.country &&
    formData.city &&
    formData.state &&
    formData.zipCode
  );

  useEffect(() => {
    if (isAuthenticated) {
      const isValid = !!(isFormValid && addressId);
      if (onAddressValid) onAddressValid(isValid, addressId || undefined);
      return;
    }

    const isValid = isFormValid && guestConfirmed;
    if (onAddressValid) onAddressValid(isValid);
    if (onGuestAddressChange) {
      onGuestAddressChange(isValid ? { ...formData } : null);
    }
  }, [
    isFormValid,
    addressId,
    isAuthenticated,
    guestConfirmed,
    formData,
    onAddressValid,
    onGuestAddressChange,
  ]);

  // Spain provinces only
  useEffect(() => {
    const loadStates = async () => {
      const response = await fetchStatesAction(SPAIN_ISO);
      if (response.success) {
        setStatesList(response.data);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      const matchedState = statesList.find((s) => s.name === formData.state);
      if (matchedState) {
        const response = await fetchCitiesAction(
          SPAIN_ISO,
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
  }, [formData.state, statesList]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        emailAddress: user.email || "",
        country: SPAIN_COUNTRY,
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, country: SPAIN_COUNTRY }));
    if (!isAuthenticated) setGuestConfirmed(false);
  };

  const handleSave = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.emailAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast.error("Please fill in all mandatory address fields");
      return;
    }

    const spainZip = /^\d{5}$/;
    if (!spainZip.test(formData.zipCode.trim())) {
      toast.error("Please enter a valid 5-digit Spanish ZIP code");
      return;
    }

    const payload = { ...formData, country: SPAIN_COUNTRY };

    // Guest checkout: go straight to Stripe with this address
    if (!isAuthenticated || !user?._id) {
      setGuestConfirmed(true);
      if (onAddressValid) onAddressValid(true);
      if (onGuestAddressChange) onGuestAddressChange(payload);
      if (onProcessToPay) {
        await onProcessToPay(payload);
      }
      return;
    }

    try {
      setIsLoading(true);
      const response = await saveAddressAction(user._id, addressId, {
        ...payload,
        isDefault: true,
      });

      if (response.success && response.addresses) {
        toast.success(response.message);

        if (token) {
          login({ ...user, addresses: response.addresses }, token);

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
      {!isEmbedded && (
        <div className="bg-muted px-6 md:px-8 py-5 border-b border-border flex justify-between items-center">
          <h3 className="font-urbanist font-bold text-[20px] text-light-primary-text">
            Shipment Address
          </h3>
          {addressId || guestConfirmed ? (
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              Verified ✅
            </span>
          ) : null}
        </div>
      )}

      <fieldset
        disabled={isLoading || isProcessingPay}
        className={`p-6 md:p-8 flex flex-col gap-6 ${isLoading || isProcessingPay ? "opacity-60 pointer-events-none" : ""}`}
      >
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
            readOnly={isAuthenticated}
            disabled={isAuthenticated}
            placeholder="Email Address *"
            className={`w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors ${
              isAuthenticated
                ? "bg-muted/50 text-light-disabled-text cursor-not-allowed pointer-events-none"
                : "bg-background"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Country locked to Spain */}
          <input
            type="text"
            name="country"
            value={SPAIN_COUNTRY}
            readOnly
            disabled
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] bg-muted/50 text-light-disabled-text cursor-not-allowed"
            aria-label="Country / Region"
          />

          {statesList.length > 0 ? (
            <Popover open={openState} onOpenChange={setOpenState}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openState}
                  disabled={isLoading}
                  className="w-full h-[52px] justify-between bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-left font-normal"
                >
                  {formData.state ? formData.state : "Province *"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[300px] p-0 shadow-lg border-border z-9999">
                <Command>
                  <CommandInput placeholder="Search province..." />
                  <CommandList>
                    <CommandEmpty>No province found.</CommandEmpty>
                    <CommandGroup>
                      {statesList.map((st) => (
                        <CommandItem
                          key={st.isoCode}
                          value={st.name}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              country: SPAIN_COUNTRY,
                              state: st.name,
                              city: "",
                            }));
                            if (!isAuthenticated) setGuestConfirmed(false);
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
              disabled={isLoading}
              placeholder="Province *"
              className="w-full h-[52px] bg-background rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          )}

          {citiesList.length > 0 ? (
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  disabled={isLoading}
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
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              country: SPAIN_COUNTRY,
                              city: cityData.name,
                            }));
                            if (!isAuthenticated) setGuestConfirmed(false);
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
              disabled={isLoading}
              placeholder="City *"
              className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
            />
          )}

          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="ZIP Code * (e.g. 28001)"
            maxLength={5}
            inputMode="numeric"
            className="w-full h-[52px] rounded-[12px] border border-border px-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors"
          />
        </div>

        <textarea
          name="apartment"
          value={formData.apartment}
          onChange={handleInputChange}
          placeholder="Apartments, suit, unit, etc (Optional)"
          className="w-full min-h-[120px] rounded-[12px] border border-border p-4 font-dm-sans text-[16px] focus:border-primary outline-none transition-colors resize-y"
        ></textarea>

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
            disabled={!isFormValid || isLoading || isProcessingPay}
            className="h-[48px] px-10 rounded-[80px] bg-primary text-white font-dm-sans font-semibold text-[16px] hover:bg-primary-dark shadow-color-primary transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isProcessingPay
              ? isAuthenticated
                ? "Saving..."
                : "Processing..."
              : isAuthenticated
                ? "Save Address"
                : "Process to Pay"}
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default ShipmentAddressForm;
