// src/pages/SongHelper.jsx
import React, { useState } from "react";

export default function SongHelper() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState(""); // your GDrive link
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/spotify/track?url=${encodeURIComponent(
          spotifyUrl
        )}`
      );
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to fetch track");
      }
    } catch (err) {
      console.error(err);
      setError("Network error – is backend running on :4000?");
    } finally {
      setLoading(false);
    }
  };

  const buildSongSnippet = () => {
    if (!result) return "";
    const safeTitle = result.title.replace(/"/g, '\\"');
    const year = result.releaseYear || "2025";
    const slugBase = (result.albumName || result.title)
      .toLowerCase()
      .replace(/\s+/g, "-");
    const idBase = slugBase + "-" + year;

    return `{
  id: "${idBase}",
  slug: "${idBase}-songs",
  title: "${result.albumName || safeTitle}",
  year: ${year},
  poster: "${result.coverUrl || ""}",
  starring: ["${result.artists.join('", "')}"],
  musicDirector: "", // fill manually if you want
  director: "",      // fill manually if you want
  trending: false,
  songs: [
    {
      id: "${idBase}-1",
      title: "${safeTitle}",
      duration: "", // UI can auto-detect
      audioUrl: "${audioUrl}", // your GDrive link
    },
  ],
},`;
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Single Song Helper (Spotify Track → JSON)</h1>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>
        Paste a Spotify <strong>track</strong> URL and your <strong>audio
        file link</strong> (Google Drive). This tool will fetch song details
        (title, artists, album, year, cover) and generate a ready album object
        with a single song, which you can paste into your <code>albums.js</code>.
      </p>

      <form onSubmit={handleFetch} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="spotifyUrl"
            style={{ fontSize: 12, display: "block", marginBottom: 4 }}
          >
            Spotify track URL
          </label>
          <input
            id="spotifyUrl"
            type="url"
            placeholder="https://open.spotify.com/track/..."
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13,
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="audioUrl"
            style={{ fontSize: 12, display: "block", marginBottom: 4 }}
          >
            Your audio URL (Google Drive direct link)
          </label>
          <input
            id="audioUrl"
            type="url"
            placeholder="https://drive.google.com/uc?export=download&id=..."
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13,
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !spotifyUrl || !audioUrl}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            background:
              "linear-gradient(to right, #22c55e, #0ea5e9, #6366f1)",
            color: "#020617",
          }}
        >
          {loading ? "Fetching..." : "Fetch & Generate JSON"}
        </button>
      </form>

      {error && (
        <p style={{ color: "salmon", fontSize: 13, marginTop: 8 }}>
          Error: {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Preview</h2>
          <p style={{ fontSize: 13 }}>
            <strong>Song:</strong> {result.title}
            <br />
            <strong>Artists:</strong> {result.artists.join(", ")}
            <br />
            {result.albumName && (
              <>
                <strong>Album:</strong> {result.albumName}
                <br />
              </>
            )}
            {result.releaseYear && (
              <>
                <strong>Year:</strong> {result.releaseYear}
                <br />
              </>
            )}
          </p>

          {result.coverUrl && (
            <img
              src={result.coverUrl}
              alt={result.title}
              style={{
                width: 180,
                borderRadius: 10,
                marginBottom: 14,
                border: "1px solid #e5e7eb",
              }}
            />
          )}

          <h3>Generated snippet for albums.js</h3>
          <textarea
            readOnly
            value={buildSongSnippet()}
            style={{
              width: "100%",
              height: 260,
              fontFamily: "monospace",
              fontSize: 12,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              resize: "vertical",
            }}
          />
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
            Copy this object into your <code>albums.js</code> inside the{" "}
            <code>albums</code> array. UI will show this as an album with one
            song.
          </p>
        </div>
      )}
    </div>
  );
}
