// src/pages/AdminPage.jsx
import React, { useState } from "react";
import { useAlbums } from "../hooks/useAlbums";

const emptyAlbumForm = {
  title: "",
  slug: "",
  year: "",
  poster: "",
  starring: "",
  musicDirector: "",
  director: "",
  trending: false,
};

const emptySong = { title: "", duration: "", audioUrl: "" };

export default function AdminPage() {
  const { albums, saveAlbums } = useAlbums();
  const [form, setForm] = useState(emptyAlbumForm);
  const [songs, setSongs] = useState([emptySong]); // at least 1 row
  const [message, setMessage] = useState("");

  // Handle album meta fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle song field changes
  const handleSongChange = (index, field, value) => {
    setSongs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddSongRow = () => {
    setSongs((prev) => [...prev, emptySong]);
  };

  const handleRemoveSongRow = (index) => {
    setSongs((prev) => {
      if (prev.length === 1) return prev; // keep at least one row
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.title || !form.slug) {
      setMessage("Title and slug are required.");
      return;
    }

    // Build songs array from rows (ignore completely empty rows)
    const cleanedSongs = songs
      .map((song, idx) => ({
        id: `${form.slug || "song"}-${idx + 1}`,
        title: song.title.trim(),
        duration: song.duration.trim(),
        audioUrl: song.audioUrl.trim(),
      }))
      .filter((s) => s.title || s.audioUrl); // keep rows where at least title or link is given

    if (!cleanedSongs.length) {
      setMessage("Add at least one song (name or link) before saving.");
      return;
    }

    const year = parseInt(form.year || "0", 10) || new Date().getFullYear();
    const starringArr = form.starring
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newAlbum = {
      id: form.slug,
      slug: form.slug,
      title: form.title,
      year,
      poster: form.poster,
      starring: starringArr.length ? starringArr : ["Unknown"],
      musicDirector: form.musicDirector || "Unknown",
      director: form.director || "Unknown",
      trending: form.trending,
      songs: cleanedSongs,
    };

    const updated = [...albums, newAlbum];
    saveAlbums(updated);

    setMessage(`Album "${form.title}" with ${cleanedSongs.length} song(s) added!`);
    setForm(emptyAlbumForm);
    setSongs([emptySong]); // reset song list
  };

  return (
    <div>
      <h1>Admin - Add Album & Songs</h1>
      <p style={{ fontSize: 13, color: "#9ca3af" }}>
        Fill album details, then add each song (name + audio link). Everything is stored
        in this browser&apos;s localStorage and shows instantly on the site.
      </p>

      {message && (
        <p style={{ fontSize: 13, marginTop: 6, color: "#22c55e" }}>{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 16,
          display: "grid",
          gap: 14,
          maxWidth: 680,
        }}
      >
        {/* Album meta section */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg-soft)",
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Album Details</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12 }}>Album Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="e.g. My Lord"
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Slug (URL) *</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="e.g. my-lord-2025-songs"
              />
              <small style={{ fontSize: 11, color: "#9ca3af" }}>
                Final album URL will be <code>/album/your-slug</code>
              </small>
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Year</label>
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="e.g. 2025"
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Poster URL</label>
              <input
                name="poster"
                value={form.poster}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="https://example.com/poster.jpg"
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Starring (comma separated)</label>
              <input
                name="starring"
                value={form.starring}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="Actor 1, Actor 2"
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Music Director</label>
              <input
                name="musicDirector"
                value={form.musicDirector}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="e.g. Anirudh Ravichander"
              />
            </div>

            <div>
              <label style={{ fontSize: 12 }}>Director</label>
              <input
                name="director"
                value={form.director}
                onChange={handleChange}
                className="select-control"
                style={{ width: "100%" }}
                placeholder="e.g. Lokesh Kanagaraj"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                id="trending"
                type="checkbox"
                name="trending"
                checked={form.trending}
                onChange={handleChange}
              />
              <label htmlFor="trending" style={{ fontSize: 12 }}>
                Mark as trending
              </label>
            </div>
          </div>
        </div>

        {/* Songs section */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg-soft)",
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Songs</h3>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 0, marginBottom: 8 }}>
            Add each song with its name, optional duration, and a direct audio URL (mp3
            link).
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            {songs.map((song, index) => (
              <div
                key={index}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    Song {index + 1}
                  </span>
                  {songs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSongRow(index)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#f97373",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 0.7fr)",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Song title"
                    value={song.title}
                    onChange={(e) =>
                      handleSongChange(index, "title", e.target.value)
                    }
                    className="select-control"
                    style={{ width: "100%" }}
                  />
                  <input
                    type="text"
                    placeholder="Duration (optional, e.g. 3:45)"
                    value={song.duration}
                    onChange={(e) =>
                      handleSongChange(index, "duration", e.target.value)
                    }
                    className="select-control"
                    style={{ width: "100%" }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Audio URL (direct .mp3 link)"
                  value={song.audioUrl}
                  onChange={(e) =>
                    handleSongChange(index, "audioUrl", e.target.value)
                  }
                  className="select-control"
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddSongRow}
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px dashed var(--border)",
              background: "transparent",
              color: "var(--text)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            + Add another song
          </button>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 4,
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background:
              "radial-gradient(circle at 0 0, #22c55e, #0ea5e9, #6366f1)",
            color: "#020617",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Save Album
        </button>
      </form>
    </div>
  );
}
