// src/components/AlbumCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.slug}`} className="album-card">
      <img
        src={album.poster || "https://via.placeholder.com/150x150.png?text=Album"}
        alt={album.title}
        className="album-cover"
        loading="lazy"
      />
      <div className="album-meta">
        <h3 className="album-title">{album.title}</h3>
        <p className="album-sub">
          <strong>Starring:</strong> {album.starring.join(", ")}
          <br />
          <strong>Music:</strong> {album.musicDirector}
          <br />
          <strong>Director:</strong> {album.director}
        </p>
        <div className="album-tag">
          {album.year} • {album.trending ? "Trending" : "Album"}
        </div>
      </div>
    </Link>
  );
}
