import { useState, useRef } from "react";
import { Toast } from "@heroui/react";
import Header from "./components/app/Header";
import Columns from "./components/app/Columns";
import CustomizeModal from "./components/modals/CustomizeModal";
import { Background } from "./components/app/Background";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useSyncBoardData } from "./hooks/useSyncBoardData";

function MainContent() {
  const columnsRef = useRef(null);
  const { globalStyles } = useTheme();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useSyncBoardData();

  const handleOpenSettings = () => {
    setModalVariant("complex");
    setIsModalOpen(true);
  };

  const handleOpenCustomize = () => {
    setIsCustomizeOpen(true);
  };

  return (
    <main className="min-h-screen w-full">
      <Header
        onOpenSettings={handleOpenSettings}
        onOpenCustomize={handleOpenCustomize}
        globalStyles={globalStyles}
      />

      <Columns ref={columnsRef} globalStyles={globalStyles} />

      <Toast.Provider />

      <CustomizeModal
        isOpen={isCustomizeOpen}
        onOpenChange={setIsCustomizeOpen}
      />

      <Background
        type="image"
        url="https://images.pexels.com/photos/5748340/pexels-photo-5748340.jpeg"
      />
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
