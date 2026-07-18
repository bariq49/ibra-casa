import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import api, { API_ENDPOINTS } from "@/lib/api";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

// Helper function to fetch and sync data
const syncUserData = async () => {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      api.get(`${API_ENDPOINTS.CART.BASE}?limit=1000`),
      api.get(API_ENDPOINTS.WISHLIST.BASE)
    ]);

    if (cartRes.data?.success && cartRes.data.cart) {
      // Map API cart which holds nested productId (the full product) AND quantity 
      // back into the format CartStore expects
      const formattedCart = cartRes.data.cart.map((item: any) => ({
        id: item._id || item.id || item.productId._id, // Use cart document _id for exact variant syncing
        product: item.productId,
        quantity: item.quantity,
        color: item.colorId,
        size: item.sizeId
      }));
      useCartStore.getState().setCartItems(formattedCart);
    }

    if (wishlistRes.data?.success && wishlistRes.data.wishlist) {
      // API wishlist is an array of IDs. 
      // We need to fetch the products to populate the Zustand store appropriately.
      if (wishlistRes.data.wishlist.length > 0) {
        const productsRes = await api.post(API_ENDPOINTS.WISHLIST.PRODUCTS, {
          productIds: wishlistRes.data.wishlist,
          limit: 1000
        });
        if (productsRes.data?.success) {
          useWishlistStore.getState().setWishlistItems(productsRes.data.products);
        }
      } else {
        useWishlistStore.getState().setWishlistItems([]);
      }
    }
  } catch (error: any) {
    if (error?.status === 401) {
      console.warn("Session expired or invalid token. Logging out.");
      useAuthStore.getState().logout();
    } else {
      console.warn("Failed to sync user data during auth", error?.message || "Unknown error");
    }
  }
};

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: async (user, token) => {
        // Set cookie
        Cookies.set("token", token, { expires: 7, path: "/" }); // 7 days
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Sync the cart & wishlist directly after successful login
        await syncUserData();
      },
      logout: () => {
        // Remove cookie
        Cookies.remove("token", { path: "/" });
        
        // Clear local storage carts & wishlists directly
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      initializeAuth: () => {
        // Logic to check if token exists in cookie but not in state (e.g. page refresh)
        // This might be redundant if we use persist for everything,
        // but good to sync with cookie.
        const token = Cookies.get("token");
        const state = get();

        // If cookie is missing but we have state (rehydrated), restore cookie
        if (!token && state.token) {
          Cookies.set("token", state.token, { expires: 7, path: "/" });
        }

        // If we correctly have a token, we should fetch data in the background if it's empty
        if (token || state.token) {
           syncUserData();
        }

        set({ isLoading: false });
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist these fields
      onRehydrateStorage: () => (state) => {
        state?.initializeAuth();
      },
    },
  ),
);
