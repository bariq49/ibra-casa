import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/common/products/ProductCard";
import Cookies from "js-cookie";
import { toast } from "sonner";
import api, { API_ENDPOINTS } from "@/lib/api";
import { useHeaderStore } from "./useHeaderStore";

export interface WishlistStore {
  wishlistItems: Product[];
  toggleWishlist: (product: Product) => Promise<any> | null;
  isInWishlist: (productId: number | string) => boolean;
  setWishlistItems: (items: Product[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      
      setWishlistItems: (items) => set({ wishlistItems: items }),

      clearWishlist: () => set({ wishlistItems: [] }),

      toggleWishlist: (product) => {
        if (!Cookies.get("token")) {
          useHeaderStore.getState().onAuthOpen("login");
          return null;
        }

        const pId = (product as any)._id || product.id;
        const exists = get().wishlistItems.find(
          (item) => ((item as any)._id || item.id) === pId,
        );

        // Optimistic update
        set((state) => {
          if (exists) {
            return {
              wishlistItems: state.wishlistItems.filter(
                (item) => ((item as any)._id || item.id) !== pId,
              ),
            };
          } else {
            return {
              wishlistItems: [...state.wishlistItems, product],
            };
          }
        });

        // Sync with backend
        let req;
        if (exists) {
          req = api.delete(API_ENDPOINTS.WISHLIST.REMOVE, {
             productId: pId 
          });
        } else {
          req = api.post(API_ENDPOINTS.WISHLIST.ADD, {
            productId: pId
          });
        }

        req.catch(error => console.error("Wishlist API Sync Error", error));
        return req;
      },

      isInWishlist: (productId) => {
        return get().wishlistItems.some(
          (item) => ((item as any)._id || item.id) === productId,
        );
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        wishlistItems: state.wishlistItems.map((item) => ({
          _id: (item as any)._id || item.id,
          id: item.id,
        })),
      }),
    },
  ),
);
