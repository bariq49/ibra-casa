import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/common/products/ProductCard";
import Cookies from "js-cookie";
import api, { API_ENDPOINTS } from "@/lib/api";

export interface WishlistStore {
  wishlistItems: Product[];
  toggleWishlist: (product: Product) => Promise<any> | null;
  isInWishlist: (productId: number | string) => boolean;
  setWishlistItems: (items: Product[]) => void;
  clearWishlist: () => void;
}

const isAuthenticated = () => Boolean(Cookies.get("token"));

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistItems: [],

      setWishlistItems: (items) => set({ wishlistItems: items }),

      clearWishlist: () => set({ wishlistItems: [] }),

      toggleWishlist: (product) => {
        const pId = (product as any)._id || product.id;
        const exists = get().wishlistItems.find(
          (item) => ((item as any)._id || item.id) === pId,
        );

        set((state) => {
          if (exists) {
            return {
              wishlistItems: state.wishlistItems.filter(
                (item) => ((item as any)._id || item.id) !== pId,
              ),
            };
          }
          return {
            wishlistItems: [...state.wishlistItems, product],
          };
        });

        // Guests keep wishlist in localStorage only
        if (!isAuthenticated()) return Promise.resolve({ guest: true });

        let req;
        if (exists) {
          req = api.delete(API_ENDPOINTS.WISHLIST.REMOVE, {
            productId: pId,
          });
        } else {
          req = api.post(API_ENDPOINTS.WISHLIST.ADD, {
            productId: pId,
          });
        }

        req.catch((error) => console.error("Wishlist API Sync Error", error));
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
        wishlistItems: state.wishlistItems.map((item) => {
          const p = item as any;
          return {
            _id: p._id || p.id,
            id: p.id || p._id,
            name: p.name || p.title,
            title: p.title || p.name,
            price: p.price,
            currentPrice: p.currentPrice,
            oldPrice: p.oldPrice,
            discountPercentage: p.discountPercentage ?? p.discount,
            discount: p.discount ?? p.discountPercentage,
            image: p.image || p.images?.[0],
            images: p.images,
            slug: p.slug,
            stock: p.stock,
            ratings: p.ratings,
          };
        }),
      }),
    },
  ),
);
