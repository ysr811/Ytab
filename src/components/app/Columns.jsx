import { useImperativeHandle, forwardRef, useCallback, useMemo, memo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  DndContext,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { Column } from "./Column";
import { GroupCard } from "./Group";
import { SiteItem } from "./SiteItem";
import { useBoardStore } from "../../hooks/useBoardStore";
import { usePageStore } from "../../hooks/usePageStore";
import { useBoardDnd } from "../../hooks/useBoardDnd";

// Sensor config is static — defined outside so it's never recreated.
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 5 } };

export const Columns = memo(
  forwardRef(function Columns(props, ref) {
    const activePageId = usePageStore((s) => s.activePageId);
    const addWidget = useBoardStore((s) => s.addWidget);

    // ── Only the column IDs (stable: changes only when columns are added/removed,
    //    NOT when items inside them change). useShallow prevents re-renders when
    //    the array content is the same but the reference differs.
    const colIds = useBoardStore(
      useShallow((s) => Object.keys(s.boards[activePageId] ?? {}))
    );

    // O(1) lookup for collision detection — recalculated only when colIds changes.
    const colIdsSet = useMemo(() => new Set(colIds), [colIds]);

    const {
      activeItem,
      activeType,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
    } = useBoardDnd();

    useImperativeHandle(ref, () => ({
      addWidget: (type) => addWidget(type),
    }));

    const sensors = useSensors(
      useSensor(PointerSensor, POINTER_SENSOR_OPTIONS)
    );

    // Depends only on colIdsSet (stable), not the full board object.
    const customCollisionDetection = useCallback(
      (args) => {
        const currentActiveType = args.active.data.current?.type;

        if (currentActiveType === "group") {
          const groupContainers = args.droppableContainers.filter(
            (c) => c.data.current?.type === "group" || colIdsSet.has(c.id)
          );
          const collisions = pointerWithin({
            ...args,
            droppableContainers: groupContainers,
          });
          return collisions.length > 0
            ? collisions
            : rectIntersection({
              ...args,
              droppableContainers: groupContainers,
            });
        }

        if (currentActiveType === "site") {
          const siteContainers = args.droppableContainers.filter(
            (c) =>
              c.data.current?.type === "site" ||
              c.data.current?.type === "group"
          );
          const collisions = pointerWithin({
            ...args,
            droppableContainers: siteContainers,
          });
          return collisions.length > 0
            ? collisions
            : rectIntersection({
              ...args,
              droppableContainers: siteContainers,
            });
        }

        return pointerWithin(args);
      },
      [colIdsSet]  // was [columns] — now only re-runs when structure changes
    );

    return (
      // key resets the DnD context when switching pages
      <DndContext
        key={activePageId}
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full h-full min-h-[calc(100dvh-72px)] grid grid-cols-6 px-4">
          {colIds.map((colId) => (
            // Column reads its own items from the store — no items prop needed.
            <Column key={colId} id={colId} />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.2" } },
            }),
          }}
        >
          {activeItem &&
            (activeType === "group" ? (
              <GroupCard {...activeItem} isOverlay />
            ) : (
              <SiteItem {...activeItem} isOverlay />
            ))}
        </DragOverlay>
      </DndContext>
    );
  })
);

export default Columns;