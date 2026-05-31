import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  FaCompactDisc,
  FaMusic,
  FaSpinner,
  FaRandom,
  FaInstagram,
FaGlobe,
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";
import { usePlayer } from "../context/MusicPlayerContext";

/* ================= CONSTANTS ================= */
const FALLBACK_COVER = "/fallback-cover.png";
const STORAGE_BUCKET = "tracks";

/* ================= URL RESOLVER ================= */
const useUrlResolvers = () => {
  const resolveAudioUrl = useCallback(async (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, 60);

    return data?.signedUrl || "";
  }, []);

  return { resolveAudioUrl };
};

/* ================= ALBUM CARD ================= */
const AlbumCard = ({ album }) => {
  const artistsDisplay =
    Array.isArray(album.artists) && album.artists.length
      ? album.artists.join(", ")
      : "Various Artists";

  return (
    <Link
  to={`/album/${album.slug}`}
  className="album-card"
onClick={() => {
  sessionStorage.setItem(
    "homeScrollPosition",
    window.scrollY.toString()
  );
}}
>
      <img
        src={album.poster || FALLBACK_COVER}
        alt={album.title}
        className="album-cover"
      />
      <div className="album-meta">
        <h3 className="album-title">{album.title}</h3>
        <p className="album-sub">
          {album.year && `${album.year} · `} {artistsDisplay}
        </p>
      </div>
    </Link>
  );
};

/* ================= MAIN ================= */
export default function Home() {
  const player = usePlayer();
  const { resolveAudioUrl } = useUrlResolvers();

  const [albums, setAlbums] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [shuffling, setShuffling] = useState(false);
  const [showNotice, setShowNotice] = useState(() => {
  return sessionStorage.getItem("noticeClosed") !== "true";
});

  /* -------- LOAD ALL ALBUMS -------- */
  const loadAlbums = async () => {
    setLoadingAlbums(true);
    const { data } = await supabase
      .from("albums")
      .select("id, slug, title, year, cover_url, artists")
      .order("title", { ascending: true });

    setAlbums(
      (data || []).map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        year: a.year,
        poster: a.cover_url,
        artists: Array.isArray(a.artists) ? a.artists : [a.artists],
      }))
    );
    setLoadingAlbums(false);
  };

  /* -------- LOAD RECENT SONGS -------- */
  const loadRecentSongs = async () => {
    setLoadingRecent(true);

    const { data } = await supabase
      .from("songs")
      .select("id, title, audio_url_new, albums(cover_url, artists)")
      .order("created_at", { ascending: false })
      .limit(window.innerWidth <= 768 ? 10 : 5000);

    const resolved = await Promise.all(
      (data || []).map(async (s) => {
        const audio =
  s.audio_url_new || "";
        if (!audio) return null;

        return {
          id: s.id,
          title: s.title || "Untitled",
          audio_url: audio,
          cover: s.albums?.cover_url || FALLBACK_COVER,
          image_url: s.albums?.cover_url || FALLBACK_COVER,
          artists: Array.isArray(s.albums?.artists)
            ? s.albums.artists
            : [],
        };
      })
    );

    setRecentSongs(resolved.filter(Boolean));
    setLoadingRecent(false);
  };

  /* -------- RANDOM MIX -------- */
const handleShuffleAll = async () => {
  if (!player) return;

  setShuffling(true);

  const { data } = await supabase
    .from("songs")
    .select(
      "id, title, audio_url_new, albums(cover_url, artists)"
    )
    .limit(300);

  const playable = (data || [])
    .map((s) => {
      const audio = s.audio_url_new || "";

      if (!audio) return null;

      return {
        id: s.id,
        title: s.title || "Untitled",

        /* IMPORTANT */
        audio_url: audio,
        url: audio,

        cover:
          s.albums?.cover_url || FALLBACK_COVER,

        image_url:
          s.albums?.cover_url || FALLBACK_COVER,

        artist:
          Array.isArray(s.albums?.artists)
            ? s.albums.artists.join(", ")
            : "Unknown Artist",

        artists:
          Array.isArray(s.albums?.artists)
            ? s.albums.artists
            : [],
      };
    })
    .filter(Boolean);

  if (playable.length) {
    player.playList(
      playable,
      Math.floor(Math.random() * playable.length),
      false
    );
  }

  setShuffling(false);
};

  useEffect(() => {
    loadAlbums();
    loadRecentSongs();
  }, []);
