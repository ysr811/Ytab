import { useState, useRef, useEffect } from "react";
import { Toast } from "@heroui/react";
import Header from "./components/app/Header";
import Columns from "./components/app/Columns";
import SettingsModal from "./components/modals/SettingsModal";
import { Background } from "./components/app/Background";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useSyncBoardData } from "./hooks/useSyncBoardData";
import { useBackgroundImages } from "./hooks/useBackgroundImages";

const DEFAULT_BACKGROUND_IMAGE =
  "https://images.pexels.com/photos/5748340/pexels-photo-5748340.jpeg";

function MainContent() {
  const columnsRef = useRef(null);
  const { globalStyles } = useTheme();
  const { images: bgImages, loading: bgLoading } = useBackgroundImages();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);

  useSyncBoardData();

  useEffect(() => {
    if (bgLoading) return;
    if (Array.isArray(bgImages) && bgImages.length > 0) {
      setBackgroundImageUrl(bgImages[Math.floor(Math.random() * bgImages.length)]);
    } else {
      setBackgroundImageUrl(DEFAULT_BACKGROUND_IMAGE);
    }
  }, [bgImages, bgLoading]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <main className="min-h-screen w-full">
      <Header
        onOpenSettings={handleOpenSettings}
        globalStyles={globalStyles}
      />

      <Columns ref={columnsRef} globalStyles={globalStyles} />

      <Toast.Provider />

      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {backgroundImageUrl ? (
        <Background
          type="image"
          url={backgroundImageUrl}
        />
      ) : (
        <Background type="color" url="#000000" />
      )}
    </main>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}

export default App;
