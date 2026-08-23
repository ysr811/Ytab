import { create } from "zustand";
import { persist } from "zustand/middleware";
import { usePageStore } from "./usePageStore";
import defaultBoard from "../data/defaultBoard.json";

const COLUMNS = 6;
const COLUMN_KEYS = Array.from({ length: COLUMNS }, (_, i) => String(i + 1));

function emptyBoard() {
  return COLUMN_KEYS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
}

const defaultColumns = defaultBoard.reduce((acc, col) => {
  acc[col.id] = col.groups || [];
  return acc;
}, {});

const INITIAL_BOARDS = {
  "page-1": defaultColumns,
  "page-2": emptyBoard(),
};

export const useBoardStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      boards: INITIAL_BOARDS,

      // --- Board Actions ---
      initBoard: (pageId) =>
        set((state) => {
          if (state.boards[pageId]) return state;
          return { boards: { ...state.boards, [pageId]: emptyBoard() } };
        }),

      deleteBoard: (pageId) =>
        set((state) => {
          const newBoards = { ...state.boards };
          delete newBoards[pageId];
          return { boards: newBoards };
        }),

      // --- Board / Widget Actions ---
      setColumns: (updater) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const current = state.boards[pageId] ?? emptyBoard();
          const next = typeof updater === "function" ? updater(current) : updater;
          return {
            boards: { ...state.boards, [pageId]: next },
          };
        }),

      addWidget: (type, targetColumnId) => {
        const allowedTypes = ["group", "pomodoro", "clock", "note"];
        if (!allowedTypes.includes(type)) return;

        const titles = {
          group: "New Group",
          pomodoro: "Pomodoro",
          clock: "Clock",
          note: "Quick Note",
        };

        const defaultSettings = {
          clock: { showSeconds: false, showDate: true, is24Hour: false },
          pomodoro: {
            modeTimes: { focus: 25 * 60, break: 5 * 60 },
            mode: "focus",
            timeLeft: 25 * 60,
            isAutoSwitch: false,
            alarmSound: "digital",
          },
          note: { isPreview: false },
        };

        const newItem = {
          id: Date.now(),
          title: titles[type] || "New Widget",
          type,
          sites: [],
          content: "",
          settings: defaultSettings[type] || {},
        };

        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? emptyBoard();
          const colKeys = Object.keys(cols);
          if (colKeys.length === 0) return state;

          const finalColId =
            targetColumnId && cols[targetColumnId]
              ? targetColumnId
              : colKeys.reduce(
                  (minCol, colId) =>
                    cols[colId].length < cols[minCol].length ? colId : minCol,
                  colKeys[0],
                );

          return {
            boards: {
              ...state.boards,
              [pageId]: {
                ...cols,
                [finalColId]: [...cols[finalColId], newItem],
              },
            },
          };
        });
      },

      addGroupWithSites: (title, sites) => {
        const newItem = {
          id: Date.now(),
          title: title || "New Group",
          type: "group",
          sites: sites || [],
          content: "",
        };

        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? emptyBoard();
          const colKeys = Object.keys(cols);
          if (colKeys.length === 0) return state;

          const finalColId = colKeys.reduce(
            (minCol, colId) =>
              cols[colId].length < cols[minCol].length ? colId : minCol,
            colKeys[0],
          );

          return {
            boards: {
              ...state.boards,
              [pageId]: {
                ...cols,
                [finalColId]: [...cols[finalColId], newItem],
              },
            },
          };
        });
      },

      // --- Group Actions ---
      renameGroup: (groupId, newTitle) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) =>
              String(g.id) === String(groupId) ? { ...g, title: newTitle } : g,
            );
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      deleteGroup: (groupId) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].filter(
              (g) => String(g.id) !== String(groupId),
            );
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      updateNoteContent: (groupId, newContent) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) =>
              String(g.id) === String(groupId)
                ? { ...g, content: newContent }
                : g,
            );
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      updateWidgetSettings: (widgetId, newSettings) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) =>
              String(g.id) === String(widgetId)
                ? { ...g, settings: { ...(g.settings || {}), ...newSettings } }
                : g,
            );
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      // --- Site Actions ---
      addSiteToGroup: (groupId, newSite) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) =>
              String(g.id) === String(groupId)
                ? { ...g, sites: [...(g.sites || []), newSite] }
                : g,
            );
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      updateSite: (siteId, updatedData) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) => ({
              ...g,
              sites: (g.sites || []).map((s) =>
                String(s.id) === String(siteId) ? { ...s, ...updatedData } : s,
              ),
            }));
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),

      deleteSite: (siteId) =>
        set((state) => {
          const pageId = usePageStore.getState().activePageId;
          const cols = state.boards[pageId] ?? {};
          const updatedCols = {};
          for (const colId of Object.keys(cols)) {
            updatedCols[colId] = cols[colId].map((g) => ({
              ...g,
              sites: (g.sites || []).filter(
                (s) => String(s.id) !== String(siteId),
              ),
            }));
          }
          return { boards: { ...state.boards, [pageId]: updatedCols } };
        }),
    }),
    {
      name: "board-storage", // The key used in localStorage
    },
  ),
);