useEffect(() => {
  const savedPosition = sessionStorage.getItem(
    "homeScrollPosition"
  );

  if (
    savedPosition &&
    albums.length > 0
  ) {
    setTimeout(() => {
      window.scrollTo(
        0,
        parseInt(savedPosition)
      );
    }, 500);
  }
}, [albums]);

return (
  <>
    {showNotice && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(10px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
maxWidth: "380px",
maxHeight: "90vh",
overflowY: "auto",
borderRadius: "14px",
padding: "14px",
            background:
              "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.45)",
            color: "#fff",
          }}
        >

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(6,182,212,0.12)",
              color: "#67e8f9",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            🎧 AUDIOSTATION FINAL UPDATE
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              lineHeight: 1.35,
              marginBottom: "14px",
            }}
          >
            Thank You For Supporting
            <span style={{ color: "#06b6d4" }}>
              {" "}AudioStation
            </span>
            💙
          </h2>

<div
>

            As of <strong>May 8, 2026</strong>, AudioStation has officially
            reached the end of its development journey.

            <br /><br />

            No new songs, albums, or future updates will be added anymore.
            The platform will continue to remain online so everyone can still
            enjoy the existing collection of
            <strong> 1200+ hit songs</strong> across Telugu, Tamil,
            Malayalam & more. 🎶✨

<br /><br />

<div
  style={{
    padding: "10px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.78)",
    lineHeight: "1.7",
  }}
>
  📘 This project was created purely for
  <strong style={{ color: "#ffffff" }}>
    {" "}educational & personal learning purposes
  </strong>.
</div>
            Contact:

            <br /><br />

           <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "6px",
  }}
>

  {/* EMAIL */}
  <a
    href="mailto:lokeshragutla@gmail.com"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#22d3ee",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "8px 10px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <MdEmail
      size={22}
      style={{
        color: "#22d3ee",
        flexShrink: 0,
      }}
    />

    <span>
      lokeshragutla@gmail.com
    </span>
  </a>
  <a
    href="mailto:support@maasongs.online"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#22d3ee",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "8px 10px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <MdEmail
      size={22}
      style={{
        color: "#22d3ee",
        flexShrink: 0,
      }}
    />

    <span>
      support@maasongs.online
    </span>
  </a>
  {/* INSTAGRAM */}
  <a
    href="https://instagram.com/lokesh_ragutla96"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#f472b6",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "8px 10px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <FaInstagram
      size={20}
      style={{
        color: "#f472b6",
        flexShrink: 0,
      }}
    />

    <span>
      @lokesh_ragutla96
    </span>
</a>
             {/* WEBSITE */}
<a
  href="https://audiostation.netlify.app/"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#60a5fa",
    fontWeight: 700,
    textDecoration: "none",
    background: "rgba(255,255,255,0.04)",
    padding: "8px 10px",
    borderRadius: "12px",
    transition: "0.2s ease",
  }}
>
  <a
  href="https://maasongs.online/"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#60a5fa",
    fontWeight: 700,
    textDecoration: "none",
    background: "rgba(255,255,255,0.04)",
    padding: "8px 10px",
    borderRadius: "12px",
    transition: "0.2s ease",
  }}
>

</a>
  <FaGlobe
    size={20}
    style={{
      color: "#60a5fa",
      flexShrink: 0,
    }}
  />

  <span>
    maasongs.online
  </span>
</a>

</div>

</div>

