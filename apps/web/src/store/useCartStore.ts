import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/common/products/ProductCard";
import { calculateCartTotals } from "@/lib/priceUtils";
import Cookies from "js-cookie";
import api, { API_ENDPOINTS } from "@/lib/api";

export interface CartItem {
  id: string | number;
  product: Product;
  quantity: number;
  color?: any;
  size?: any;
  weight?: any;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    color?: any,
    size?: any,
    weight?: any,
  ) => Promise<any> | null;
  removeFromCart: (cartItemId: string | number) => Promise<any> | null;
  updateQuantity: (
    cartItemId: string | number,
    quantity: number,
  ) => Promise<any> | null;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

const isAuthenticated = () => Boolean(Cookies.get("token"));

const isMongoObjectId = (id: unknown): id is string =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

/** Map local cart line id → server cart/product id for API sync. */
const resolveServerCartId = (
  cartItemId: string | number,
  item?: CartItem,
): string => {
  const id = String(cartItemId);
  if (isMongoObjectId(id)) return id;

  const productId =
    (item?.product as any)?._id ||
    (item?.product as any)?.id ||
    id.split("-")[0];

  return String(productId);
};

const formatServerCartItems = (cart: any[]): CartItem[] =>
  (cart || []).map((entry: any) => {
    const product = entry.productId;
    return {
      id: entry._id || entry.id || product?._id || product,
      product: product
        ? {
            ...product,
            // Keep catalog base explicit so variant math stays correct after sync
            basePrice: product.basePrice ?? product.price,
          }
        : product,
      quantity: entry.quantity,
      color: entry.colorId,
      size: entry.sizeId,
      weight: entry.weightId,
    };
  });

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      setCartItems: (items) => set({ cartItems: items }),

      addToCart: (product, quantity = 1, color, size, weight) => {
        const pId = (product as any)._id || product.id;
        const pseudoId = `${pId}-${color?._id || "default"}-${size?._id || "default"}-${weight?._id || "default"}`;

        set((state) => {
          const existingItem = state.cartItems.find(
            (item) =>
              item.id === pseudoId ||
              (item.product._id === pId &&
                item.color?._id === color?._id &&
                item.size?._id === size?._id &&
                item.weight?._id === weight?._id),
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
              { id: pseudoId, product, quantity, color, size, weight },
            ],
          };
        });

        // Guests keep cart in localStorage only
        if (!isAuthenticated()) return Promise.resolve({ guest: true });

        const req = api
          .post(API_ENDPOINTS.CART.BASE, {
            productId: pId,
            quantity,
            ...(color && { colorId: color._id }),
            ...(size && { sizeId: size._id }),
            ...(weight && { weightId: weight._id }),
          })
          .then((res) => {
            // Replace local pseudo-ids with server cart line _ids
            if (res.data?.cart) {
              set({ cartItems: formatServerCartItems(res.data.cart) });
            }
            return res;
          });

        req.catch((error) => {
          console.error("Cart API Sync Error", error);
        });

        return req;
      },

      removeFromCart: (cartItemId) => {
        const item = get().cartItems.find((i) => i.id === cartItemId);

        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== cartItemId),
        }));

        if (!isAuthenticated()) return Promise.resolve({ guest: true });

        const serverId = resolveServerCartId(cartItemId, item);
        const req = api
          .delete(`${API_ENDPOINTS.CART.BASE}/${serverId}`)
          .then((res) => {
            if (res.data?.cart) {
              set({ cartItems: formatServerCartItems(res.data.cart) });
            }
            return res;
          });

        // Item may only exist locally — don't surface 404 to the UI
        req.catch((error: any) => {
          if (error?.status !== 404) {
            console.error("Cart API Sync Error", error);
          }
        });
        return req;
      },

      updateQuantity: (cartItemId, quantity) => {
        const newQuantity = Math.max(1, quantity);
        const item = get().cartItems.find((i) => i.id === cartItemId);

        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.id === cartItemId ? { ...i, quantity: newQuantity } : i,
          ),
        }));

        if (!isAuthenticated()) return Promise.resolve({ guest: true });

        const serverId = resolveServerCartId(cartItemId, item);
        const req = api
          .put(API_ENDPOINTS.CART.BASE, {
            cartItemId: serverId,
            quantity: newQuantity,
          })
          .then((res) => {
            if (res.data?.cart) {
              set({ cartItems: formatServerCartItems(res.data.cart) });
            }
            return res;
          });

        req.catch((error: any) => {
          if (error?.status !== 404) {
            console.error("Cart API Sync Error", error);
          }
        });
        return req;
      },

      clearCart: () => {
        set({ cartItems: [] });
        if (isAuthenticated()) {
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
      name: "cart-storage",
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
            weight: item.weight
              ? {
                  _id: item.weight._id,
                  name: item.weight.name,
                  priceModifier: item.weight.priceModifier,
                }
              : undefined,
            product: {
              _id: p?._id || p?.id,
              id: p?.id || p?._id,
              name: p?.name || p?.title,
              title: p?.title || p?.name,
              basePrice: p?.basePrice,
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
