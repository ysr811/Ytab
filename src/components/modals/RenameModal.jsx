import { useState, useEffect, useRef } from "react";
import { Button, Input } from "@heroui/react";
import BaseModal from "./BaseModal";

export function RenameModal({
  isOpen,
  onOpenChange,
  itemType,
  currentName,
  onRename,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || "");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (trimmed === currentName) {
      onOpenChange(false);
      return;
    }
    onRename(trimmed);
    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const labels = { site: "Site", page: "Page", group: "Group", note: "Note" };
  const label = labels[itemType] || "Item";

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Rename ${label}`}
      footer={
        <>
          <Button variant="tertiary" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            isDisabled={!name.trim() || name.trim() === currentName}
          >
            Rename
          </Button>
        </>
      }
    >
      <Input
        ref={inputRef}
        aria-label={`${label} name`}
        placeholder={`Enter ${label.toLowerCase()} name...`}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError("");
        }}
        fullWidth
        onKeyDown={handleKeyDown}
        isInvalid={!!error}
        autoFocus
        variant="secondary"
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </BaseModal>
  );
}

export default RenameModal;
