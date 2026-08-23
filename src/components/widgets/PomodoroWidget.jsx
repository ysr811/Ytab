import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Card,
  Button,
  Tabs,
  Tooltip,
  Dropdown,
  Label,
  toast,
} from "@heroui/react";
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  RepeatOff,
  EllipsisVertical,
  Trash2,
  Clock,
  Coffee,
  Check,
  Volume2,
} from "lucide-react";

import { useBoardStore } from "../../hooks/useBoardStore";

const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 60];
const BREAK_OPTIONS = [3, 5, 10, 15, 20];
const ALARM_SOUNDS = [
  { key: "digital", label: "Digital", src: "/sounds/1_timer_sound.mp3" },
  { key: "alarm", label: "Alarm", src: "/sounds/2_timer_sound.mp3" },
];

export const PomodoroWidget = memo(function PomodoroWidget({
  id,
  settings = {},
  isOverlay,
  attributes,
  listeners,
  onDelete,
}) {
  const updateWidgetSettings = useBoardStore((s) => s.updateWidgetSettings);

  const initialModeTimes = settings.modeTimes || { focus: 25 * 60, break: 5 * 60 };
  const initialMode = settings.mode || "focus";
  const initialAlarmSound = settings.alarmSound || ALARM_SOUNDS[0].key;
  const initialAutoSwitch = settings.isAutoSwitch || false;

  const [modeTimes, setModeTimes] = useState(initialModeTimes);
  const [mode, setMode] = useState(initialMode);
  const [timeLeft, setTimeLeft] = useState(initialModeTimes[initialMode] || 25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoSwitch, setIsAutoSwitch] = useState(initialAutoSwitch);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [alarmSound, setAlarmSound] = useState(initialAlarmSound);
  const inputRef = useRef(null);
  const prevTimeRef = useRef(timeLeft);

  useEffect(() => {
    if (settings.modeTimes) setModeTimes(settings.modeTimes);
    if (settings.alarmSound) setAlarmSound(settings.alarmSound);
    if (settings.isAutoSwitch !== undefined) setIsAutoSwitch(settings.isAutoSwitch);
  }, [settings.modeTimes, settings.alarmSound, settings.isAutoSwitch]);

  const playAlarm = useCallback(() => {
    const sound = ALARM_SOUNDS.find((s) => s.key === alarmSound);
    if (sound) {
      new Audio(sound.src).play().catch(() => {});
    }
  }, [alarmSound]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isAutoSwitch) {
        const nextMode = mode === "focus" ? "break" : "focus";
        setMode(nextMode);
        setTimeLeft(modeTimes[nextMode]);
      } else {
        setIsRunning(false);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isAutoSwitch, mode, modeTimes]);

  useEffect(() => {
    if (prevTimeRef.current > 0 && timeLeft === 0) {
      playAlarm();
    }
    prevTimeRef.current = timeLeft;
  }, [timeLeft, playAlarm]);

  const handleModeChange = (key) => {
    const selectedMode = String(key);
    setMode(selectedMode);
    setTimeLeft(modeTimes[selectedMode]);
    setIsRunning(false);
    if (id) updateWidgetSettings(id, { mode: selectedMode });
  };

  const handleSetDuration = (targetMode, minutes) => {
    const seconds = minutes * 60;
    const nextModeTimes = {
      ...modeTimes,
      [targetMode]: seconds,
    };
    setModeTimes(nextModeTimes);
    if (mode === targetMode) {
      setTimeLeft(seconds);
      setIsRunning(false);
    }
    if (id) updateWidgetSettings(id, { modeTimes: nextModeTimes });
    toast.success(
      `${targetMode === "focus" ? "Focus" : "Break"} time set to ${minutes} mins`
    );
  };

  const handleSoundChange = (soundKey) => {
    setAlarmSound(soundKey);
    if (id) updateWidgetSettings(id, { alarmSound: soundKey });
  };

  const handleAutoSwitchToggle = () => {
    const nextVal = !isAutoSwitch;
    setIsAutoSwitch(nextVal);
    if (id) updateWidgetSettings(id, { isAutoSwitch: nextVal });
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartEditTime = () => {
    setIsEditingTime(true);
    setTimeInput(formatTime(timeLeft));
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const handleTimeInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setTimeInput(digits);
    } else {
      setTimeInput(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    }
  };

  const handleSaveCustomTime = () => {
    setIsEditingTime(false);
    const clean = timeInput.trim();
    if (!clean) return;

    let totalSeconds = 0;
    if (clean.includes(":")) {
      const [m, s] = clean.split(":").map((v) => parseInt(v, 10));
      const mins = isNaN(m) ? 0 : m;
      const secs = isNaN(s) ? 0 : s;
      totalSeconds = mins * 60 + secs;
    } else {
      const val = parseInt(clean, 10);
      if (!isNaN(val)) {
        totalSeconds = val * 60;
      }
    }

    if (totalSeconds > 0 && totalSeconds <= 36000) {
      setTimeLeft(totalSeconds);
      setModeTimes((prev) => ({
        ...prev,
        [mode]: totalSeconds,
      }));
      setIsRunning(false);
      toast.success(`Timer set to ${formatTime(totalSeconds)}`);
    } else if (totalSeconds <= 0) {
      toast.danger("Please enter a valid time");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveCustomTime();
    } else if (e.key === "Escape") {
      setIsEditingTime(false);
    }
  };

  return (
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
        <Card.Title>Pomodoro</Card.Title>

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
                  if (key === "delete" && onDelete) {
                    onDelete();
                    toast.success("Widget deleted successfully");
                  }
                }}
              >
                <Dropdown.SubmenuTrigger>
                  <Dropdown.Item id="focus-duration" textValue="Focus Duration">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Focus Duration
                      </Label>
                    </div>
                    <Dropdown.SubmenuIndicator />
                  </Dropdown.Item>
                  <Dropdown.Popover placement="start top">
                    <Dropdown.Menu
                      onAction={(key) =>
                        handleSetDuration("focus", Number(key))
                      }
                    >
                      {FOCUS_OPTIONS.map((mins) => (
                        <Dropdown.Item
                          key={mins}
                          id={mins}
                          textValue={`${mins} mins`}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <Label className="cursor-pointer">
                              {mins} mins
                            </Label>
                            {modeTimes.focus === mins * 60 && (
                              <Check className="size-4 text-accent" />
                            )}
                          </div>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.SubmenuTrigger>

                <Dropdown.SubmenuTrigger>
                  <Dropdown.Item id="break-duration" textValue="Break Duration">
                    <div className="flex items-center gap-2">
                      <Coffee className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Break Duration
                      </Label>
                    </div>
                    <Dropdown.SubmenuIndicator />
                  </Dropdown.Item>
                  <Dropdown.Popover placement="start top">
                    <Dropdown.Menu
                      onAction={(key) =>
                        handleSetDuration("break", Number(key))
                      }
                    >
                      {BREAK_OPTIONS.map((mins) => (
                        <Dropdown.Item
                          key={mins}
                          id={mins}
                          textValue={`${mins} mins`}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <Label className="cursor-pointer">
                              {mins} mins
                            </Label>
                            {modeTimes.break === mins * 60 && (
                              <Check className="size-4 text-accent" />
                            )}
                          </div>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.SubmenuTrigger>

                <Dropdown.SubmenuTrigger>
                  <Dropdown.Item id="alarm-sound" textValue="Alarm Sound">
                    <div className="flex items-center gap-2">
                      <Volume2 className="size-4" />
                      <Label className="cursor-pointer capitalize">
                        Alarm Sound
                      </Label>
                    </div>
                    <Dropdown.SubmenuIndicator />
                  </Dropdown.Item>
                  <Dropdown.Popover placement="start top">
                    <Dropdown.Menu onAction={(key) => handleSoundChange(String(key))}>
                      {ALARM_SOUNDS.map((sound) => (
                        <Dropdown.Item
                          key={sound.key}
                          id={sound.key}
                          textValue={sound.label}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <Label className="cursor-pointer">
                              {sound.label}
                            </Label>
                            {alarmSound === sound.key && (
                              <Check className="size-4 text-accent" />
                            )}
                          </div>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.SubmenuTrigger>

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

      <Card.Content className="p-0 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center justify-center py-2 min-h-14">
          {isEditingTime ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={timeInput}
              onChange={handleTimeInputChange}
              onBlur={handleSaveCustomTime}
              onKeyDown={handleKeyDown}
              className="text-5xl font-light tracking-tight font-mono text-center w-full max-w-[5ch] h-12 p-0 m-0 bg-transparent border-none outline-none focus:ring-0 leading-none text-foreground"
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={handleStartEditTime}
              title="Double-click to edit time"
              className="text-5xl font-light tracking-tight font-mono leading-none cursor-pointer select-none"
            >
              {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Tooltip delay={3000} closeDelay={300}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                variant="tertiary"
                size="sm"
                onClick={resetTimer}
                aria-label="Reset Timer"
                className="bg-secondary"
              >
                <RotateCcw className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Reset Timer</Tooltip.Content>
          </Tooltip>

          <Tooltip delay={3000} closeDelay={300}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                size="lg"
                onClick={toggleTimer}
                aria-label={isRunning ? "Pause Timer" : "Start Timer"}
                className="rounded-full"
              >
                {isRunning ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 fill-current" />
                )}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {isRunning ? "Pause Timer" : "Start Timer"}
            </Tooltip.Content>
          </Tooltip>

          <Tooltip delay={3000} closeDelay={300}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                variant="tertiary"
                size="sm"
                onClick={handleAutoSwitchToggle}
                aria-label="Auto Switch Mode"
              >
                {isAutoSwitch ? (
                  <Repeat className="size-4" />
                ) : (
                  <RepeatOff className="size-4 opacity-50" />
                )}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {isAutoSwitch ? "Disable Auto-start" : "Enable Auto-start"}
            </Tooltip.Content>
          </Tooltip>
        </div>

        <Tabs
          selectedKey={mode}
          onSelectionChange={handleModeChange}
          className="w-full"
        >
          <Tabs.ListContainer className="w-full bg-secondary">
            <Tabs.List aria-label="Pomodoro Modes">
              {Object.keys(modeTimes).map((m) => {
                const isSelected = mode === m;

                return (
                  <Tabs.Tab
                    key={m}
                    id={m}
                    className="capitalize transition-colors duration-200"
                    style={{
                      color: isSelected ? "#ffffff" : undefined,
                    }}
                  >
                    {m}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </Card.Content>
    </Card>
  );
});

export default PomodoroWidget;
