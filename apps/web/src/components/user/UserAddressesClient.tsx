"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import AddressSidebar from "@/components/checkout/AddressSidebar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAddressAction, saveAddressAction } from "@/app/actions/address";
import { useTranslations } from "next-intl";

export default function UserAddressesClient() {
  const { user, login, token } = useAuthStore();
  const [addressSidebarOpen, setAddressSidebarOpen] = useState(false);
  const [addressSidebarMode, setAddressSidebarMode] = useState<"list" | "add">("add");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const existingAddresses = user?.addresses || [];

  const handleMakeDefault = async (address: any) => {
    if (!user?._id || !token) return;
    
    try {
      const payload = { ...address, isDefault: true };
      const res = await saveAddressAction(user._id, address._id, payload);
      if (res.success && res.addresses) {
        toast.success("Default address updated!");
        login({ ...user, addresses: res.addresses }, token);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("Failed to update default address.");
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user?._id || !token) return;
    try {
      setDeletingId(addressId);
      const res = await deleteAddressAction(user._id, addressId);
      if (res.success && res.addresses) {
        toast.success("Address deleted successfully");
        login({ ...user, addresses: res.addresses }, token);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[16px] shadow-sm border border-border">
        <div>
          <h2 className="text-[20px] font-bold font-urbanist text-light-primary-text">
            My Addresses
          </h2>
          <p className="text-[14px] font-dm-sans text-light-secondary-text mt-1">
            Manage your shipping and billing addresses to streamline your checkout process.
          </p>
        </div>
        <Button
          onClick={() => {
            setAddressSidebarMode("add");
            setAddressSidebarOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white rounded-full font-dm-sans font-semibold sm:px-6 w-full sm:w-auto"
        >
          <Plus className="size-4 mr-2" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingAddresses.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-[16px] border border-border text-center flex flex-col items-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MapPin className="size-8 text-light-disabled-text" />
            </div>
            <h3 className="font-urbanist font-bold text-lg text-light-primary-text">No Addresses Found</h3>
            <p className="font-dm-sans text-light-secondary-text mt-2 max-w-sm">
              You haven't saved any addresses yet. Add one now for a faster checkout experience.
            </p>
            <Button
              onClick={() => {
                setAddressSidebarMode("add");
                setAddressSidebarOpen(true);
              }}
              variant="outline"
              className="mt-6 rounded-full"
            >
              Add New Address
            </Button>
          </div>
        ) : (
          existingAddresses.map((addr: any) => (
            <Card key={addr._id} className="p-6 rounded-[16px] shadow-sm flex flex-col justify-between border-border overflow-hidden relative group">
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-primary/10 text-primary font-bold text-[12px] px-3 py-1 rounded-bl-[12px]">
                  Default Address
                </div>
              )}
              
              <div className="flex flex-col gap-1 pr-8">
                <p className="font-urbanist font-bold text-light-primary-text text-lg flex items-center gap-2">
                  {addr.addressType === "office" ? "Office Dashboard" : addr.addressType === "others" ? "Other Place" : "Home Address"}
                </p>
                <p className="font-dm-sans text-light-secondary-text text-sm mt-1">
                  {addr.firstName} {addr.lastName} • {addr.phoneNumber}
                </p>
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="size-4 shrink-0 text-light-secondary-text mt-0.5" />
                  <p className="font-dm-sans text-light-secondary-text text-[15px] leading-relaxed">
                    {addr.apartment ? `${addr.apartment}, ` : ""}
                    {addr.city}, {addr.state}, {addr.zipCode}, {addr.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border mt-auto">
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    onClick={() => handleMakeDefault(addr)}
                    className="text-primary hover:text-primary hover:bg-primary/5 px-3 h-9 text-[14px]"
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    Make Default
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 h-9 text-[14px] ml-auto">
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this address? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(addr._id)}
                        disabled={deletingId === addr._id}
                        className="bg-error hover:bg-error/90 text-white"
                      >
                        {deletingId === addr._id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))
        )}
      </div>

      <AddressSidebar
        isOpen={addressSidebarOpen}
        onOpenChange={setAddressSidebarOpen}
        onAddressSelect={() => {
          // No action needed for selection in dashboard, just close
          setAddressSidebarOpen(false);
        }}
        selectedAddressId={null}
        mode={addressSidebarMode}
        onModeChange={setAddressSidebarMode}
      />
    </div>
  );
}
