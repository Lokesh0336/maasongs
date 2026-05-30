// src/pages/SpotifyHelper.jsx
import React, { useState } from "react";

export default function SpotifyHelper() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
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
        `http://localhost:4000/api/spotify/album?url=${encodeURIComponent(
          spotifyUrl
        )}`
      );
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to fetch album");
      }
    } catch (err) {
      console.error(err);
      setError("Network error – make sure backend is running on :4000");
    } finally {
      setLoading(false);
    }
  };

  const buildAlbumSnippet = () => {
    if (!result) return "";
    const year = result.releaseYear || "2025";
    const slug =
      result.title.toLowerCase().replace(/\s+/g, "-") + "-" + year + "-songs";

    return `{
  id: "${slug}",
  slug: "${slug}",
  title: "${result.title}",
  year: ${year},
  poster: "${result.coverUrl || ""}",
  starring: ["${result.artists.join('", "')}"],
  musicDirector: "", // fill manually
  director: "",      // fill manually
  trending: false,
  songs: [
${result.tracks
  .map(
    (t, idx) => `    {
      id: "${slug}-${idx + 1}",
      title: "${t.title.replace(/"/g, '\\"')}",
      duration: "", // optional, UI will auto-detect from audio
      audioUrl: "", // paste your Google Drive direct link here
    }`
  )
  .join(",\n")}
  ],
},`;
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Spotify → Album JSON Helper</h1>
      <p style={{ fontSize: 13, maxWidth: 650, lineHeight: 1.5 }}>
        Paste a Spotify <strong>album</strong> URL. This tool will fetch the{" "}
        album title, artists, cover, and track list from Spotify and generate a
        ready-to-paste snippet for your <code>albums.js</code>. You only need to
        fill <code>audioUrl</code> with your Google Drive links and optionally{" "}
        <code>musicDirector</code> / <code>director</code>.
      </p>

      <form onSubmit={handleFetch} style={{ margin: "16px 0" }}>
        <label
          htmlFor="spotifyUrl"
          style={{ fontSize: 12, display: "block", marginBottom: 4 }}
        >
          Spotify album URL
        </label>
        <input
          id="spotifyUrl"
          type="url"
          placeholder="https://open.spotify.com/album/..."
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 480,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            marginBottom: 8,
            fontSize: 13,
          }}
          required
        />
        <br />
        <button
          type="submit"
          disabled={loading || !spotifyUrl}
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
          {loading ? "Fetching..." : "Fetch from Spotify"}
        </button>
      </form>

      {error && (
        <p style={{ color: "salmon", fontSize: 13, marginTop: 4 }}>
          Error: {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ marginBottom: 6 }}>Preview</h2>
          <p style={{ fontSize: 13, marginBottom: 10 }}>
            <strong>Album:</strong> {result.title}
            <br />
            <strong>Artists:</strong> {result.artists.join(", ")}
            <br />
            {result.releaseYear && (
              <>
                <strong>Year:</strong> {result.releaseYear}
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

          <h3 style={{ marginBottom: 6 }}>Generated snippet for albums.js</h3>
          <textarea
            readOnly
            value={buildAlbumSnippet()}
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
            1. Copy this object into your <code>albums.js</code> inside the{" "}
            <code>albums</code> array. <br />
            2. For each song, paste your{" "}
            <strong>Google Drive direct download link</strong> into{" "}
            <code>audioUrl</code>. <br />
            3. Optionally fill <code>musicDirector</code> and{" "}
            <code>director</code>.
          </p>
        </div>
      )}
    </div>
  );
}
