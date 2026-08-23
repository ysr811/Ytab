import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Label, Slider, ColorSwatchPicker } from "@heroui/react";
import { Pipette } from "lucide-react";
import BaseModal from "./BaseModal";

const presetColors = [
  "#F43F5E",
  "#D946EF",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#84CC16",
];

export function CustomizeModal({ isOpen, onOpenChange }) {
  const { customization, updateCustomization } = useTheme();
  const [customColor, setCustomColor] = useState("#EAB308");

  const activeColor = customization.accentColor || presetColors[0];

  const isPresetColor = presetColors.some(
    (c) => c.toLowerCase() === activeColor.toLowerCase()
  );

  const isEyeDropperActive = !isPresetColor;

  useEffect(() => {
    if (isEyeDropperActive) {
      setCustomColor(activeColor);
    }
  }, [activeColor, isEyeDropperActive]);

  const handleSwatchChange = (colorValue) => {
    if (!colorValue) return;
    const hex = colorValue.toString();
    updateCustomization("accentColor", hex);
  };

  const handleEyeDropper = async () => {
    if (!("EyeDropper" in window)) {
      alert("EyeDropper API is not supported in your browser.");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const hex = result.sRGBHex;
        setCustomColor(hex);
        updateCustomization("accentColor", hex);
      }
    } catch (err) {
      // User cancelled
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Customize Appearance"
      placement="bottom"
      backdropVariant="transparent"
      bodyClassName="space-y-6 py-4"
    >
      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">
          Accent Color
        </label>
        <div className="flex items-center gap-2">
          <ColorSwatchPicker
            value={isEyeDropperActive ? null : activeColor}
            onChange={handleSwatchChange}
          >
            {presetColors.map((color) => (
              <ColorSwatchPicker.Item key={color} color={color}>
                <ColorSwatchPicker.Swatch />
                <ColorSwatchPicker.Indicator />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>

          <button
            type="button"
            onClick={handleEyeDropper}
            style={{
              backgroundColor: customColor,
              boxShadow: isEyeDropperActive
                ? `0 0 0 2px var(--bg-background, #fff), 0 0 0 4px ${customColor}`
                : "none",
            }}
            className={`relative flex shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 ${
              isEyeDropperActive ? "h-6 w-6 m-1" : "h-7 w-7"
            }`}
            title="Pick custom color"
          >
            <Pipette className="h-3.5 w-3.5 text-white drop-shadow-md" />
          </button>
        </div>
      </div>

      <div className="w-full">
        <Slider
          className="w-full"
          minValue={0}
          maxValue={1}
          step={0.05}
          value={customization.opacity ?? 1}
          onChange={(val) => updateCustomization("opacity", val)}
        >
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

      <div className="w-full">
        <Slider
          className="w-full"
          minValue={0}
          maxValue={40}
          step={1}
          value={customization.blur ?? 0}
          onChange={(val) => updateCustomization("blur", val)}
        >
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
    </BaseModal>
  );
}

export default CustomizeModal;
