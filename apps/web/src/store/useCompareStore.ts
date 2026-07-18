import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/common/products/ProductCard";
import { toast } from "sonner";

export interface CompareStore {
  compareItems: Product[];
  isPopupOpen: boolean;
  recentAddedProduct: Product | null;
  setPopupOpen: (open: boolean) => void;
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number | string) => void;
  clearCompare: () => void;
  isInCompare: (productId: number | string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareItems: [],
      isPopupOpen: false,
      recentAddedProduct: null,
      
      setPopupOpen: (open) => set({ isPopupOpen: open }),

      addToCompare: (product) => {
        set((state) => {
          const exists = state.compareItems.find(
            (item) => (item.id || item._id) === (product.id || product._id),
          );
          if (exists) {
            toast.success(`${product.title || (product as any).name} is already in the compare list`, {
              action: {
                label: "View Compare",
                onClick: () => { window.location.href = "/compare"; }
              }
            });
            return state;
          }
          if (state.compareItems.length >= 4) {
            toast.error("You can only compare up to 4 products at a time", {
              action: {
                label: "View Compare",
                onClick: () => { window.location.href = "/compare"; }
              }
            });
            return state;
          }
          
          toast.success(`${product.title || (product as any).name} added to compare`, {
            action: {
              label: "View Compare",
              onClick: () => { window.location.href = "/compare"; }
            }
          });
          
          return {
            compareItems: [...state.compareItems, product],
            isPopupOpen: true,
            recentAddedProduct: product,
          };
        });
      },
      removeFromCompare: (productId) => {
        set((state) => ({
          compareItems: state.compareItems.filter(
            (item) => (item.id || item._id) !== productId,
          ),
        }));
      },
      clearCompare: () => {
        set({ compareItems: [], isPopupOpen: false, recentAddedProduct: null });
      },
      isInCompare: (productId) => {
        return get().compareItems.some((item) => (item.id || item._id) === productId);
      },
    }),
    {
      name: "compare-storage",
      partialize: (state) => ({ compareItems: state.compareItems }), // Prevent persisting popup UI state
    },
  ),
);
