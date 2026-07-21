import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import api, { API_ENDPOINTS } from "@/lib/api";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

/** Push local guest cart/wishlist to the server, then pull the merged result. */
const mergeGuestDataThenSync = async () => {
  const guestCart = [...useCartStore.getState().cartItems];
  const guestWishlist = [...useWishlistStore.getState().wishlistItems];

  try {
    await Promise.all(
      guestCart.map((item) => {
        const pId = (item.product as any)?._id || (item.product as any)?.id;
        if (!pId) return Promise.resolve();
        return api
          .post(API_ENDPOINTS.CART.BASE, {
            productId: pId,
            quantity: item.quantity,
            ...(item.color?._id && { colorId: item.color._id }),
            ...(item.size?._id && { sizeId: item.size._id }),
          })
          .catch(() => null);
      }),
    );

    await Promise.all(
      guestWishlist.map((product) => {
        const pId = (product as any)._id || product.id;
        if (!pId) return Promise.resolve();
        return api
          .post(API_ENDPOINTS.WISHLIST.ADD, { productId: pId })
          .catch(() => null);
      }),
    );
  } catch (error) {
    console.warn("Failed to merge guest cart/wishlist", error);
  }

  await syncUserData();
};

// Helper function to fetch and sync data
const syncUserData = async () => {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      api.get(`${API_ENDPOINTS.CART.BASE}?limit=1000`),
      api.get(API_ENDPOINTS.WISHLIST.BASE),
    ]);

    if (cartRes.data?.success && cartRes.data.cart) {
      const formattedCart = cartRes.data.cart.map((item: any) => ({
        id: item._id || item.id || item.productId._id,
        product: item.productId,
        quantity: item.quantity,
        color: item.colorId,
        size: item.sizeId,
      }));
      useCartStore.getState().setCartItems(formattedCart);
    }

    if (wishlistRes.data?.success && wishlistRes.data.wishlist) {
      if (wishlistRes.data.wishlist.length > 0) {
        const productsRes = await api.post(API_ENDPOINTS.WISHLIST.PRODUCTS, {
          productIds: wishlistRes.data.wishlist,
          limit: 1000,
        });
        if (productsRes.data?.success) {
          useWishlistStore
            .getState()
            .setWishlistItems(productsRes.data.products);
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
      console.warn(
        "Failed to sync user data during auth",
        error?.message || "Unknown error",
      );
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
        Cookies.set("token", token, { expires: 7, path: "/" });
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        await mergeGuestDataThenSync();
      },
      logout: () => {
        Cookies.remove("token", { path: "/" });

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
        const token = Cookies.get("token");
        const state = get();

        if (!token && state.token) {
          Cookies.set("token", state.token, { expires: 7, path: "/" });
        }

        if (token || state.token) {
          syncUserData();
        }

        set({ isLoading: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initializeAuth();
      },
    },
  ),
);
