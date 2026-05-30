import React, { useState } from "react";

/**
 * Robust line parser:
 * - Supports:
 *    - "https://open.spotify.com/track/ID, https://r2.../song.mp3"
 *    - "spotify:track:ID, https://..."
 *    - "ID, https://..."
 * - Keeps lineNumber so backend can map failures to input lines
 * - Ignores blank lines, trims quotes and extra whitespace
 */
const normalize = (s = "") =>
  s.trim().replace(/^['"]|['"]$/g, ""); // remove surrounding quotes

const looksLikeUrl = (s = "") =>
  /^https?:\/\//i.test(s.trim());

const looksLikeSpotifyUri = (s = "") =>
  /^spotify:track:[A-Za-z0-9]+$/i.test(s.trim());

const looksLikeSpotifyWebUrl = (s = "") =>
  /open\.spotify\.com\/track\//i.test(s.trim());

const looksLikePlainId = (s = "") =>
  /^[A-Za-z0-9]{10,}$/i.test(s.trim()); // allow varied lengths

const parseCsvInput = (csvText) => {
  const lines = csvText.split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue; // skip blank lines

    // Try to split on the first comma (audio URLs may technically contain commas rarely)
    // This assumes format: <spotify>,<audioUrl> optionally with spaces
    const firstCommaIndex = raw.indexOf(",");
    if (firstCommaIndex === -1) {
      // No comma -> try whitespace separation
      const pieces = raw.split(/\s+/);
      if (pieces.length >= 2) {
        const spotifyPart = normalize(pieces[0]);
        const audioPart = normalize(pieces.slice(1).join(" "));
        out.push({ spotifyUrl: spotifyPart, audioUrl: audioPart, lineNumber: i + 1 });
      } else {
        // Give one last attempt: maybe tab separated
        continue; // invalid line
      }
      continue;
    }

    const spotifyPart = normalize(raw.slice(0, firstCommaIndex));
    const audioPart = normalize(raw.slice(firstCommaIndex + 1));

    // Accept spotify web url, spotify uri or plain id as spotifyPart
    if (
      (looksLikeUrl(spotifyPart) && looksLikeSpotifyWebUrl(spotifyPart)) ||
      looksLikeSpotifyUri(spotifyPart) ||
      looksLikePlainId(spotifyPart)
    ) {
      if (looksLikeUrl(audioPart)) {
        out.push({ spotifyUrl: spotifyPart, audioUrl: audioPart, lineNumber: i + 1 });
      } else {
        // if audio part isn't an http url, still add it but mark it (backend will report)
        out.push({ spotifyUrl: spotifyPart, audioUrl: audioPart, lineNumber: i + 1 });
      }
    } else {
      // If spotify part didn't look valid, attempt swap (maybe user typed audio first)
      if (looksLikeUrl(spotifyPart) && (looksLikeSpotifyWebUrl(audioPart) || looksLikeSpotifyUri(audioPart) || looksLikePlainId(audioPart))) {
        out.push({ spotifyUrl: normalize(audioPart), audioUrl: normalize(spotifyPart), lineNumber: i + 1 });
      } else {
        // skip invalid lines
        continue;
      }
    }
  }

  return out;
};

export default function AddSongAdmin() {
  const [bulkInput, setBulkInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const songsToUpload = parseCsvInput(bulkInput);

    if (songsToUpload.length === 0) {
      setError("No valid songs found. Each line should be: SpotifyURL(or URI or ID), AudioURL");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/song/save/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(songsToUpload),
      });

      // parse body even on non-200 so we get useful error details
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // server-level error
        const serverMsg = data?.error || `Server returned status ${res.status}`;
        setError(serverMsg);
        setResult(null);
      } else {
        // success — the backend should return { total, success, failed, failedDetails, items }
        setResult(data);
      }
    } catch (err) {
      console.error("Network / Fetch error:", err);
      setError("Network error — is the backend running on http://localhost:4000 ?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Add Songs in Bulk (Spotify + Audio URL)</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="bulkInput" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Bulk input — one song per line:
            <div style={{ fontWeight: 400, fontSize: 12 }}>
              Accepts: Spotify web URL, spotify:track:ID, or plain track ID, then a comma, then audio URL.
            </div>
          </label>

          <textarea
            id="bulkInput"
            rows={10}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={`Example lines:
https://open.spotify.com/track/7abc..., https://r2.cdn.com/song-1.mp3
spotify:track:6xyz..., https://r2.cdn.com/song-2.mp3
6J8s4s...., https://r2.cdn.com/song-3.mp3`}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontFamily: "monospace",
              fontSize: 13,
            }}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="submit"
            disabled={loading || !bulkInput.trim()}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: "linear-gradient(to right,#22c55e,#06b6d4)",
              color: "#020617",
            }}
          >
            {loading ? "Saving..." : `Save ${parseCsvInput(bulkInput).length || 0} Songs`}
          </button>

          <button
            type="button"
            onClick={() => {
              // quick sample input helper
              setBulkInput(
                `https://open.spotify.com/track/1a2b3c..., https://r2.cdn.com/track-1.mp3
spotify:track:5XyZAB..., https://r2.cdn.com/track-2.mp3`
              );
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Insert example
          </button>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e6fffa",
            background: "#f0fdf4",
            fontSize: 13,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Bulk Save Result</h2>
          <p style={{ margin: "6px 0" }}>
            <strong>Total parsed:</strong> {result.total} &nbsp;|&nbsp;
            <strong>Saved:</strong> {result.success} ✅ &nbsp;|&nbsp;
            <strong>Failed:</strong> {result.failed} ❌
          </p>

          {/* Show failed details if present */}
          {Array.isArray(result.failedDetails) && result.failedDetails.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h3 style={{ margin: "8px 0 6px 0" }}>Failed lines</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "6px 8px" }}>Line</th>
                    <th style={{ padding: "6px 8px" }}>Spotify</th>
                    <th style={{ padding: "6px 8px" }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.failedDetails.map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 8px", verticalAlign: "top" }}>{f.lineNumber}</td>
                      <td style={{ padding: "6px 8px", wordBreak: "break-all" }}>{f.url}</td>
                      <td style={{ padding: "6px 8px" }}>{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Per-item details (optional) */}
          {Array.isArray(result.items) && (
            <div style={{ marginTop: 10 }}>
              <details>
                <summary style={{ cursor: "pointer" }}>Show per-item status</summary>
                <ol style={{ marginTop: 8 }}>
                  {result.items.map((it, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      Line {it.index + 1}: {it.success ? "Saved ✅" : `Failed ❌ (${it.reason})`}
                      {it.song ? (
                        <div style={{ fontSize: 12, color: "#0f172a" }}>→ {it.song.title} — {it.song.artist}</div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
