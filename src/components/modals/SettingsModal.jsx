import { useState, useEffect, useRef } from "react";
import {
  Button,
  ListBox,
  Select,
  Label,
  Slider,
  ColorSwatchPicker,
} from "@heroui/react";
import { ArrowUp, ArrowDown, Trash2, Plus, ImageIcon, X } from "lucide-react";
import BaseModal from "./BaseModal";
import { useTheme } from "../../context/ThemeContext";
import { useBackgroundImages } from "../../hooks/useBackgroundImages";

const DEFAULT_FONT_STACK = ["system-ui", "sans-serif"];

const presetColors = [
  "#F43F5E",
  "#D946EF",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#84CC16",
];

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

  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const activeColor = customization.accentColor || presetColors[0];

  const { images: backgroundImages, addImages, removeImage } = useBackgroundImages();

  useEffect(() => {
    updateCustomization("fontFamily", fonts.join(", "));
  }, [fonts, updateCustomization]);

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

  const handleSwatchChange = (colorValue) => {
    if (!colorValue) return;
    const hex = colorValue.toString();
    updateCustomization("accentColor", hex);
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    addImages([url]);
    setImageUrl("");
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const dataUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    addImages(dataUrls);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index) => {
    removeImage(index);
  };

  const addableFonts = availableFonts.filter((f) => !fonts.includes(f));

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={<span className="flex items-center gap-2.5">Settings</span>}
      className="max-w-xl border border-white/40 shadow-2xl"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.96)", backdropFilter: "none" }}
      bodyClassName="space-y-4 py-4"
      backdropVariant="blur"
      stopPropagation
      footer={
        <Button variant="primary" onPress={() => onOpenChange(false)}>
          Done
        </Button>
      }>
      <section aria-labelledby="settings-customization-heading">
        <div className="mb-3 flex flex-col gap-1">
          <h3
            id="settings-customization-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground uppercase">
            Customization
          </h3>
          <p className="mb-2 text-sm text-foreground/60">
            Customize the appearance of the extension.
          </p>
        </div>

        <div className="divide-y divide-black/5 overflow-hidden rounded-xl border border-white/40 bg-secondary shadow-sm">
          <div className="px-4 py-3.5">
            <label className="text-sm font-medium mb-2 block text-foreground">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <ColorSwatchPicker
                value={activeColor}
                onChange={handleSwatchChange}>
                {presetColors.map((color) => (
                  <ColorSwatchPicker.Item key={color} color={color}>
                    <ColorSwatchPicker.Swatch />
                    <ColorSwatchPicker.Indicator />
                  </ColorSwatchPicker.Item>
                ))}
              </ColorSwatchPicker>

              <input
                type="color"
                value={activeColor}
                onChange={(e) => updateCustomization("accentColor", e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-full border border-white/40 bg-transparent p-0"
                style={{ borderRadius: "9999px", overflow: "hidden" }}
                title="Pick custom color"
              />
            </div>
          </div>

          <div className="px-4 py-3.5">
            <Slider
              className="w-full"
              minValue={0}
              maxValue={1}
              step={0.05}
              value={customization.opacity ?? 1}
              onChange={(val) =>
                updateCustomization(
                  "opacity",
                  Array.isArray(val) ? val[0] : val
                )
              }>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-medium">Card Opacity</Label>
                <Slider.Output className="text-sm font-medium" />
              </div>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>

          <div className="px-4 py-3.5">
            <Slider
              className="w-full"
              minValue={0}
              maxValue={40}
              step={1}
              value={customization.blur ?? 0}
              onChange={(val) =>
                updateCustomization("blur", Array.isArray(val) ? val[0] : val)
              }>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-sm font-medium">Card Blur</Label>
                <Slider.Output className="text-sm font-medium" />
              </div>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>
        </div>
      </section>

      <section aria-labelledby="settings-background-heading">
        <div className="mb-3 flex flex-col gap-1">
          <h3
            id="settings-background-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground uppercase">
            Background Image
          </h3>
          <p className="mb-2 text-sm text-foreground/60">
            Add images to rotate through on every new tab.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/40 bg-secondary shadow-sm">
          <div className="px-4 py-3.5">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste an image URL…"
                className="flex-1 rounded-full border border-white/40 bg-white/60 px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent"
              />
              <Button variant="secondary" onPress={addImageUrl}>
                <Plus className="size-4" />
                Add URL
              </Button>
              <Button
                variant="secondary"
                onPress={() => fileInputRef.current?.click()}>
                <ImageIcon className="size-4" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
            </div>

            {backgroundImages.length === 0 ? (
              <div className="py-6 text-center text-sm text-foreground/60">
                No background images. Add one above.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {backgroundImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="group relative overflow-hidden rounded-lg border border-white/40 bg-white/40">
                    <img
                      src={src}
                      alt={`Background ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove image">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="settings-fonts-heading">
        <div className="mb-3 flex flex-col gap-1">
          <h3
            id="settings-fonts-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground uppercase">
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

        <p className="mt-3 text-xs leading-relaxed text-foreground/80">
          Fonts are tried in order — if a font is not available for a language,
          the next one is used.
        </p>
      </section>
    </BaseModal>
  );
}

export default SettingsModal;