import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ytab_background_images";

async function readImages() {
  if (typeof chrome !== "undefined" && chrome?.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (res) => {
        resolve(Array.isArray(res?.[STORAGE_KEY]) ? res[STORAGE_KEY] : []);
      });
    });
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

async function writeImages(images) {
  if (typeof chrome !== "undefined" && chrome?.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: images }, () => resolve());
    });
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch {
    // ignore quota errors in dev
  }
}

export function useBackgroundImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    readImages().then((imgs) => {
      if (mounted) {
        setImages(imgs);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addImages = useCallback((newImages) => {
    setImages((prev) => {
      const next = [...prev, ...newImages];
      writeImages(next);
      return next;
    });
  }, []);

  const removeImage = useCallback((index) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      writeImages(next);
      return next;
    });
  }, []);

  return { images, loading, addImages, removeImage };
}

export default useBackgroundImages;