import React from "react";
import { User, Phone, Mail, MapPin, Truck, Edit2 } from "lucide-react";

interface SelectedAddressCardProps {
  address: any;
  onChangeClick: () => void;
  onAddNewClick: () => void;
  hasMultipleAddresses: boolean;
}

export default function SelectedAddressCard({
  address,
  onChangeClick,
  onAddNewClick,
  hasMultipleAddresses,
}: SelectedAddressCardProps) {
  if (!address) return null;

  return (
    <div className="bg-white border border-[rgba(145,158,171,0.24)] border-solid flex flex-col items-start overflow-clip relative rounded-[16px] w-full">
      {/* Header */}
      <div className="bg-gray-200 flex gap-[10px] items-center justify-between px-[24px] py-[16px] w-full">
        <h3 className="font-urbanist font-bold leading-[30px] text-light-primary-text text-[20px]">
          Address
        </h3>
        <button
          onClick={onAddNewClick}
          className="font-dm-sans font-semibold leading-[26px] text-primary text-[16px] hover:underline whitespace-nowrap"
        >
          Add New Address
        </button>
      </div>

      {/* Content */}
      <div className="flex items-start p-[24px] w-full">
        <div className="border border-gray-300 flex flex-1 flex-col items-start rounded-[12px]">
          {/* Card Header */}
          <div className="bg-white border-b border-[rgba(145,158,171,0.24)] flex items-center justify-between p-[16px] rounded-t-[12px] w-full">
            <h4 className="flex-1 font-urbanist font-bold leading-[30px] text-light-primary-text text-[20px]">
              {address.addressType === "office"
                ? "Office Address"
                : address.addressType === "others"
                  ? "Other Address"
                  : "Home Address"}
            </h4>
            {hasMultipleAddresses && (
              <button
                onClick={onChangeClick}
                className="border border-[rgba(145,158,171,0.32)] flex gap-[8px] items-center justify-center px-[10px] py-[4px] rounded-[80px] hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="size-[14px] text-light-primary-text" />
                <span className="font-dm-sans font-semibold leading-[22px] text-light-primary-text text-[13px]">
                  Change
                </span>
              </button>
            )}
          </div>

          {/* Details */}
          <div className="bg-white flex flex-col gap-[20px] p-[16px] rounded-b-[12px] w-full">
            <div className="flex gap-[12px] items-start w-full">
              <User className="shrink-0 size-5 text-light-secondary-text mt-0.5" />
              <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px]">
                {address.firstName} {address.lastName}
              </p>
            </div>

            <div className="flex gap-[12px] items-start w-full">
              <Phone className="shrink-0 size-5 text-light-secondary-text mt-0.5" />
              <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px]">
                {address.phoneNumber}
              </p>
            </div>

            <div className="flex gap-[12px] items-start w-full">
              <Mail className="shrink-0 size-5 text-light-secondary-text mt-0.5" />
              <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px]">
                {address.emailAddress}
              </p>
            </div>

            <div className="flex gap-[12px] items-start w-full">
              <MapPin className="shrink-0 size-5 text-light-secondary-text mt-0.5" />
              <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px]">
                {address.apartment ? `${address.apartment}, ` : ""}
                {address.city}, {address.state}, {address.zipCode},{" "}
                {address.country}
              </p>
            </div>

            <div className="flex gap-[12px] items-start w-full">
              <Truck className="shrink-0 size-5 text-light-secondary-text mt-0.5" />
              <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px]">
                {address.shipmentType === "flat"
                  ? "Flat Rate Shipment"
                  : address.shipmentType === "free"
                    ? "Free Shipment"
                    : address.shipmentType || "Standard Shipment"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
