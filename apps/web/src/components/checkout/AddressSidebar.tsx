import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import ShipmentAddressForm from "./ShipmentAddressForm";
import { Check, MapPin, Plus } from "lucide-react";

interface AddressSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (addressId: string) => void;
  selectedAddressId: string | null;
  mode: "list" | "add";
  onModeChange: (mode: "list" | "add") => void;
}

export default function AddressSidebar({
  isOpen,
  onOpenChange,
  onAddressSelect,
  selectedAddressId,
  mode,
  onModeChange,
}: AddressSidebarProps) {
  const { user } = useAuthStore();
  const existingAddresses = user?.addresses || [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-background overflow-y-auto z-[1000] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="font-urbanist text-2xl font-bold text-light-primary-text">
            {mode === "add" ? "Add New Address" : "Select Shipping Address"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {mode === "add" ? (
            <div className="p-6">
              <Button
                variant="ghost"
                className="mb-6 -ml-4"
                onClick={() => onModeChange("list")}
              >
                ← Back to Addresses
              </Button>
              {/* Inherit the existing ShipmentAddressForm logic tightly, overriding its layout purely to stack */}
              <div className="flex flex-col gap-6 w-full">
                <ShipmentAddressForm
                  onAddressSaved={(id) => {
                    if (id) {
                      onAddressSelect(id);
                      onModeChange("list");
                      onOpenChange(false);
                    }
                  }}
                  isEmbedded={true}
                />
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full h-auto py-4 border-dashed border-2 flex items-center justify-center gap-2 hover:bg-gray-50"
                onClick={() => onModeChange("add")}
              >
                <Plus className="size-5" />
                Add New Address
              </Button>

              <div className="flex flex-col gap-4 mt-4">
                {existingAddresses.map((addr: any) => (
                  <div
                    key={addr._id}
                    className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                    onClick={() => {
                      onAddressSelect(addr._id);
                      onOpenChange(false);
                    }}
                  >
                    {selectedAddressId === addr._id && (
                      <div className="absolute top-4 right-4 text-primary">
                        <Check className="size-5" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 pr-8">
                      <p className="font-urbanist font-bold text-light-primary-text text-lg flex items-center gap-2">
                        {addr.addressType === "office"
                          ? "Office"
                          : addr.addressType === "others"
                            ? "Other"
                            : "Home"}
                        {addr.isDefault && (
                          <span className="text-xs bg-gray-200 text-light-secondary-text px-2 py-0.5 rounded-full font-dm-sans font-medium">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="font-dm-sans text-light-secondary-text text-sm">
                        {addr.firstName} {addr.lastName} • {addr.phoneNumber}
                      </p>
                      <div className="flex items-start gap-2 mt-2">
                        <MapPin className="size-4 shrink-0 text-light-secondary-text mt-0.5" />
                        <p className="font-dm-sans text-light-secondary-text text-sm leading-relaxed">
                          {addr.apartment ? `${addr.apartment}, ` : ""}
                          {addr.city}, {addr.state}, {addr.zipCode},{" "}
                          {addr.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
