import { useState, memo } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SiteItem } from "./SiteItem";
import PomodoroWidget from "../widgets/PomodoroWidget";
import ClockWidget from "../widgets/ClockWidget";
import NotesWidget from "../widgets/NotesWidget";
import RenameModal from "../modals/RenameModal";
import EditSiteModal from "../modals/EditSiteModal";
import { Button, Card, Dropdown, Label, toast } from "@heroui/react";
import { EllipsisVertical, Trash2, Edit3, Plus } from "lucide-react";
import { useBoardStore } from "../../hooks/useBoardStore";

function customAnimateLayoutChanges(args) {
  const { isSorting, wasDragging } = args;
  if (isSorting || wasDragging) return defaultAnimateLayoutChanges(args);
  return false;
}

export const GroupCard = memo(function GroupCard({
  id,
  type,
  title,
  sites = [],
  content = "",
  settings,
  attributes,
  listeners,
  isOverlay,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);

  const deleteGroup = useBoardStore((state) => state.deleteGroup);
  const renameGroup = useBoardStore((state) => state.renameGroup);
  const addSiteToGroup = useBoardStore((state) => state.addSiteToGroup);

  if (type === "pomodoro") {
    return (
      <PomodoroWidget
        id={id}
        settings={settings}
        isOverlay={isOverlay}
        attributes={attributes}
        listeners={listeners}
        onDelete={() => deleteGroup(id)}
      />
    );
  }

  if (type === "clock") {
    return (
      <ClockWidget
        id={id}
        settings={settings}
        isOverlay={isOverlay}
        attributes={attributes}
        listeners={listeners}
        onDelete={() => deleteGroup(id)}
      />
    );
  }

  if (type === "note") {
    return (
      <NotesWidget
        id={id}
        title={title}
        content={content}
        settings={settings}
        isOverlay={isOverlay}
        attributes={attributes}
        listeners={listeners}
        onDelete={() => deleteGroup(id)}
      />
    );
  }

  return (
    <>
      <Card
        className={`group/card bg-card w-full min-h-32 p-3 transition-shadow duration-150 ${isOverlay ? "shadow-2xl scale-[1.01]" : "shadow-sm"
          }`}
      >
        <Card.Header
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pb-2 select-none flex flex-row justify-between items-center"
        >
          <Card.Title>{title}</Card.Title>

          <div
            className={`flex items-center gap-1 transition-opacity duration-200 ${isMenuOpen
              ? "opacity-100"
              : "opacity-0 group-hover/card:opacity-100"
              }`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              isIconOnly
              aria-label="Add Site"
              variant="ghost"
              size="sm"
              className="bg-transparent shadow-none w-6 h-6 min-w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddSiteOpen(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Plus className="size-4 shrink-0 text-black" />
            </Button>

            <Dropdown onOpenChange={setIsMenuOpen}>
              <Button
                isIconOnly
                aria-label="Menu"
                variant="ghost"
                size="sm"
                className="hover:bg-transparent shadow-none w-6 h-6 min-w-6 p-0"
              >
                <EllipsisVertical className="size-4 shrink-0 text-black" />
              </Button>
              <Dropdown.Popover placement="bottom left">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "rename") {
                      setIsRenameOpen(true);
                    } else if (key === "delete") {
                      deleteGroup(id);
                      toast.success("Group deleted successfully");
                    }
                  }}
                >
                  <Dropdown.Item id="rename" textValue="rename">
                    <div className="flex items-center gap-2">
                      <Edit3 className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Rename
                      </Label>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="delete"
                    variant="danger"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="size-4 text-danger" />
                      <Label className="cursor-pointer capitalize text-danger">
                        Delete
                      </Label>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </Card.Header>

        <Card.Content className="flex flex-col gap-2 p-0 min-h-20">
          {isOverlay ? (
            sites.map((site) => <SiteItem key={site.id} {...site} />)
          ) : (
            <SortableContext
              items={sites.map((site) => site.id)}
              strategy={verticalListSortingStrategy}
            >
              {sites.map((site) => (
                <SortableSiteItem key={site.id} site={site} />
              ))}
            </SortableContext>
          )}
        </Card.Content>
      </Card>

      <RenameModal
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        itemType="group"
        currentName={title}
        onRename={(newName) => {
          renameGroup(id, newName);
          toast.success("Group renamed successfully");
        }}
      />

      <EditSiteModal
        isOpen={isAddSiteOpen}
        onOpenChange={setIsAddSiteOpen}
        onSave={(newSite) => {
          addSiteToGroup(id, newSite);
          toast.success("Site added successfully");
        }}
      />
    </>
  );
});

export const Group = memo(function Group(props) {
  const { id } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "group" },
    animateLayoutChanges: customAnimateLayoutChanges,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    willChange: isDragging ? "transform, opacity" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <GroupCard {...props} attributes={attributes} listeners={listeners} />
    </div>
  );
});

const SortableSiteItem = memo(function SortableSiteItem({ site }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: site.id,
    data: { type: "site" },
    animateLayoutChanges: customAnimateLayoutChanges,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    willChange: isDragging ? "transform, opacity" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SiteItem {...site} />
    </div>
  );
});

export default Group;
