import { useState, useEffect } from "react";
import { NavItem } from "@/constants/data";
import api from "@/lib/api";
import { MENU_ENDPOINTS } from "@/constants/endpoints";

export const useMenus = (initialMenus: NavItem[] = []) => {
  const [menus, setMenus] = useState<NavItem[]>(initialMenus);
  const [isLoading, setIsLoading] = useState(initialMenus.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get(MENU_ENDPOINTS.PUBLIC);
        const data = response.data;
        // Filter out inactive menus and sort by order
        const activeMenus = data
          .filter((menu: NavItem & { isActive: boolean }) => menu.isActive)
          .sort(
            (a: NavItem & { order: number }, b: NavItem & { order: number }) =>
              a.order - b.order,
          );

        setMenus(activeMenus);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching menus:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return { menus, isLoading, error };
};
