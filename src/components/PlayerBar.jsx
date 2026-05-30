import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlay, FaPause, FaStepBackward, FaStepForward,
  FaRandom, FaRedo, FaChevronDown, FaHeart as FaHeartSolid,
  FaRegHeart as FaHeartOutline, FaMoon, FaEllipsisV,
  FaTimes, FaBed, FaDownload
} from "react-icons/fa";
import { RiPlayList2Fill } from "react-icons/ri";
import { usePlayer } from "../context/MusicPlayerContext";
import { supabase } from "../lib/supabaseClient";

const FALLBACK_COVER = "https://placehold.co/400x400/0a0a0f/FFF?text=🎶";

export default function PlayerBar() {
  const navigate = useNavigate();
  const {
    audioRef, currentTrack, handlePlayPause, handleNext,
    handlePrev, toggleShuffle, toggleRepeatMode, shuffle, 
    repeatMode, playlist, stop, playTrack 
  } = usePlayer();

  const [localTime, setLocalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [displayPlaying, setDisplayPlaying] = useState(false);
  const [albumInfo, setAlbumInfo] = useState(null);
  useEffect(() => {
  async function fetchMeta() {
    if (!currentTrack?.id) return;

    const { data } = await supabase
      .from("songs")
      .select(`albums(id, title, artists)`)
      .eq("id", currentTrack.id)
      .maybeSingle();

    if (data?.albums) setAlbumInfo(data.albums);
  }
  fetchMeta();
}, [currentTrack]);

  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem("player_likes_v1") || "{}"));
  
  const [activeModal, setActiveModal] = useState(null); 
  const [sleepDragValue, setSleepDragValue] = useState(30);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(null);
  const [finishSong, setFinishSong] = useState(false);
  const [heartState, setHeartState] = useState("idle");
  const [bgColor, setBgColor] = useState("#A5C9FF");
  const [showSleepAlert, setShowSleepAlert] = useState(false);

  const sleepTimerInterval = useRef(null);
  const touchStart = useRef(null);

  // --- Helper to resolve artist name from various possible fields ---
  // ✅ ADD THIS FIRST
const formatArtists = (artists) => {
  if (!artists) return "Unknown Artist";

  // string already
  if (typeof artists === "string") return artists;

  // array case
  if (Array.isArray(artists)) {
    // ["A", "B"]
    if (typeof artists[0] === "string") {
      return artists.join(", ");
    }

    // [{ name: "A" }, { name: "B" }]
    if (typeof artists[0] === "object") {
      return artists
        .map(a => a?.name)
        .filter(Boolean)
        .join(", ");
    }
  }

  return "Unknown Artist";
};

// ✅ SAFE VERSION
const getArtistName = (track) => {
  if (!track) return "Unknown Artist";

  return (
    track.artist ||
    track.artist_name ||
    formatArtists(track.artists) ||
    formatArtists(albumInfo?.artists) ||
    "Unknown Artist"
  );
};

  const currentArtist = getArtistName(currentTrack) || albumInfo?.artists;

// --- Smart Dynamic Color Extraction ---
useEffect(() => {
  const trackImg =
    currentTrack?.image_url || currentTrack?.cover;

  if (!trackImg) return;

  const img = new Image();

  img.crossOrigin = "Anonymous";
  img.src = trackImg;

  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1;
      canvas.height = 1;

      ctx.drawImage(img, 0, 0, 1, 1);

      const [r, g, b] =
        ctx.getImageData(0, 0, 1, 1).data;

      // Brightness formula
      const brightness =
        (r * 299 + g * 587 + b * 114) / 1000;

      // Saturation check
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max - min;

      // Avoid dark / muddy colors
      if (
        brightness < 90 ||     // too dark
        saturation < 35        // too gray/muddy
      ) {
        setBgColor("#06b6d4"); // fallback premium cyan
        return;
      }

      // Slightly brighten darker colors
      const brighten = (value) =>
        Math.min(255, value + 25);

      setBgColor(
        `rgb(${brighten(r)}, ${brighten(g)}, ${brighten(b)})`
      );

    } catch (e) {
      setBgColor("#06b6d4");
    }
  };

  img.onerror = () => {
    setBgColor("#06b6d4");
  };

}, [currentTrack]);

  // --- Audio Events ---
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !currentTrack) return;

  // Only play if audio is actually paused
  if (audio.paused) {
    audio.play().catch(() => {
      // autoplay restriction – safe to ignore
    });
  }
}, [currentTrack]);
  const lastTimeRef = useRef(0);
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const checkStall = () => {
    // UI says playing but audio is not progressing
    if (!audio.paused && audio.currentTime === lastTimeRef.current) {
      // audio stalled
      setDisplayPlaying(false);
      setShowResumeOverlay(true);
    }
    lastTimeRef.current = audio.currentTime;
  };

  const interval = setInterval(checkStall, 2000);
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const onTimeUpdate = () => setLocalTime(audio.currentTime);
    const updateMeta = () => setDuration(audio.duration);
    const onPlay = () => setDisplayPlaying(true);
    const onPause = () => setDisplayPlaying(false);
    
    const onEnded = () => {
        if (activeTimerSeconds === 0 && finishSong) {
            audioRef.current?.pause();
            setShowSleepAlert(true);
            setActiveTimerSeconds(null);
        } else {
            handleNext();
        }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", updateMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", updateMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef, activeTimerSeconds, finishSong, handleNext]);

