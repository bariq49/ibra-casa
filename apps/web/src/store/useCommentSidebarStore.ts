import { create } from "zustand";

interface CommentSidebarState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCommentSidebarStore = create<CommentSidebarState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
