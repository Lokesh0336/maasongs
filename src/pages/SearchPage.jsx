// src/pages/SearchPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FaSearch, FaSpinner, FaCompactDisc, FaMusic } from "react-icons/fa";

// Use your local fallback image (developer-provided asset)
const FALLBACK_COVER = "/mnt/data/c9df7b5f-8a5b-4537-913e-5c52a273119d.png";
const STORAGE_BUCKET = "tracks";

// AlbumCard component (copied for consistent display)
const AlbumCard = ({ album }) => {
  const artistsDisplay =
    Array.isArray(album.artists) && album.artists.length > 0
      ? album.artists.join(", ")
      : "Various Artists";

  return (
    <Link
      to={`/album/${album.slug}`}
      className="album-card group block p-3 rounded-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
    >
      <div className="relative overflow-hidden rounded-md aspect-square mb-3">
        <img
          src={album.poster || FALLBACK_COVER}
          alt={album.title}
          className="album-cover w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      </div>

      <div className="album-meta text-center">
        <h3 className="album-title text-base font-semibold truncate text-gray-900 dark:text-white mb-1">
          {album.title}
        </h3>
        <p className="album-sub text-xs text-gray-500 dark:text-gray-400">
          {album.year && <span className="mr-1">{album.year} ·</span>}
          <span className="truncate">{artistsDisplay}</span>
        </p>
      </div>
    </Link>
  );
};

// Global cache for all album data
let ALL_ALBUMS_CACHE = null;

const resolveImageUrl = async (maybePath) => {
  if (!maybePath) return FALLBACK_COVER;
  if (maybePath.startsWith("http://") || maybePath.startsWith("https://"))
    return maybePath;
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(maybePath, 60);
    if (error) return FALLBACK_COVER;
    return data?.signedUrl || FALLBACK_COVER;
  } catch (e) {
    return FALLBACK_COVER;
  }
};


export default function SearchPage() {
  const [params] = useSearchParams();
  const rawQuery = params.get("q") || "";
  const q = rawQuery.toLowerCase().trim();

  const [displayResults, setDisplayResults] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading to fetch data first
  const [error, setError] = useState(null);

  // 1. Function to fetch and cache ALL data from Supabase
  useEffect(() => {
    const fetchAllAlbumsAndSongs = async () => {
      if (ALL_ALBUMS_CACHE) {
        setLoading(false);
        return;
      }
      
      setError(null);
      setLoading(true);

      try {
        // Fetch ALL albums, and embed their songs using an inner join (if your RLS allows it)
        const { data: albumData, error: albumErr } = await supabase
          .from("albums")
          .select(`
            id, 
            slug, 
            title, 
            year, 
            cover_url, 
            artists,
            songs:songs(title, duration_ms) // Fetch related songs
          `);

        if (albumErr) throw albumErr;

        const mappedData = await Promise.all(
          (albumData || []).map(async (a) => {
            let artistsArray = [];
            if (Array.isArray(a.artists)) artistsArray = a.artists;
            else if (a.artists) artistsArray = [String(a.artists)];

            const posterUrl = await resolveImageUrl(a.cover_url);

            return {
              id: a.id,
              slug: a.slug,
              title: a.title,
              year: a.year,
              poster: posterUrl,
              artists: artistsArray,
              songs: a.songs || [], // Array of songs
              // Helper field for searching: concatenate all searchable text
              searchableText: [
                a.title.toLowerCase(),
                ...artistsArray.map(artist => artist.toLowerCase()),
                ...(a.songs || []).map(s => s.title.toLowerCase())
              ].join(" "),
            };
          })
        );
        
        ALL_ALBUMS_CACHE = mappedData;
        setError(null);

      } catch (e) {
        console.error("Failed to load search index:", e);
        setError("Failed to load album data for search.");
        ALL_ALBUMS_CACHE = [];
      } finally {
        setLoading(false);
      }
    };
    fetchAllAlbumsAndSongs();
  }, []); // Run only once on mount

  // 2. Function to filter results based on the query 'q'
  useEffect(() => {
    if (loading || error) return; // Wait for data to load
    
    if (!q) {
      setDisplayResults([]);
      return;
    }

    if (!ALL_ALBUMS_CACHE) {
       // Should not happen if loading state is correct, but safe check
       setError("Search data not available.");
       return;
    }

    const filtered = ALL_ALBUMS_CACHE.filter((album) => {
      // Use the pre-calculated searchableText field
      return album.searchableText.includes(q);
    });

    setDisplayResults(filtered);
    
  }, [q, loading, error]); // Re-run filter when query changes or data finishes loading

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header/Title */}
      <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center mb-2">
          <FaSearch className="mr-3 text-indigo-600" /> Search Results
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Showing results for: <strong className="text-indigo-600 dark:text-indigo-400">"{rawQuery}"</strong>
        </p>
      </header>
      
      {/* Search Status */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-3xl text-indigo-500 mr-3" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Preparing search index...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative my-8" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      
      {/* No Query Prompt */}
      {!q && !loading && (
        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <FaMusic className="text-5xl text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">Start typing to search your music library.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">The query parameter 'q' is currently empty.</p>
        </div>
      )}

      {/* No Results */}
      {q && !loading && displayResults.length === 0 && !error && (
        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">No albums found matching "<strong>{rawQuery}</strong>".</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Try searching for different artists, album titles, or song names.</p>
        </div>
      )}
      
      {/* Results Grid */}
      {displayResults.length > 0 && !loading && (
        <section className="mt-8">
          <div className="album-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {displayResults.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}