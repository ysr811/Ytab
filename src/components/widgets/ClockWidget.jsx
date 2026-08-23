import React, { useState, useEffect, memo } from "react";
import { Card, Button, Dropdown, Label, toast } from "@heroui/react";
import { EllipsisVertical, Trash2, Clock, Calendar, Check } from "lucide-react";
import { useBoardStore } from "../../hooks/useBoardStore";

export const ClockWidget = memo(function ClockWidget({
  id,
  settings = {},
  isOverlay,
  attributes,
  listeners,
  onDelete,
}) {
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const updateWidgetSettings = useBoardStore((s) => s.updateWidgetSettings);

  const showSeconds = settings.showSeconds ?? false;
  const showDate = settings.showDate ?? true;
  const is24Hour = settings.is24Hour ?? false;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds && { second: "2-digit" }),
    hour12: !is24Hour,
  });

  const [timeDigits, dayPeriod] = rawTime.split(" ");

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={`group/card bg-card w-full p-3 ${isOverlay ? "shadow-2xl scale-101" : ""}`}
    >
      <Card.Header
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing pb-2 select-none flex flex-row justify-between items-center"
      >
        <Card.Title>Clock</Card.Title>

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
                  if (key === "toggle-seconds") {
                    updateWidgetSettings(id, { showSeconds: !showSeconds });
                  } else if (key === "toggle-24h") {
                    updateWidgetSettings(id, { is24Hour: !is24Hour });
                  } else if (key === "toggle-date") {
                    updateWidgetSettings(id, { showDate: !showDate });
                  } else if (key === "delete" && onDelete) {
                    onDelete();
                    toast.success("Widget deleted successfully");
                  }
                }}
              >
                <Dropdown.Item id="toggle-seconds" textValue="toggle seconds">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Show Seconds
                      </Label>
                    </div>
                    {showSeconds && <Check className="size-4 text-accent" />}
                  </div>
                </Dropdown.Item>

                <Dropdown.Item id="toggle-24h" textValue="toggle 24h format">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        24-Hour Format
                      </Label>
                    </div>
                    {is24Hour && <Check className="size-4 text-accent" />}
                  </div>
                </Dropdown.Item>

                <Dropdown.Item id="toggle-date" textValue="toggle date">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Show Date
                      </Label>
                    </div>
                    {showDate && <Check className="size-4 text-accent" />}
                  </div>
                </Dropdown.Item>

                <Dropdown.Item id="delete" textValue="delete" variant="danger">
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

      <Card.Content className="p-0 flex flex-col items-center justify-center py-4">
        <div
          className={`flex font-mono ${
            showSeconds && !is24Hour
              ? "flex-col items-center gap-1"
              : "items-baseline gap-1.5"
          }`}
        >
          <span className="text-5xl font-bold tracking-tight">
            {timeDigits}
          </span>
          {dayPeriod && (
            <span
              className={`font-bold text-accent ${
                showSeconds && !is24Hour ? "text-4xl w-full" : "text-base"
              }`}
            >
              {dayPeriod}
            </span>
          )}
        </div>

        {showDate && (
          <span className="text-xs mt-2 font-medium">{formattedDate}</span>
        )}
      </Card.Content>
    </Card>
  );
});

export default ClockWidget;
