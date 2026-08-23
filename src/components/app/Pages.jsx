import { useState } from "react";
import { Tabs, Tooltip, Dropdown, Button, Label, toast } from "@heroui/react";
import {
  Plus,
  EllipsisVertical,
  StickyNoteX,
  StickyNotePlus,
  PenLine,
  Trash2,
} from "lucide-react";
import { usePageStore } from "../../hooks/usePageStore";
import RenameModal from "../modals/RenameModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

const PageSettings = [
  { id: "rename-page", label: "Rename Page", icon: PenLine },
  { id: "delete-page", label: "Delete Page", variant: "danger", icon: Trash2 },
];

export function Pages() {
  const pages = usePageStore((s) => s.pages);
  const activePageId = usePageStore((s) => s.activePageId);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const addPage = usePageStore((s) => s.addPage);
  const deletePage = usePageStore((s) => s.deletePage);
  const renamePage = usePageStore((s) => s.renamePage);

  const [hoveredId, setHoveredId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  const renameTarget = pages.find((p) => p.id === renameTargetId);

  const handleAddPage = () => {
    addPage();
    toast.success("Page added", {
      description: "Your page was added successfully",
      indicator: <StickyNotePlus className="size-5 text-success shrink-0" />,
    });
  };

  const handleConfirmDelete = () => {
    if (!pageToDelete) return;
    deletePage(pageToDelete);
    toast.success("Deleted page", {
      description: "Your page was deleted successfully",
      indicator: <StickyNoteX className="size-5 text-success shrink-0" />,
    });
    setPageToDelete(null);
  };

  return (
    <div className="flex items-center gap-3 min-w-0 max-w-full">
      <Tabs
        selectedKey={activePageId}
        onSelectionChange={(key) => setActivePage(String(key))}
        className="min-w-0 overflow-hidden"
      >
        <Tabs.ListContainer className="min-w-0 bg-secondary">
          <Tabs.List aria-label="Pages" className="min-w-0 w-max">
            {pages.map((page) => {
              const isSelected = activePageId === page.id;
              const isHovered = hoveredId === page.id;
              const showDropdown =
                (isSelected && isHovered) || (isSelected && isMenuOpen);

              return (
                <Tabs.Tab
                  key={page.id}
                  id={page.id}
                  className="flex items-center gap-1.5 whitespace-nowrap transition-all duration-200"
                  onMouseEnter={() => setHoveredId(page.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ color: isSelected ? "#ffffff" : undefined }}
                >
                  <span className="whitespace-nowrap">{page.label}</span>
                  <Tabs.Indicator />

                  <div
                    className={`transition-all duration-200 ease-in-out ${showDropdown
                      ? "w-6 opacity-100 scale-100 pointer-events-auto"
                      : "w-0 opacity-0 scale-75 pointer-events-none overflow-hidden"
                      }`}
                  >
                    <Dropdown onOpenChange={setIsMenuOpen}>
                      <Button
                        isIconOnly
                        aria-label="Menu"
                        variant="ghost"
                        size="sm"
                        className="hover:bg-transparent shadow-none w-6 h-6 min-w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisVertical
                          className={`size-4 shrink-0 transition-colors ${isSelected ? "text-white" : "text-muted"
                            }`}
                        />
                      </Button>
                      <Dropdown.Popover placement="bottom left">
                        <Dropdown.Menu
                          onAction={(key) => {
                            if (key === "rename-page") {
                              setRenameTargetId(page.id);
                              setIsRenameOpen(true);
                            } else if (key === "delete-page") {
                              if (pages.length <= 1) {
                                toast.danger(
                                  "Cannot delete the only remaining page",
                                );
                                return;
                              }
                              setPageToDelete(page.id);
                              setIsDeleteConfirmOpen(true);
                            }
                          }}
                        >
                          {PageSettings.map(
                            ({ id, variant, icon: Icon, label }) => (
                              <Dropdown.Item
                                key={id}
                                id={id}
                                textValue={id}
                                variant={variant}
                              >
                                <div className="flex items-center gap-2 cursor-pointer">
                                  {Icon && (
                                    <Icon
                                      className={`size-4 ${variant ? "text-danger" : "text-muted"
                                        }`}
                                    />
                                  )}
                                  <Label className="cursor-pointer capitalize">
                                    {label}
                                  </Label>
                                </div>
                              </Dropdown.Item>
                            ),
                          )}
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </div>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {/* Add Page button */}
      <Tooltip delay={3000} closeDelay={300}>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onClick={handleAddPage}
            className="shrink-0 hover:bg-secondary"
          >
            <Plus />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Add Page</Tooltip.Content>
      </Tooltip>

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        itemType="page"
        currentName={renameTarget?.label || ""}
        onRename={(newName) => {
          renamePage(renameTargetId, newName);
          toast.success("Page renamed successfully");
        }}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Page?"
        description="Are you sure you want to delete this page? All widgets inside it will be removed permanently."
        confirmText="Delete Page"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default Pages;
