import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SearchState {
  recentSearches: string[];
  addSearch: (term: string) => void;
  removeSearch: (term: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],

      addSearch: (term) => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) return;

        set((state) => {
          // Remove existing instance if it exists so we can bump it to the front
          const filteredSearches = state.recentSearches.filter(
            (t) => t.toLowerCase() !== trimmedTerm.toLowerCase(),
          );

          // Add to front of array
          const newSearches = [trimmedTerm, ...filteredSearches];

          // Keep only the most recent 10 items
          if (newSearches.length > 10) {
            newSearches.pop();
          }

          return { recentSearches: newSearches };
        });
      },

      removeSearch: (term) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter(
            (t) => t.toLowerCase() !== term.toLowerCase(),
          ),
        }));
      },

      clearHistory: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: "search-storage", // namespace for localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
