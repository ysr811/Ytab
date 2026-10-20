import { useState, useEffect } from "react";
import { Button, ListBox, Select } from "@heroui/react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import BaseModal from "./BaseModal";
import { useTheme } from "../../context/ThemeContext";

const ACCENT_SURFACE_STYLE = {
  backgroundColor: "color-mix(in oklab, var(--accent-color) 16%, transparent)",
};

const ACCENT_BORDER_STYLE = {
  borderColor: "color-mix(in oklab, var(--accent-color) 30%, transparent)",
};

const DEFAULT_FONT_STACK = ["system-ui", "sans-serif"];

function FontRow({ name, index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className="text-sm font-medium text-foreground"
          style={{ fontFamily: name }}>
          {name}
        </span>
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded-full p-1.5 text-foreground/60 hover:bg-white/20 disabled:opacity-30"
          aria-label="Move up">
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded-full p-1.5 text-foreground/60 hover:bg-white/20 disabled:opacity-30"
          aria-label="Move down">
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1.5 text-foreground/60 hover:bg-red-500/10 hover:text-red-500"
          aria-label="Remove">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function SettingsModal({ isOpen, onOpenChange }) {
  const { customization, updateCustomization } = useTheme();

  const [fonts, setFonts] = useState(() => {
    const saved = customization?.fontFamily;
    if (typeof saved === "string" && saved.trim()) {
      return saved
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }
    return [...DEFAULT_FONT_STACK];
  });

  const [availableFonts, setAvailableFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState(null);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    updateCustomization("fontFamily", fonts.join(", "));
  }, [fonts]);

  const loadDeviceFonts = async () => {
    if (!("queryLocalFonts" in window)) {
      setLoadError("Local Font Access API is not supported in this browser.");
      return;
    }
    setLoadingFonts(true);
    setLoadError(null);
    try {
      const fontData = await window.queryLocalFonts();
      const families = [...new Set(fontData.map((f) => f.family))].sort();
      setAvailableFonts(families);
    } catch (err) {
      setLoadError(err?.message || "Failed to load fonts from device.");
    } finally {
      setLoadingFonts(false);
    }
  };

  const addFont = (family) => {
    if (!family || fonts.includes(family)) return;
    setFonts((prev) => [...prev, family]);
    setSelectedFont(null);
  };

  const moveFont = (index, direction) => {
    setFonts((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeFont = (index) => {
    setFonts((prev) => prev.filter((_, i) => i !== index));
  };

  const addableFonts = availableFonts.filter((f) => !fonts.includes(f));

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={<span className="flex items-center gap-2.5">Settings</span>}
      className="max-w-xl border border-white/40 bg-card shadow-2xl"
      bodyClassName="space-y-4 py-4"
      backdropVariant="blur"
      stopPropagation
      footer={
        <Button variant="primary" onPress={() => onOpenChange(false)}>
          Done
        </Button>
      }>
      <section aria-labelledby="settings-fonts-heading">
        <div className="mb-3 flex flex-col gap-1">
          <h3
            id="settings-fonts-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground/80 uppercase">
            Fonts
          </h3>
          <p className="mb-2 text-sm text-foreground/60">
            Customize the fonts used across the extension.
          </p>
        </div>

        <div className="divide-y divide-black/5 overflow-hidden rounded-xl border border-white/40 bg-secondary shadow-sm">
          {fonts.length === 0 && (
            <div className="px-4 py-3.5 text-sm text-foreground/60">
              No fonts selected. Add one below.
            </div>
          )}
          {fonts.map((name, index) => (
            <FontRow
              key={`${name}-${index}`}
              name={name}
              index={index}
              total={fonts.length}
              onMoveUp={() => moveFont(index, -1)}
              onMoveDown={() => moveFont(index, 1)}
              onRemove={() => removeFont(index)}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onPress={loadDeviceFonts}
              isDisabled={loadingFonts}>
              {loadingFonts ? "Loading…" : "Load fonts from device"}
            </Button>
            {loadError && (
              <span className="text-xs text-red-500">{loadError}</span>
            )}
          </div>

          {availableFonts.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                aria-label="Add font"
                selectedKey={selectedFont}
                onSelectionChange={(key) => {
                  const value = String(key);
                  setSelectedFont(value);
                  addFont(value);
                }}
                className="w-full">
                <Select.Trigger className="w-full rounded-full bg-secondary">
                  <Select.Value placeholder="Add a font…" />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {addableFonts.map((family) => (
                      <ListBox.Item key={family} id={family} textValue={family}>
                        {family}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <Plus className="size-4 text-foreground/40" />
            </div>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-foreground/55">
          Fonts are tried in order — if a font is not available for a language,
          the next one is used.
        </p>
      </section>
    </BaseModal>
  );
}

export default SettingsModal;
