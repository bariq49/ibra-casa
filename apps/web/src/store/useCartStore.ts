import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/common/products/ProductCard";
import { calculateCartTotals } from "@/lib/priceUtils";
import Cookies from "js-cookie";
import { toast } from "sonner";
import api, { API_ENDPOINTS } from "@/lib/api";
import { useHeaderStore } from "./useHeaderStore";

export interface CartItem {
  id: string | number; // Represents the unique cart item reference
  product: Product;
  quantity: number;
  color?: any;
  size?: any;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: any, size?: any) => Promise<any> | null;
  removeFromCart: (cartItemId: string | number) => Promise<any> | null;
  updateQuantity: (cartItemId: string | number, quantity: number) => Promise<any> | null;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      setCartItems: (items) => set({ cartItems: items }),

      addToCart: (product, quantity = 1, color, size) => {
        if (!Cookies.get("token")) {
          useHeaderStore.getState().onAuthOpen("login");
          return null;
        }

        const pId = (product as any)._id || product.id;
        // Generate a pseudo-id locally for variations if DB _id isn't instantly known
        const pseudoId = `${pId}-${color?._id || 'default'}-${size?._id || 'default'}`;
        
        // Optimistic UI update
        set((state) => {
          // Because API returns true _id, matching pseudoId locally keeps UI fast until full sync applies the real _id
          // As a fallback, we aggressively check equality of properties
          const existingItem = state.cartItems.find(
            (item) => item.id === pseudoId || (item.product._id === pId && item.color?._id === color?._id && item.size?._id === size?._id)
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return {
            cartItems: [
              ...state.cartItems,
              { id: pseudoId, product, quantity, color, size },
            ],
          };
        });

        // Backend Sync
        const req = api.post(API_ENDPOINTS.CART.BASE, {
          productId: pId,
          quantity,
          ...(color && { colorId: color._id }),
          ...(size && { sizeId: size._id })
        });
        
        req.catch((error) => {
          console.error("Cart API Sync Error", error);
        });

        return req;
      },

      removeFromCart: (cartItemId) => {
        if (!Cookies.get("token")) {
          useHeaderStore.getState().onAuthOpen("login");
          return null;
        }

        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== cartItemId),
        }));

        const req = api.delete(`${API_ENDPOINTS.CART.BASE}/${cartItemId}`);
        req.catch(error => console.error("Cart API Sync Error", error));
        return req;
      },

      updateQuantity: (cartItemId, quantity) => {
        if (!Cookies.get("token")) {
          useHeaderStore.getState().onAuthOpen("login");
          return null;
        }

        const newQuantity = Math.max(1, quantity);
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        }));

        const req = api.put(API_ENDPOINTS.CART.BASE, {
          cartItemId,
          quantity: newQuantity
        });
        req.catch(error => console.error("Cart API Sync Error", error));
        return req;
      },

      clearCart: () => {
        set({ cartItems: [] });
        if (Cookies.get("token")) {
          const req = api.delete(API_ENDPOINTS.CART.BASE);
          req.catch((error) => console.error("Cart API Sync Error", error));
        }
      },

      getSubtotal: () => {
        const { subtotalDiscounted } = calculateCartTotals(get().cartItems);
        return Number(subtotalDiscounted) || 0;
      },

      getTotalItems: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage", // prefix for localStorage key
      partialize: (state) => ({
        cartItems: state.cartItems.map((item) => {
          const p = item.product as any;
          return {
            id: item.id,
            quantity: item.quantity,
            color: item.color
              ? {
                  _id: item.color._id,
                  name: item.color.name,
                  priceModifier: item.color.priceModifier,
                }
              : undefined,
            size: item.size
              ? {
                  _id: item.size._id,
                  name: item.size.name,
                  priceModifier: item.size.priceModifier,
                }
              : undefined,
            product: {
              _id: p?._id || p?.id,
              id: p?.id || p?._id,
              name: p?.name || p?.title,
              title: p?.title || p?.name,
              price: p?.price,
              currentPrice: p?.currentPrice,
              oldPrice: p?.oldPrice,
              discountPercentage: p?.discountPercentage ?? p?.discount,
              discount: p?.discount ?? p?.discountPercentage,
              image: p?.image || p?.images?.[0],
              images: p?.images,
              slug: p?.slug,
              stock: p?.stock,
            },
          };
        }),
      }),
    },
  ),
);
