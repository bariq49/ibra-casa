import { create } from "zustand";
import { AuthView } from "@/components/common/header/AuthSidebar";

interface HeaderState {
  isCartOpen: boolean;
  isAuthOpen: boolean;
  authView: AuthView;
  onCartOpen: () => void;
  onCartClose: () => void;
  onAuthOpen: (view: AuthView) => void;
  onAuthClose: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  isCartOpen: false,
  isAuthOpen: false,
  authView: "login",
  onCartOpen: () => set({ isCartOpen: true }),
  onCartClose: () => set({ isCartOpen: false }),
  onAuthOpen: (view) =>
    set({
      authView: view,
      isAuthOpen: true,
    }),
  onAuthClose: () => set({ isAuthOpen: false }),
}));
