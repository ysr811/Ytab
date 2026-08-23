import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useBoardStore } from "./useBoardStore";

const INITIAL_PAGES = [
  { id: "page-1", label: "Home" },
  { id: "page-2", label: "Work" },
];

export const usePageStore = create(
  persist(
    (set, get) => ({
      activePageId: "page-1",
      pages: INITIAL_PAGES,

      setActivePage: (pageId) => set({ activePageId: pageId }),

      addPage: (label) => {
        const newId = `page-${Date.now()}`;
        const newPage = {
          id: newId,
          label: label || `Page ${get().pages.length + 1}`,
        };
        set((state) => ({
          pages: [...state.pages, newPage],
          activePageId: newId,
        }));
        
        // Initialize the empty board structure for this new page
        useBoardStore.getState().initBoard(newId);

        return newId;
      },

      deletePage: (pageId) => {
        let deleted = false;
        set((state) => {
          if (state.pages.length <= 1) return state;
          const newPages = state.pages.filter((p) => p.id !== pageId);
          const newActiveId =
            state.activePageId === pageId ? newPages[0].id : state.activePageId;
          deleted = true;
          return { pages: newPages, activePageId: newActiveId };
        });
        
        if (deleted) {
          // Cleanup the board data for the deleted page
          useBoardStore.getState().deleteBoard(pageId);
        }
      },

      renamePage: (pageId, newLabel) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId ? { ...p, label: newLabel } : p
          ),
        })),
    }),
    {
      name: "page-storage",
    }
  )
);
