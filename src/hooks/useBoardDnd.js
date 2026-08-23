import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useBoardStore } from "./useBoardStore";
import { usePageStore } from "./usePageStore";

const WIDGET_TYPES = new Set(["pomodoro", "clock", "note"]);

export function useBoardDnd() {
  const [activeItem, setActiveItem] = useState(null);
  const [activeType, setActiveType] = useState(null);

  // ── Helpers (read current board directly from store to keep callbacks stable) ──
  const getColumns = useCallback(() => {
    const activePageId = usePageStore.getState().activePageId;
    return useBoardStore.getState().boards[activePageId] ?? {};
  }, []);

  const findContainer = useCallback(
    (id) => {
      if (!id) return null;
      const columns = getColumns();
      if (id in columns) return id;
      for (const colId of Object.keys(columns)) {
        if (columns[colId].some((g) => String(g.id) === String(id)))
          return colId;
        if (
          columns[colId].some((g) =>
            g.sites?.some((s) => String(s.id) === String(id)),
          )
        )
          return colId;
      }
      return null;
    },
    [getColumns],
  );

  const findLocation = useCallback(
    (id, type) => {
      const columns = getColumns();
      for (const colId of Object.keys(columns)) {
        for (const group of columns[colId]) {
          if (type === "group" && String(group.id) === String(id)) {
            return { colId, group };
          }
          if (type === "site") {
            const site = group.sites?.find((s) => String(s.id) === String(id));
            if (site) return { colId, group, site };
          }
        }
      }
      return null;
    },
    [getColumns],
  );

  // ── Handlers ──
  const handleDragStart = useCallback(
    (event) => {
      const type = event.active.data.current?.type;
      const loc = findLocation(event.active.id, type);
      if (loc) {
        setActiveItem(type === "group" ? loc.group : loc.site);
        setActiveType(type);
      }
    },
    [findLocation],
  );

  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;
      const type = active.data.current?.type;

      if (type === "group") {
        const sourceCol = findContainer(active.id);
        const targetCol = findContainer(over.id);
        if (!sourceCol || !targetCol || sourceCol === targetCol) return;

        const setColumns = useBoardStore.getState().setColumns;
        setColumns((prev) => {
          const sourceItems = [...(prev[sourceCol] || [])];
          const targetItems = [...(prev[targetCol] || [])];
          const draggedIndex = sourceItems.findIndex(
            (g) => String(g.id) === String(active.id),
          );
          if (draggedIndex === -1) return prev;

          const [draggedItem] = sourceItems.splice(draggedIndex, 1);
          const overIndex = targetItems.findIndex(
            (g) => String(g.id) === String(over.id),
          );
          targetItems.splice(
            overIndex >= 0 ? overIndex : targetItems.length,
            0,
            draggedItem,
          );

          return {
            ...prev,
            [sourceCol]: sourceItems,
            [targetCol]: targetItems,
          };
        });
      } else if (type === "site") {
        const activeLoc = findLocation(active.id, "site");
        if (!activeLoc) return;

        const overSiteLoc = findLocation(over.id, "site");
        const overGroupLoc = findLocation(over.id, "group");
        const targetGroupObj = overSiteLoc?.group || overGroupLoc?.group;

        if (!targetGroupObj || WIDGET_TYPES.has(targetGroupObj.type)) return;
        if (String(activeLoc.group.id) === String(targetGroupObj.id)) return;

        const setColumns = useBoardStore.getState().setColumns;
        setColumns((prev) => {
          const next = { ...prev };
          let sourceGroup, targetGroup;

          for (const colId of Object.keys(next)) {
            next[colId] = next[colId].map((g) => {
              if (String(g.id) === String(activeLoc.group.id))
                return (sourceGroup = { ...g, sites: [...(g.sites || [])] });
              if (String(g.id) === String(targetGroupObj.id))
                return (targetGroup = { ...g, sites: [...(g.sites || [])] });
              return g;
            });
          }

          if (!sourceGroup || !targetGroup) return prev;
          const siteIndex = sourceGroup.sites.findIndex(
            (s) => String(s.id) === String(active.id),
          );
          if (siteIndex === -1) return prev;

          const [movedSite] = sourceGroup.sites.splice(siteIndex, 1);
          const overSiteIndex = overSiteLoc
            ? targetGroup.sites.findIndex(
                (s) => String(s.id) === String(over.id),
              )
            : -1;
          targetGroup.sites.splice(
            overSiteIndex >= 0 ? overSiteIndex : targetGroup.sites.length,
            0,
            movedSite,
          );

          return next;
        });
      }
    },
    [findContainer, findLocation],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveItem(null);
      setActiveType(null);
      if (!over) return;

      const type = active.data.current?.type;
      const columns = getColumns();
      const setColumns = useBoardStore.getState().setColumns;

      if (type === "group") {
        const sourceCol = findContainer(active.id);
        const targetCol = findContainer(over.id);
        if (sourceCol && sourceCol === targetCol) {
          const oldIndex = columns[sourceCol]?.findIndex(
            (g) => String(g.id) === String(active.id),
          );
          const newIndex = columns[sourceCol]?.findIndex(
            (g) => String(g.id) === String(over.id),
          );
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setColumns((prev) => ({
              ...prev,
              [sourceCol]: arrayMove(prev[sourceCol], oldIndex, newIndex),
            }));
          }
        }
      } else if (type === "site") {
        const activeLoc = findLocation(active.id, "site");
        const overLoc = findLocation(over.id, "site");
        if (
          activeLoc &&
          overLoc &&
          String(activeLoc.group.id) === String(overLoc.group.id)
        ) {
          const { group, colId } = activeLoc;
          const oldIndex = group.sites?.findIndex(
            (s) => String(s.id) === String(active.id),
          );
          const newIndex = group.sites?.findIndex(
            (s) => String(s.id) === String(over.id),
          );
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setColumns((prev) => ({
              ...prev,
              [colId]: prev[colId].map((g) =>
                String(g.id) === String(group.id)
                  ? { ...g, sites: arrayMove(g.sites, oldIndex, newIndex) }
                  : g,
              ),
            }));
          }
        }
      }
    },
    [findContainer, findLocation, getColumns],
  );

  return {
    activeItem,
    activeType,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
