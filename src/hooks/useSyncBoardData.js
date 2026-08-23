import { useEffect } from "react";
import { useBoardStore } from "./useBoardStore";
import { toast } from "@heroui/react";

export function useSyncBoardData() {
  const addGroupWithSites = useBoardStore((s) => s.addGroupWithSites);

  useEffect(() => {
    // Function to process pending groups from storage
    const processPendingGroups = async () => {
      if (typeof chrome === "undefined" || !chrome.storage) return;

      try {
        const data = await chrome.storage.local.get("pendingGroups");
        if (data.pendingGroups && data.pendingGroups.length > 0) {
          // Process all pending groups
          data.pendingGroups.forEach((group) => {
            addGroupWithSites(group.title, group.sites);
          });

          // Clear the pending groups after processing
          await chrome.storage.local.remove("pendingGroups");

          toast.success("Saved tabs imported successfully!");
        }
      } catch (error) {
        console.error("Failed to sync board data:", error);
      }
    };

    // 1. Process any data that was saved before the tab was opened
    processPendingGroups();

    // 2. Listen to messages from background script for real-time updates
    const handleMessage = (message, sender, sendResponse) => {
      if (message.type === "NEW_TABS_SAVED") {
        processPendingGroups();
      }
    };

    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.onMessage
    ) {
      chrome.runtime.onMessage.addListener(handleMessage);

      // Cleanup listener on unmount
      return () => {
        chrome.runtime.onMessage.removeListener(handleMessage);
      };
    }
  }, [addGroupWithSites]);
}