useEffect(() => {
  if (!currentTrack || !navigator.mediaSession) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentTrack.title || "Unknown Title",
    artist: getArtistName(currentTrack), // ✅ ALWAYS formatted
    album: albumInfo?.title || "Single",
    artwork: [
      {
        src: currentTrack.image_url || currentTrack.cover || FALLBACK_COVER,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  });
}, [currentTrack, albumInfo]);

  // --- Sleep Timer Logic ---
  const startSleepTimer = () => {
    if (sleepTimerInterval.current) clearInterval(sleepTimerInterval.current);
    setActiveTimerSeconds(sleepDragValue * 60);
    setActiveModal(null);

    sleepTimerInterval.current = setInterval(() => {
        setActiveTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(sleepTimerInterval.current);
          if (!finishSong) {
              audioRef.current?.pause();
              setShowSleepAlert(true);
              return null;
          }
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatStopwatch = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTouchStart = (e) => (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const distance = touchStart.current - e.changedTouches[0].clientX;
    if (distance > 70) handleNext();
    if (distance < -70) handlePrev();
    touchStart.current = null;
  };

  const toggleLike = () => {
    const id = currentTrack.id;
    const isLiked = likes[id];
    setHeartState(isLiked ? "breaking" : "liking");
    setTimeout(() => setHeartState("idle"), 700);
    const newLikes = { ...likes, [id]: !isLiked };
    setLikes(newLikes);
    localStorage.setItem("player_likes_v1", JSON.stringify(newLikes));
  };

  if (!currentTrack) return null;

  const progressPercent = (localTime / duration) * 100 || 0;
  const coverImg = currentTrack.image_url || currentTrack.cover || FALLBACK_COVER;
  const currentIndex = playlist.findIndex(
  s => s?.id === currentTrack?.id
);

const upNext =
  currentIndex >= 0
    ? playlist.slice(currentIndex + 1)
    : [];

  return (
    <>
      <style>{`
        .fs-container { position: fixed; inset: 0; background: #0A0D14; z-index: 10000; display: flex; flex-direction: column; padding: 25px; color: white; animation: slideIn 0.4s ease-out; overflow: hidden; }
        @keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .glow-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% -20%, ${bgColor}44 0%, transparent 70%); pointer-events: none; z-index: 0; transition: background 1.2s ease; }
        .poster-area { width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; max-height: 42vh; z-index: 1; touch-action: none; }
        .poster-img { max-height: 100%; width: auto; aspect-ratio: 1/1; border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); transition: transform 0.6s ease; }
        .poster-img.playing { transform: scale(1.03); }
        .bouncy { transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
        .bouncy:active { transform: scale(0.85); }
        .play-blob { width: 70px; height: 70px; background: ${bgColor}; color: #000; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 8px 25px ${bgColor}44; }
        .scrub-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 10px; appearance: none; cursor: pointer; outline: none; }
        .scrub-bar::-webkit-slider-runnable-track { background: linear-gradient(to right, ${bgColor} ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%); height: 4px; border-radius: 10px; }
        .scrub-bar::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; background: #fff; border-radius: 50%; margin-top: -5px; border: 2px solid #0A0D14; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 10001; }
        .pop-modal { position: fixed; bottom: 30px; left: 20px; right: 20px; background: #1c222d; border: 1px solid rgba(255,255,255,0.1); border-radius: 35px; padding: 30px; z-index: 10002; animation: popUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes popUp { from { transform: scale(0.9) translateY(40px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .btn-primary { background: ${bgColor}; color: black; border: none; padding: 15px; border-radius: 18px; font-weight: 800; cursor: pointer; width: 100%; margin-top: 10px; }
        .btn-outline { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); padding: 15px; border-radius: 18px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
      `}</style>

      {fullscreen && (
        <div className="fs-container">
          <div className="glow-bg" />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <FaChevronDown className="bouncy" onClick={() => setFullscreen(false)} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, opacity: 0.4, letterSpacing: 2 }}>ALBUM</div>
              <div style={{ fontSize: 13, fontWeight: '800', color: bgColor }}>{albumInfo?.title || "Single"}</div>
            </div>
            <FaTimes className="bouncy" style={{ opacity: 0.6 }} onClick={() => { setFullscreen(false); stop(); }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', zIndex: 1 }}>
            <div className="poster-area" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <img src={coverImg} className={`poster-img ${displayPlaying ? 'playing' : ''}`} alt="art" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, margin: '0 0 4px 0', fontWeight: '800' }}>{currentTrack.title}</h2>
              <p style={{ color: bgColor, fontSize: 16, opacity: 0.9 }}>{currentArtist}</p>
            </div>

            <div className="scrub-container">
              <input type="range" className="scrub-bar" min={0} max={duration || 0} step="0.1" value={localTime} onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = e.target.value; }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="time-text">{formatStopwatch(localTime)}</span>
                <span className="time-text">{formatStopwatch(duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '35px', alignItems: 'center' }}>
              <FaRandom className="bouncy" color={shuffle ? bgColor : "white"} onClick={toggleShuffle} style={{ opacity: shuffle ? 1 : 0.4 }} />
              <FaStepBackward className="bouncy" size={30} onClick={handlePrev} />
              <div className="play-blob bouncy" onClick={handlePlayPause}>
                {displayPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: 4 }} />}
              </div>
              <FaStepForward className="bouncy" size={30} onClick={handleNext} />
              <FaRedo className="bouncy" color={repeatMode !== 'off' ? bgColor : "white"} onClick={toggleRepeatMode} style={{ opacity: repeatMode !== 'off' ? 1 : 0.4 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="bouncy" onClick={() => setActiveModal('sleep')} style={{ position: 'relative', background: activeTimerSeconds !== null ? `${bgColor}22` : 'transparent', padding: '10px', borderRadius: '12px' }}>
                <FaMoon size={20} color={activeTimerSeconds !== null ? bgColor : "white"} />
                {activeTimerSeconds !== null && <span style={{ position: 'absolute', top: -5, right: -10, background: '#ff5e5e', borderRadius: '6px', padding: '2px 5px', fontSize: 9, fontWeight: 'bold' }}>{formatStopwatch(activeTimerSeconds)}</span>}
              </div>
              <RiPlayList2Fill className="bouncy" size={24} onClick={() => setActiveModal('queue')} />
              <div className="bouncy" onClick={toggleLike}>
                {likes[currentTrack.id] ? <FaHeartSolid size={26} color={bgColor} /> : <FaHeartOutline size={26} />}
              </div>
<FaDownload
  className="bouncy"
  size={22}
  onClick={async (e) => {
    e.stopPropagation();

    const songUrl =
      currentTrack?.audio_url ||
      currentTrack?.url;

    if (!songUrl) return;

    const response = await fetch(songUrl);
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${currentTrack.title}.mp3`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobUrl);
  }}
/>
              <FaEllipsisV
  className="bouncy"
  onClick={() => setActiveModal("options")}
/>
            </div>
          </div>

          {/* Sleep Finished Popup */}
          {showSleepAlert && (
            <>
              <div className="modal-overlay" />
              <div className="pop-modal" style={{ textAlign: 'center' }}>
                <FaBed size={40} color={bgColor} style={{ marginBottom: 15 }} />
                <h3 style={{ fontSize: 22, fontWeight: '800', marginBottom: 5 }}>Sleep Timer Finished</h3>
                <p style={{ opacity: 0.6, marginBottom: 25 }}>The music has stopped. Keep listening?</p>
                <button className="btn-primary" onClick={() => { setShowSleepAlert(false); audioRef.current?.play(); }}>CONTINUE LISTENING</button>
                <button className="btn-outline" onClick={() => setShowSleepAlert(false)}>CLOSE</button>
              </div>
            </>
          )}

          {activeModal && (
            <>
              <div className="modal-overlay" onClick={() => setActiveModal(null)} />
              <div className="pop-modal">
                {activeModal === 'sleep' && (
                  <div>
                    <h3 style={{ textAlign: 'center', marginBottom: 25 }}>Sleep Timer</h3>
                    <div style={{ width: 140, height: 140, borderRadius: '50%', border: `4px solid ${bgColor}33`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32, fontWeight: '900', color: bgColor }}>{activeTimerSeconds !== null ? formatStopwatch(activeTimerSeconds) : `${sleepDragValue}:00`}</span>
                    </div>
                    {activeTimerSeconds === null ? (
                        <>
                            <input type="range" min="1" max="120" value={sleepDragValue} onChange={(e) => setSleepDragValue(e.target.value)} style={{ width: '100%', marginBottom: 20 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', marginBottom: 15 }}>
                                <span>Finish with last song</span>
                                <input type="checkbox" checked={finishSong} onChange={(e) => setFinishSong(e.target.checked)} />
                            </div>
                            <button className="btn-primary" onClick={startSleepTimer}>START TIMER</button>
                        </>
                    ) : (
                        <button className="btn-outline" style={{ borderColor: '#ff5e5e', color: '#ff5e5e' }} onClick={() => { clearInterval(sleepTimerInterval.current); setActiveTimerSeconds(null); }}>CANCEL TIMER</button>
                    )}
                  </div>
                )}
                {activeModal === 'options' && (
  <div>
    <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
      Options
    </h3>

    <div
      className="bouncy"
      style={{
        padding: 14,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        marginBottom: 10
      }}
      onClick={() => {
        if (albumInfo?.id) {
          navigate(`/album/${albumInfo.id}`);
          setFullscreen(false);
        }
        setActiveModal(null);
      }}
    >
      View Album
    </div>

    <div
      className="bouncy"
      style={{
        padding: 14,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        marginBottom: 10
      }}
    >
      Add to Playlist
    </div>

    <div
      className="bouncy"
      style={{
        padding: 14,
        color: '#ff5e5e'
      }}
      onClick={() => setActiveModal(null)}
    >
      Close
    </div>
  </div>
)}
                
                {/* QUEUE MODAL - UPDATED WITH ARTIST NAME LOGIC */}
                {activeModal === 'queue' && (
                  <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: 20 }}>Up Next</h3>
{upNext.map((track, i) => (
  <div
    key={track.id || i}
    className="bouncy"
    onClick={() => {
      playTrack(track);
      setActiveModal(null);
    }}
    style={{
      display: 'flex',
      gap: 12,
      marginBottom: 12,
      alignItems: 'center',
      background: 'rgba(255,255,255,0.03)',
      padding: 12,
      borderRadius: 16
    }}
  >
    <img
      src={track.image_url || track.cover || FALLBACK_COVER}
      style={{ width: 50, height: 50, borderRadius: 12 }}
    />
    <div style={{ overflow: 'hidden' }}>
      <div
        style={{
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }}
      >
        {track.title}
      </div>
      <div style={{ fontSize: 12, opacity: 0.5 }}>
        {getArtistName(track)}
      </div>
    </div>
  </div>
))}
                    
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Mini Player View */}
      {!fullscreen && currentTrack && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15, height: 65, background: '#121212', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 999 }} onClick={() => setFullscreen(true)}>
          <img src={coverImg} style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{currentArtist}</div>
          </div>
          <div onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="bouncy" style={{ padding: 10 }}>
            {displayPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
          </div>
        </div>
      )}

      <audio ref={audioRef} src={currentTrack?.audio_url || currentTrack?.url} />
    </>
  );
}
