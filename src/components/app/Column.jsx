import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Group } from "./Group";
import { useBoardStore } from "../../hooks/useBoardStore";
import { usePageStore } from "../../hooks/usePageStore";

const EMPTY_ITEMS = [];

export const Column = memo(function Column({ id, index = 0, totalColumns = 6 }) {
  const { setNodeRef } = useDroppable({ id });
  const activePageId = usePageStore((s) => s.activePageId);
  const items = useBoardStore(
    (s) => s.boards[activePageId]?.[id] ?? EMPTY_ITEMS
  );

  const delayMs = Math.max(0, totalColumns - 1 - index) * 60;

  return (
    <div
      ref={setNodeRef}
      style={{ animationDelay: `${delayMs}ms` }}
      className="animate-column-enter w-full h-full min-h-50 flex flex-col gap-4 pb-40 px-2"
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <Group key={item.id} {...item} />
        ))}
      </SortableContext>
    </div>
  );
});

export default Column;