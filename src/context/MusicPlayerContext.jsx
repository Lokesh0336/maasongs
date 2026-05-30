import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

/** Fisherâ€“Yates shuffle */
function smartShuffle(arr, excludeIds = []) {
  const filtered = arr.filter((s) => !excludeIds.includes(s.id));

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);

const [playlist, setPlaylist] = useState([]);
const [playedHistory, setPlayedHistory] = useState([]);
const [remainingShuffle, setRemainingShuffle] = useState([]);

const [currentIndex, setCurrentIndex] = useState(-1);
const [isPlaying, setIsPlaying] = useState(false);

const [shuffle, setShuffle] = useState(false);

const [volume, setVolume] = useState(1);

const [repeatMode, setRepeatMode] = useState("off"); 
// "off" | "all" | "one"

const getPlaybackList = useCallback(() => {
  return playlist;
}, [playlist]);

  const currentTrack = useMemo(() => {
    const list = getPlaybackList();
    return list && list.length > 0 && currentIndex >= 0 && currentIndex < list.length
      ? list[currentIndex]
      : null;
  }, [getPlaybackList, currentIndex]);

  const toAbsolute = (u) => {
    if (!u) return "";
    try {
      return new URL(u, window.location.href).href;
    } catch {
      return u;
    }
  };

  /** Play a specific track from the existing playlist */
  const playTrack = useCallback((track) => {
    const list = getPlaybackList();
    const idx = list.findIndex((s) => s.id === track.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsPlaying(true);
    }
  }, [getPlaybackList]);

const handleNext = useCallback(() => {
  const list = getPlaybackList();

  if (!list.length) return;

  // SMART SHUFFLE MODE
  if (shuffle) {
    let remaining = [...remainingShuffle];

    // Rebuild queue after all songs played
    if (remaining.length === 0) {
      const excludeRecent = playedHistory.slice(-3);

      remaining = smartShuffle(playlist, excludeRecent);

      setRemainingShuffle(remaining);
    }

    const nextTrack = remaining.shift();

    if (!nextTrack) return;

    const nextIndex = playlist.findIndex(
      (s) => s.id === nextTrack.id
    );

    setRemainingShuffle(remaining);

    setPlayedHistory((prev) => [
      ...prev,
      nextTrack.id,
    ]);

    setCurrentIndex(nextIndex);

    setIsPlaying(true);

    return;
  }

  // NORMAL MODE
  setCurrentIndex((prev) => {
    const next = prev + 1;

    if (next >= list.length) {
      if (repeatMode === "all") return 0;

      setIsPlaying(false);

      return prev;
    }

    return next;
  });

  setIsPlaying(true);
}, [
  getPlaybackList,
  repeatMode,
  shuffle,
  remainingShuffle,
  playedHistory,
  playlist,
]);

const handlePrev = useCallback(() => {
  if (playlist.length === 0) return;

  setCurrentIndex((prev) => {
    if (prev <= 0) return playlist.length - 1;

    return prev - 1;
  });

  setIsPlaying(true);
}, [playlist]);

// Media Session API
useEffect(() => {
  if ("mediaSession" in navigator && currentTrack) {
    navigator.mediaSession.metadata =
      new window.MediaMetadata({
        title: currentTrack.title || "Unknown Track",
        artist:
          currentTrack.artist || "Unknown Artist",
        album: "AudioStation",
        artwork: [
          {
            src:
              currentTrack.image_url ||
              "https://placehold.co/512x512",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

    navigator.mediaSession.setActionHandler(
      "play",
      () => setIsPlaying(true)
    );

    navigator.mediaSession.setActionHandler(
      "pause",
      () => setIsPlaying(false)
    );

    navigator.mediaSession.setActionHandler(
      "previoustrack",
      () => handlePrev()
    );

    navigator.mediaSession.setActionHandler(
      "nexttrack",
      () => handleNext()
    );
  }
}, [currentTrack, handleNext, handlePrev]);


  // Volume Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  // Audio Event Listeners
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onEnded = () => {
      if (repeatMode === "one") {
        a.currentTime = 0;
        a.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    const onError = () => handleNext();

    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [handleNext, repeatMode]);

  // Central Audio Control with Interruption Fix
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const track = currentTrack;
    if (!track) {
      a.pause();
      return;
    }

    const absUrl = toAbsolute(track.audio_url);
    
    if (a.src !== absUrl) {
      a.pause(); // Pause before changing source
      a.src = absUrl;
      a.load(); 
    }

    if (isPlaying) {
      // Small timeout or check to ensure the resource is ready to play
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("Playback error:", err);
          }
        });
      }
    } else {
      a.pause();
    }
  }, [currentTrack, isPlaying]);

  const normalizeList = (list) =>
    (list || []).map((it) => ({
      ...it,
      id: it.id ?? it.uuid ?? Math.random().toString(36).slice(2),
      audio_url: it.audio_url ?? it.audioUrl ?? it.src ?? it.url ?? "",
    }));

const playList = (list = [], startIndex = 0, useShuffle = false) => {
  const normalized = normalizeList(list);

  if (normalized.length === 0) return;

  const requestedItem =
    normalized[startIndex] || normalized[0];

  const idx = normalized.findIndex(
    (s) => s.id === requestedItem.id
  );

  // IMPORTANT
  setPlaylist(normalized);

  setCurrentIndex(idx);

  if (useShuffle) {
    setShuffle(true);

    const remaining = smartShuffle(
      normalized,
      [requestedItem.id]
    );

    setPlayedHistory([requestedItem.id]);

    setRemainingShuffle(remaining);
  } else {
    setShuffle(false);

    setPlayedHistory([]);

    setRemainingShuffle([]);
  }

  setIsPlaying(true);
};

  const handlePlayPause = () => setIsPlaying((prev) => !prev);

const toggleShuffle = () => {
  const current = currentTrack;

  setShuffle((prev) => {
    const next = !prev;

    if (next) {
      const remaining = smartShuffle(
        playlist,
        current ? [current.id] : []
      );

      setRemainingShuffle(remaining);

      setPlayedHistory(
        current ? [current.id] : []
      );
    } else {
      setRemainingShuffle([]);

      setPlayedHistory([]);
    }

    return next;
  });
};

  const toggleRepeatMode = () => {
    setRepeatMode((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    setPlaylist([]);
    setPlayedHistory([]);
    setRemainingShuffle([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src"); 
      audioRef.current.load();
    }
  };

  const value = {
    audioRef,
    playlist,
    currentIndex,
    currentTrack,
    isPlaying,
    shuffle,
    repeatMode,
    playList,
    playTrack, // EXPORTED NOW
    handlePlayPause,
    handleNext,
    handlePrev,
    toggleShuffle,
    toggleRepeatMode,
    stop,
    setVolume,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} style={{ display: "none" }} preload="auto" />
    </PlayerContext.Provider>
  );
}
