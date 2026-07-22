import { create } from "zustand";
import { AuthView } from "@/components/common/header/AuthSidebar";

interface HeaderState {
  isCartOpen: boolean;
  isAuthOpen: boolean;
  authView: AuthView;
  /** Active hero slide bg color — syncs header chrome on home */
  heroBgColor: string | null;
  onCartOpen: () => void;
  onCartClose: () => void;
  onAuthOpen: (view: AuthView) => void;
  onAuthClose: () => void;
  setHeroBgColor: (color: string | null) => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  isCartOpen: false,
  isAuthOpen: false,
  authView: "login",
  heroBgColor: null,
  onCartOpen: () => set({ isCartOpen: true }),
  onCartClose: () => set({ isCartOpen: false }),
  onAuthOpen: (view) =>
    set({
      authView: view,
      isAuthOpen: true,
    }),
  onAuthClose: () => set({ isAuthOpen: false }),
  setHeroBgColor: (color) => set({ heroBgColor: color }),
}));
