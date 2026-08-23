import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, Button, Dropdown, Label, toast } from "@heroui/react";
import { EllipsisVertical, Trash2, Eye, Pencil, Edit3 } from "lucide-react";
import { useBoardStore } from "../../hooks/useBoardStore";
import RenameModal from "../modals/RenameModal";

// ── Markdown renderer styles ─────────────────────────────────────
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold mt-2 mb-1 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold mt-2 mb-1 leading-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold mt-1 mb-0.5 leading-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-xs leading-relaxed my-0.5">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-xs space-y-0.5 my-0.5 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-xs space-y-0.5 my-0.5 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-black/20 rounded px-1 py-0.5 text-[10px] font-mono">
        {children}
      </code>
    ) : (
      <pre className="bg-black/20 rounded p-2 text-[10px] font-mono overflow-x-auto my-1">
        <code>{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-2 my-1 opacity-70 text-xs italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-2 border-white/10" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline text-xs"
    >
      {children}
    </a>
  ),
};

// ── Component ────────────────────────────────────────────────────
export const NotesWidget = memo(function NotesWidget({
  id,
  title = "Quick Note",
  content = "",
  isOverlay,
  attributes,
  listeners,
  onDelete,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [text, setText] = useState(content);
  const [isPreview, setIsPreview] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null); // debounce timer for store writes

  const updateNoteContent = useBoardStore((s) => s.updateNoteContent);
  const renameGroup = useBoardStore((s) => s.renameGroup);

  useEffect(() => {
    setText(content);
  }, [content]);

  // Flush pending debounce on unmount so no writes are lost.
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    if (!isPreview) {
      requestAnimationFrame(autoResize);
    }
  }, [isPreview, autoResize]);

  // Local state updates instantly (no lag while typing).
  // Store write is debounced — fires 400ms after the user stops typing,
  // preventing a Zustand update (and re-render cascade) on every keystroke.
  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setText(val);
      autoResize();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateNoteContent?.(id, val);
      }, 400);
    },
    [autoResize, id, updateNoteContent],
  );

  const isEmpty = text.trim() === "";

  return (
    <>
      <Card
        className={`group/card bg-card w-full p-3 ${
          isOverlay ? "shadow-2xl scale-101" : ""
        }`}
      >
        <Card.Header
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pb-2 select-none flex flex-row justify-between items-center"
        >
          <Card.Title className="text-sm font-semibold truncate">
            {title}
          </Card.Title>

          <div className="flex items-center gap-1 shrink-0">
            {!isEmpty && (
              <Button
                isIconOnly
                aria-label={isPreview ? "Edit" : "Preview"}
                variant="ghost"
                size="sm"
                className="transition-opacity duration-200 shadow-none w-6 h-6 min-w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreview((p) => !p);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {isPreview ? (
                  <Pencil className="size-3.5 shrink-0 text-muted" />
                ) : (
                  <Eye className="size-3.5 shrink-0 text-muted" />
                )}
              </Button>
            )}

            <div
              className={`transition-opacity duration-200 ${
                isMenuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/card:opacity-100"
              }`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
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
                      } else if (key === "delete" && onDelete) {
                        onDelete();
                        toast.success("Note deleted successfully");
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
          </div>
        </Card.Header>

        {/* ── Content ── */}
        <Card.Content className="p-0">
          {isPreview ? (
            /* ── Markdown Preview ── */
            <div
              className="w-full min-h-8 px-2 py-1 text-foreground leading-relaxed"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents}
              >
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            /* ── Edit Textarea ── */
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              placeholder={
                "Write your note here...\n\nSupports **bold**, *italic*, # headings, - lists"
              }
              rows={3}
              style={{ resize: "none", overflow: "hidden" }}
              className="w-full bg-secondary border-none focus:outline-none p-2 text-xs rounded-xl text-foreground placeholder:text-muted font-mono leading-relaxed"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}

          {/* ── Hint ── */}
          {!isPreview && !isEmpty && (
            <p className="text-[10px] text-muted mt-1 px-1 select-none flex items-center gap-1">
              Markdown supported · click <Eye className="inline size-3" /> to
              preview
            </p>
          )}
        </Card.Content>
      </Card>

      {/* ── Rename Modal ── */}
      <RenameModal
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        itemType="note"
        currentName={title}
        onRename={(newName) => {
          renameGroup(id, newName);
          toast.success("Note renamed successfully");
        }}
      />
    </>
  );
});

export default NotesWidget;
