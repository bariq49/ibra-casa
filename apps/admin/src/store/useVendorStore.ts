import { create } from "zustand";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type VendorRecord = {
  _id: string;
  userId: string;
  storeName: string;
  registrationNumber?: string;
  description?: string;
  logo?: string;
  status: VendorStatus;
  rejectionReason?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type VendorState = {
  vendor: VendorRecord | null;
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchVendor: () => Promise<void>;
  setVendor: (vendor: VendorRecord | null) => void;
  reset: () => void;
};

const useVendorStore = create<VendorState>((set) => ({
  vendor: null,
  loading: false,
  error: null,
  fetched: false,

  fetchVendor: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await adminApi.get(ADMIN_API_ENDPOINTS.VENDOR_ME);
      set({ vendor: data?.data ?? null, loading: false, fetched: true });
    } catch (err: unknown) {
      set({
        vendor: null,
        loading: false,
        fetched: true,
        error: getErrorMessage(err, "Failed to load vendor"),
      });
    }
  },

  setVendor: (vendor) => set({ vendor, fetched: true }),

  reset: () =>
    set({ vendor: null, loading: false, error: null, fetched: false }),
}));

export default useVendorStore;
