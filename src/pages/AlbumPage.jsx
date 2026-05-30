import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { usePlayer } from "../context/MusicPlayerContext";

export default function AlbumPage() {
  const { slug } = useParams();
  const player = usePlayer();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const FALLBACK_COVER = "https://via.placeholder.com/400?text=No+Cover";

const downloadFile = async (url, fileName = "song") => {
  try {
    if (!url) return;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${fileName}_By_Lokesh_Ragutla.mp3`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download error:", err);
  }
};
useEffect(() => {
  window.history.scrollRestoration = "manual";

  window.scrollTo(0, 0);

  loadAlbumAndSongs();

  return () => {
    window.history.scrollRestoration = "auto";
  };
}, [slug]);

  const loadAlbumAndSongs = async () => {
    setLoading(true);
    setError("");
    try {
      // FIX: Check if the slug is actually a UUID (from Go to Album) or a string slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      
      let query = supabase.from("albums").select("*");
      if (isUUID) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }

      const { data: albumData, error: albumErr } = await query.maybeSingle();

      if (albumErr || !albumData) {
        setError("Album not found");
        return;
      }

      const albumPoster = albumData.cover_url || albumData.poster || FALLBACK_COVER;
      const albumArtists = Array.isArray(albumData.artists) ? albumData.artists : [albumData.artists];

      setAlbum({ ...albumData, poster: albumPoster, artistsList: albumArtists });

      const { data: songsData, error: songsErr } = await supabase
        .from("songs")
        .select("id, title, audio_url_new, duration_ms, track_number")
        .eq("album_id", albumData.id)
        .order("track_number", { ascending: true });

      if (songsErr) throw songsErr;

const mapped = (songsData || []).map((s) => ({
  id: s.id,
  title: s.title || "Untitled",

  // IMPORTANT
  audio_url: s.audio_url_new || "",
  url: s.audio_url_new || "",

  image_url: albumPoster,
  cover: albumPoster,

  artist: albumArtists[0] || "Unknown Artist",
  artists: albumArtists,

  albumTitle: albumData.title,

  duration: s.duration_ms
    ? `${Math.floor(s.duration_ms / 60000)}:${Math.floor(
        (s.duration_ms % 60000) / 1000
      )
        .toString()
        .padStart(2, "0")}`
    : "--:--",

  track_number: s.track_number,
}));

      setSongs(mapped);
    } catch (e) {
      console.error(e);
      setError("Error loading album data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const playable = songs.filter(s => s.audio_url);
for (const song of playable) {
  await downloadFile(
    song.audio_url,
    song.title
  );

  await new Promise(r => setTimeout(r, 800));
}
    setDownloadingAll(false);
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center", color: "#ccc", background: "#0A0D14", minHeight: "100vh" }}>Loading Album...</div>;
  if (error) return <div style={{ padding: "100px", textAlign: "center", color: "#ff4d4d", background: "#0A0D14", minHeight: "100vh" }}>{error}</div>;

return (
  <div
    className="album-page"
    style={{ 
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "40px 20px",
      color: "#fff",
      fontFamily: "sans-serif"
    }}
  >
      <style>{`
        .btn-main { cursor: pointer; border: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-play { background: #569aff; color: white; }
        .btn-dl-all { background: #00e893; color: black; }
        .btn-main:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3); }
        
        .song-row { transition: background 0.2s; border-bottom: 1px solid #282828; }
        .song-row:hover { background: rgba(255,255,255,0.05); }

        .btn-song-play { background: none; border: none; color: #b3b3b3; cursor: pointer; font-size: 20px; transition: 0.2s; margin-right: 15px; }
        .btn-song-play:hover { color: #569aff; transform: scale(1.2); }

        .btn-song-dl { 
          background: linear-gradient(135deg, #4c63ae, #2d81ff); 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-weight: bold; 
          cursor: pointer; 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          font-size: 13px;
        }
        .btn-song-dl:hover { 
          transform: scale(1.1); 
          box-shadow: 0 6px 20px rgba(110, 142, 251, 0.4);
          filter: brightness(1.1);
        }
        .btn-song-dl:active { transform: scale(0.95); }
      `}</style>

      {/* Header Section */}
      <div style={{ display: "flex", gap: "35px", marginBottom: "50px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <img src={album.poster} alt={album.title} style={{ width: "260px", height: "260px", borderRadius: "15px", objectFit: "cover", boxShadow: "0 10px 60px rgba(0,0,0,0.7)" }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "14px", fontWeight: "900", color: "#569aff", textTransform: "uppercase", letterSpacing: "1px" }}>Album</span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", margin: "10px 0", fontWeight: "800", letterSpacing: "-2px", lineHeight: "1" }}>{album.title}</h1>
          <p style={{ color: "#b3b3b3", margin: "0 0 25px 0", fontSize: "18px" }}>
            <strong style={{ color: "#fff" }}>{album.artistsList.join(", ")}</strong> • {album.year} • {songs.length} tracks
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            <button className="btn-main btn-play" onClick={() => player.playList(songs, 0, false)}>
              <span style={{ fontSize: "18px" }}>▶</span> PLAY NOW
            </button>
            <button className="btn-main btn-dl-all" onClick={handleDownloadAll} disabled={downloadingAll}>
              {downloadingAll ? "DOWNLOADING..." : "⬇ DOWNLOAD ALL"}
            </button>
          </div>
        </div>
      </div>

      {/* Songs Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#b3b3b3", fontSize: "12px", borderBottom: "1px solid #333", textTransform: "uppercase", letterSpacing: "1px" }}>
              <th style={{ padding: "15px 10px", width: "50px" }}>#</th>
              <th style={{ padding: "15px 10px" }}>TITLE</th>
              <th style={{ padding: "15px 10px", width: "100px" }}>TIME</th>
              <th style={{ padding: "15px 10px", width: "180px", textAlign: "right" }}>OPTIONS</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, idx) => (
              <tr key={song.id} className="song-row">
                <td style={{ padding: "15px 10px", color: "#b3b3b3", fontWeight: "500" }}>{song.track_number || idx + 1}</td>
                <td style={{ padding: "15px 10px" }}>
                  
<div
  className="mobile-song-title"
  onClick={() => player.playList(songs, idx, false)}
  style={{
    cursor: "pointer"
  }}
>
  <span>{song.title}</span>
</div>
                  <div style={{ fontSize: "13px", color: "#b3b3b3" }}>{song.artist}</div>
                </td>
                <td style={{ padding: "15px 10px", color: "#b3b3b3", fontSize: "14px" }}>{song.duration}</td>
                <td style={{ padding: "15px 10px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <button 
                      className="btn-song-play" 
                      title="Play Song" 
                      onClick={() => player.playList(songs, idx, false)}
                    >▶</button>
                    <button 
                      className="btn-song-dl" 
                      title="Download Song" 
onClick={() =>
  downloadFile(
    song.audio_url,
    song.title
  )
}
                    >
                      <span style={{ fontSize: "16px" }}>⬇</span> DOWNLOAD
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
<div
  style={{
    textAlign: "center",
    marginTop: "14px",
    display: window.innerWidth <= 768 ? "block" : "none",
  }}
>
  <div
    style={{
      display: "inline-block",
      padding: "10px 14px",
      borderRadius: "12px",
      background:
        "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(99,102,241,0.10))",
      border: "1px solid rgba(96,165,250,0.25)",
      color: "#dbeafe",
      fontSize: "12px",
      lineHeight: "1.7",
      fontWeight: 600,
      boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    }}
  >
    👉 Scroll right to access
    <span style={{ color: "#60a5fa" }}>
      {" "}Download & Play{" "}
    </span>
    options.
    <br />

    <span
      style={{
        color: "#93c5fd",
        fontWeight: 700,
      }}
    >
      Use Desktop Mode
    </span>{" "}
    for better experience.
  </div>
</div>
      </div>
    </div>
  );
}