<div
  style={{
    marginTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
<div
  style={{
    fontSize: "13px",
    color: "rgba(255,255,255,0.68)",
    margin: 0,
  }}
>
  Developed with ❤️ by{" "}
              <span
                style={{
                  color: "#06b6d4",
                  fontWeight: 800,
                }}
              >
                Lokesh Ragutla
              </span>
            </div>

            <button
              onClick={() => {
  setShowNotice(false);
  sessionStorage.setItem("noticeClosed", "true");
}}
              style={{
                border: "none",
                padding: "9px 16px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #06b6d4, #0891b2)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ===== HEADER ===== */}
    
      <header className="mb-8 p-6 bg-white dark:bg-[#1e263080] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 backdrop-blur-md">

  {/* TOP BADGE */}
  <div className="inline-flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/40 px-4 py-1.5 rounded-full mb-4 tracking-wide">
    <FaMusic className="mr-2" />
    AUDIO STATION
  </div>

  {/* MAIN TITLE */}
  <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
    🎧 Welcome to{" "}
    <span className="text-cyan-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]">
      AudioStation
    </span>
    <br />
    <span className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-300 font-semibold">
      where music, memories & vibes live forever ✨
    </span>
  </h1>

  {/* DESCRIPTION */}
  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed mb-5">
    Discover a curated collection of{" "}
    <strong>1200+ hit songs</strong> across Telugu, Tamil,
    Malayalam & more — all in one place.
    From timeless classics to fan-favorite tracks,
    AudioStation was built to deliver a smooth,
    elegant and immersive listening experience
    for every music lover. 🎶💙
  </p>

  {/* FINAL NOTICE CARD */}
  <div
    style={{
      marginTop: "18px",
      padding: "18px",
      borderRadius: "18px",
      background:
        "linear-gradient(180deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03))",
      border: "1px solid rgba(6,182,212,0.18)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    }}
  >

    {/* NOTICE BADGE */}
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 14px",
        borderRadius: "999px",
        background: "rgba(6,182,212,0.12)",
        color: "#06b6d4",
        fontSize: "12px",
        lineHeight: 1.85,
        fontWeight: 800,
        marginBottom: "16px",
        letterSpacing: "0.5px",
      }}
    >
      🎧 AUDIOSTATION FINAL UPDATE
    </div>

    {/* NOTICE CONTENT */}
    <div
      style={{
        fontSize: "14px",
        lineHeight: "1.9",
        color: "var(--color-text-muted)",
        margin: 0,
      }}
    >
      <span
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--color-text)",
        }}
      >
        Thank You For Supporting AudioStation 💙
      </span>

      <br /><br />

      As of <strong>May 8, 2026</strong>, AudioStation has officially
      reached the end of its development journey.

      <br /><br />

      No new songs, albums, or future updates will be added anymore.
      The platform will continue to remain online so everyone can still
      enjoy the existing collection of
      <strong> 1200+ hit songs</strong> across Telugu, Tamil,
      Malayalam & more. 🎶✨

<br /><br />

<div
  style={{
    padding: "16px",
    borderRadius: "16px",
    background:
      "linear-gradient(180deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))",
    border: "1px solid rgba(239,68,68,0.20)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  }}
>
  <div
    style={{
      fontSize: "15px",
      fontWeight: 800,
      color: "#f87171",
      marginBottom: "10px",
      letterSpacing: "0.4px",
    }}
  >
    ⚠ COPYRIGHT & CONTENT NOTICE
  </div>

  <div
    style={{
      fontSize: "13px",
      lineHeight: "1.9",
      color: "rgba(255,255,255,0.82)",
    }}
  >
    This project was created purely for
    <strong> educational and personal learning purposes</strong>.

    <br /><br />

    All music, albums, posters, artist images, and media content
    belong to their respective owners and creators.

    <br /><br />

    If you are the rightful owner of any content and would like it
    removed from AudioStation, please contact the developer for
    immediate removal and necessary action.
  </div>
</div>

<br /><br />

      <strong>Contact:</strong>

      <br /><br />

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "10px",
  }}
>
  {/* EMAIL */}
  <a
    href="mailto:lokeshragutla@gmail.com"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#22d3ee",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "12px 14px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <MdEmail
      size={22}
      style={{
        color: "#22d3ee",
        flexShrink: 0,
      }}
    />

    <span>
      lokeshragutla@gmail.com
    </span>
  </a>
  <a
    href="mailto:lokeshragutla@gmail.com"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#22d3ee",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "12px 14px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <MdEmail
      size={22}
      style={{
        color: "#22d3ee",
        flexShrink: 0,
      }}
    />

    <span>
      support@maasongs.online
    </span>
  </a>
  {/* WEBSITE */}
  <a
    href="https://audiostation.netlify.app/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#60a5fa",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "12px 14px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <FaGlobe
      size={20}
      style={{
        color: "#60a5fa",
        flexShrink: 0,
      }}
    />

    <span>
      audiostation.netlify.app
    </span>
  </a>
<a
    href="https://maasongs.online/"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#60a5fa",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "12px 14px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <FaGlobe
      size={20}
      style={{
        color: "#60a5fa",
        flexShrink: 0,
      }}
    />

    <span>
      maasongs.online
    </span>
  </a>

  {/* INSTAGRAM */}
  <a
    href="https://instagram.com/lokesh_ragutla96"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#f472b6",
      fontWeight: 700,
      textDecoration: "none",
      background: "rgba(255,255,255,0.04)",
      padding: "12px 14px",
      borderRadius: "12px",
      transition: "0.2s ease",
    }}
  >
    <FaInstagram
      size={20}
      style={{
        color: "#f472b6",
        flexShrink: 0,
      }}
    />

    <span>
      @lokesh_ragutla96
    </span>
  </a>
