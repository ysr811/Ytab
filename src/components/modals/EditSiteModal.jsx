import { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Label,
  TextField,
  FieldError,
} from "@heroui/react";
import BaseModal from "./BaseModal";

export function EditSiteModal({
  isOpen,
  onOpenChange,
  initialData = {},
  onSave,
  onAddSite,
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const urlInputRef = useRef(null);

  const isEditMode = Boolean(initialData?.url);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialData?.url || "");
      setName(initialData?.title || "");
      setDescription(initialData?.description || "");
      setError("");
      setIsSubmitted(false);
      setTimeout(() => urlInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const validateUrlFormat = (urlString) => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const extractNameFromUrl = (rawUrl) => {
    try {
      const hostname = new URL(rawUrl).hostname.replace(/^www\./i, "");
      const mainPart = hostname.split(".")[0];
      if (!mainPart) return "";
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    } catch {
      return "";
    }
  };

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }

    setIsSubmitted(true);

    const trimmedUrl = url.trim();
    let trimmedName = name.trim();

    if (!trimmedUrl) {
      setError("URL is required");
      return;
    }

    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!validateUrlFormat(finalUrl)) {
      setError("Invalid URL format");
      return;
    }

    if (!trimmedName) {
      trimmedName = extractNameFromUrl(finalUrl);
    }

    const domain = finalUrl.replace(/^https?:\/\//i, "").split("/")[0];
    const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const siteData = {
      id: initialData?.id || `site-${Date.now()}`,
      title: trimmedName,
      url: finalUrl,
      description: description.trim(),
      icon,
    };

    if (onSave) onSave(siteData);
    if (onAddSite) onAddSite(siteData);

    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isUrlInvalid =
    (isSubmitted || error !== "") && (!url.trim() || !!error);
  const errorMessage = !url.trim() ? "URL is required" : error;

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Edit Site" : "Add Site"}
      bodyClassName="py-4 flex flex-col gap-3"
      stopPropagation
      footer={
        <>
          <Button variant="tertiary" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            disabled={!url.trim()}
          >
            Save
          </Button>
        </>
      }
    >
      <TextField isInvalid={isUrlInvalid} className="w-full">
        <Label htmlFor="edit-site-url">URL*</Label>
        <Input
          id="edit-site-url"
          ref={urlInputRef}
          placeholder="google.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          variant="secondary"
          className="w-full"
        />
        {isUrlInvalid && <FieldError>{errorMessage}</FieldError>}
      </TextField>

      <TextField className="w-full">
        <Label htmlFor="edit-site-name">Site Name</Label>
        <Input
          id="edit-site-name"
          placeholder="Optional (Auto-generated if empty)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="secondary"
          className="w-full"
        />
      </TextField>

      <TextField className="w-full">
        <Label htmlFor="edit-site-description">Description</Label>
        <Input
          id="edit-site-description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="secondary"
          className="w-full"
        />
      </TextField>
    </BaseModal>
  );
}

export default EditSiteModal;
