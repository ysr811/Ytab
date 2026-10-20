import { useState } from "react";
import {
  ButtonGroup,
  Button,
  Dropdown,
  Label,
  toast,
} from "@heroui/react";
import {
  FolderOpen,
  Timer,
  Clock,
  StickyNote,
} from "lucide-react";
import { useBoardStore } from "../../hooks/useBoardStore";
import { useTheme } from "../../context/ThemeContext";
import Pages from "./Pages";

// ── Widget options in "Add Widget" dropdown ────────────────────────────────
const WIDGET_OPTIONS = [
  { key: "group", icon: FolderOpen },
  { key: "pomodoro", icon: Timer },
  { key: "clock", icon: Clock },
  { key: "note", icon: StickyNote },
];

// ── Logo ───────────────────────────────────────────────────────────────────
export function Logo() {
  const { customization } = useTheme();
  const hide =
    customization?.hideLogo ||
    customization?.hideYTabLogo ||
    customization?.hideYtabLogo ||
    customization?.hideLogoYTab;
  if (hide) return null;
  return (
    <div className="font-bold text-xl tracking-wide shrink-0">
      <img src="/logo.svg" alt="YTab Logo" width="80" height="36" className="w-20 h-9" />
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────
export function Buttons({ onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const addWidget = useBoardStore((state) => state.addWidget);
  const { customization } = useTheme();
  const hideAbout =
    customization?.hideAbout ||
    customization?.hideAboutButton ||
    customization?.hideAboutBtn;

  const handleWidgetSelect = (key) => {
    setIsOpen(false);
    addWidget(key);
  };

  return (
    <div className="shrink-0">
      <ButtonGroup variant="tertiary">
        <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
          <Button className="bg-secondary" variant="tertiary">
            Add Widget
          </Button>
          <Dropdown.Popover placement="bottom right">
            <Dropdown.Menu onAction={handleWidgetSelect}>
              {WIDGET_OPTIONS.map(({ key, icon: Icon }) => (
                <Dropdown.Item key={key} id={key} textValue={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <Label className="cursor-pointer capitalize">{key}</Label>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
        <Button onPress={onOpenSettings} className="bg-secondary">
          Settings
        </Button>
        {!hideAbout && (
          <Button
            className="bg-secondary"
            onPress={() => window.open("https://github.com/ysr811/Ytab", "_blank")}
          >
            About
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ onOpenSettings }) {
  return (
    <header className="w-full h-18 flex items-center justify-start gap-6 px-6 py-4">
      <Logo />
      <div className="flex-1 min-w-0 flex justify-start">
        <Pages />
      </div>
      <Buttons
        onOpenSettings={onOpenSettings}
      />
    </header>
  );
}

export default Header;
