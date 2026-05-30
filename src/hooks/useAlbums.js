// src/hooks/useAlbums.js
import { useEffect, useState } from "react";
import { albums as defaultAlbums } from "../data/albums";

const STORAGE_KEY = "tmh_albums";

export function useAlbums() {
  const [albums, setAlbums] = useState(defaultAlbums);

  // Load from localStorage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setAlbums(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load albums from storage", err);
    }
  }, []);

  const saveAlbums = (nextAlbums) => {
    setAlbums(nextAlbums);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAlbums));
    } catch (err) {
      console.error("Failed to save albums to storage", err);
    }
  };

  return { albums, saveAlbums };
}
