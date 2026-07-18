import { create } from "zustand";
import api, { API_ENDPOINTS } from "@/lib/api";
import Cookies from "js-cookie";

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
  decrementUnread: () => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  
  fetchUnreadCount: async () => {
    if (!Cookies.get("token")) return;
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      if (response.data && response.data.count !== undefined) {
        set({ unreadCount: response.data.count });
      }
    } catch (error) {
      console.error("Failed to fetch unread notifications count", error);
    }
  },
  
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  
  resetUnread: () => set({ unreadCount: 0 }),
}));
