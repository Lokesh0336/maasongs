import React, { useState } from "react";

export default function LyricTestPage() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [lyricsData, setLyricsData] = useState(null);
  const [error, setError] = useState("");

  const handleFetchLyrics = async (e) => {
    e.preventDefault();
    setError("");
    setLyricsData(null);
    setLoading(true);

    try {
      // 1. Call your existing backend route
      const res = await fetch("http://localhost:4000/api/song/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: We only pass the required fields. audioUrl is required by your server.js.
        // We'll use a dummy URL since we only care about the lyrics test here.
        body: JSON.stringify({ 
            spotifyUrl, 
            audioUrl: "https://dummy.cdn/test.mp3" 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Backend failed to process the request.");
      } else {
        // 2. Fetch the saved song data from Supabase to retrieve the lyrics
        // NOTE: This requires a new route, but for a quick test, 
        // we'll assume the backend sends enough info to retrieve it.
        
        // Since your /api/song/save response doesn't return the full lyrics,
        // we'll rely on the server logs AND the final status.
        
        // --- REAL-WORLD SCENARIO requires a GET route ---
        // For a true test, we need the lyrics back.
        // Since we can't add a new GET route now, we will assume a successful save means lyrics are there.
        
        const successMessage = data.song.has_lyrics 
            ? "✅ Lyrics were fetched and saved successfully! Check Supabase."
            : "⚠️ Lyrics were NOT found on Genius. Check backend logs for errors.";

        setLyricsData({
            title: data.song.title,
            album: data.album.title,
            status: successMessage,
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Network error: Could not connect to the backend (Is it running on port 4000?).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "20px auto", border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ color: '#6366f1' }}>🎤 Genius Lyrics Fetch Test</h2>
      <p style={{ fontSize: 14, color: '#666' }}>
        Paste a Spotify Track URL below and submit. This runs your full backend pipeline.
      </p>

      <form onSubmit={handleFetchLyrics} style={{ marginTop: 20 }}>
        <label htmlFor="spotifyUrl" style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
          Spotify Track URL:
        </label>
        <input
          id="spotifyUrl"
          type="url"
          placeholder="e.g., https://open.spotify.com/track/..."
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
          required
        />
        
        <button
          type="submit"
          disabled={loading || !spotifyUrl}
          style={{ 
            marginTop: 15, 
            padding: '10px 20px', 
            borderRadius: 4, 
            border: 'none', 
            cursor: 'pointer', 
            background: loading ? '#ccc' : '#22c55e', 
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {loading ? "Processing..." : "Test Lyric Fetch"}
        </button>
      </form>

      {/* Display Results and Status */}
      {error && (
        <div style={{ marginTop: 20, padding: 10, border: '1px solid salmon', color: 'salmon', backgroundColor: '#fee2e2' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {lyricsData && (
        <div style={{ marginTop: 20, padding: 15, border: '1px solid #22c55e', backgroundColor: '#ecfdf5', borderRadius: 4 }}>
          <h3>Result for "{lyricsData.title}"</h3>
          <p><strong>Album:</strong> {lyricsData.album}</p>
          <p style={{ fontWeight: 'bold', color: lyricsData.status.startsWith('✅') ? '#059669' : 'orange' }}>
            {lyricsData.status}
          </p>
          <p style={{ fontSize: 12, marginTop: 10 }}>
            *Check your **Express server console** for more detailed logs (e.g., character count or errors).
            The song has been inserted into your Supabase `songs` table.
          </p>
        </div>
      )}
    </div>
  );
}