</div>
    </div>

    {/* FOOTER */}
    <div
      style={{
        marginTop: "18px",
        paddingTop: "14px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.3px",
        }}
      >
        Developed with ❤️ by{" "}
      </span>

      <span
        style={{
          color: "#06b6d4",
          fontWeight: 800,
          fontSize: "15px",
          textShadow:
            "0 0 14px rgba(6,182,212,0.45)",
        }}
      >
        Lokesh Ragutla
      </span>
    </div>
  </div>
</header>

      {/* ===== GRID ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* ===== LEFT: SIMPLE RECENT LIST ===== */}
        <aside
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px",
            background: "var(--color-surface)",
          }}
        >
          <button
            onClick={handleShuffleAll}
            disabled={shuffling}
            className="shuffle-btn"
            style={{ width: "100%", marginBottom: "10px" }}
          >
            {shuffling ? <FaSpinner className="icon animate-spin" /> : <FaRandom />}
            <span>{shuffling ? "Preparing Mix…" : "Play Random Mix"}</span>
          </button>

          <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
            Last Added Songs
          </h3>

          {loadingRecent ? (
            <p style={{ fontSize: "12px" }}>Loading…</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentSongs.map((song, idx) => {
                const active = player?.currentTrack?.id === song.id;

                return (
                 <li
  key={song.id}
  onClick={() => player.playList(recentSongs, idx, false)}
  style={{
    padding: "6px 8px",
    fontSize: "12.5px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: active ? 600 : 400,
    color: active ? "#4338ca" : "inherit",
    background: active ? "#eef2ff" : "transparent",
    transition: "background-color 0.15s ease, color 0.15s ease",
  }}
  onMouseEnter={(e) => {
    if (!active) {
      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
    }
  }}
  onMouseLeave={(e) => {
    if (!active) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  }}
>
  {song.title}
</li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ===== RIGHT: ALBUM GRID ===== */}
        <div>
          <h2 className="section-title flex items-center mb-3">
            <FaCompactDisc className="mr-2 text-indigo-500" />
            Browse Albums A–Z
          </h2>

          {loadingAlbums ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <div className="album-grid">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);
    }
