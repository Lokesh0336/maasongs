import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { usePlayer } from "../context/MusicPlayerContext";
import {
  FaSpinner,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaInstagram,
  FaSearch,
  FaTimes,
  FaHeart,
  FaHeadphones,
  FaCompactDisc,
} from "react-icons/fa";

const STORAGE_BUCKET = "tracks";
const FALLBACK_COVER = "https://placehold.co/60x60/0a0a0f/FFF?text=🎶";
const INSTAGRAM_URL = "https://www.instagram.com/lokesh_ragutla96/";

/* -------------------- UTIL HOOK -------------------- */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* -------------------- COMPONENT -------------------- */
export default function Header() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const [myPlaylistOpen, setMyPlaylistOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const player = usePlayer();
  const rootRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path ? "as-nav-link active" : "as-nav-link";
  
  /* -------------------- CURRENT USER -------------------- */
  const getCurrentUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user ?? null;
  }, []);

  /* -------------------- LOAD LIKED SONGS -------------------- */
  const loadLikedSongs = useCallback(async () => {
    setLoadingLiked(true);
    try {
      const user = await getCurrentUser();
      let likedIds = [];

      if (user) {
        const { data, error } = await supabase
          .from("likes")
          .select("song_id")
          .eq("user_id", user.id);
        if (!error) likedIds = (data || []).map((r) => r.song_id);
      } else {
        const raw = localStorage.getItem("player_likes_v1");
        const parsed = raw ? JSON.parse(raw) : {};
        likedIds = Object.keys(parsed).filter((k) => parsed[k]);
      }

      if (!likedIds.length) {
        setLikedSongs([]);
        return;
      }

      const { data: songs, error } = await supabase
        .from("songs")
        .select("id, title, audio_url_new, duration_ms, album_id")
        .in("id", likedIds);

      if (error) throw error;

      const resolved = await Promise.all(
songs.map(async (s) => {
  const audio = s.audio_url_new || "";

  let cover = FALLBACK_COVER;
  let artists = [];

  if (s.album_id) {
    const { data: album } = await supabase
      .from("albums")
      .select("cover_url, artists")
      .eq("id", s.album_id)
      .single();

    if (album?.cover_url) {
      cover = album.cover_url;
    }

    if (album?.artists) {
      artists = album.artists;
    }
  }

  return {
    id: s.id,
    title: s.title,
    audio_url: audio,
    image_url: cover,

    artists,

    artist: Array.isArray(artists)
      ? artists.join(", ")
      : artists || "Unknown Artist",
  };
})
      );
      setLikedSongs(resolved);
    } catch (e) {
      console.error("Liked songs load error:", e);
      setLikedSongs([]);
    } finally {
      setLoadingLiked(false);
    }
  }, [getCurrentUser]);

  /* -------------------- SEARCH LOGIC -------------------- */
  const performSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const songQuery = supabase.from("songs").select("id, title, audio_url_new, album_id").ilike("title", `%${q}%`).limit(5);
      const albumQuery = supabase.from("albums").select("id, title, slug, cover_url").ilike("title", `%${q}%`).limit(3);
      
      const [sRes, aRes] = await Promise.all([songQuery, albumQuery]);
      
      const combined = [
        ...(aRes.data || []).map(a => ({ type: 'album', payload: a })),
        ...(sRes.data || []).map(s => ({ type: 'song', payload: s }))
      ];
      setSuggestions(combined);
      setSuggestionsOpen(true);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchItemClick = async (item) => {
    if (item.type === 'album') {
      navigate(`/album/${item.payload.slug}`);
    } else {
const audio = item.payload.audio_url_new || "";

let cover = FALLBACK_COVER;
let artists = [];

if (item.payload.album_id) {
  const { data: album } = await supabase
    .from("albums")
    .select("cover_url, artists")
    .eq("id", item.payload.album_id)
    .single();

  if (album?.cover_url) {
    cover = album.cover_url;
  }

  if (album?.artists) {
    artists = album.artists;
  }
}

player.playList([{
  id: item.payload.id,
  title: item.payload.title,
  audio_url: audio,
  image_url: cover,

  artists,

  artist: Array.isArray(artists)
    ? artists.join(", ")
    : artists || "Unknown Artist",
}], 0, true);
    }
    setSuggestionsOpen(false);
    setSearchText("");
  };

  /* -------------------- PLAY ALL ACTION -------------------- */
  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      player.playList(likedSongs, 0, true);
      setMyPlaylistOpen(false); // Optional: close dropdown on play
    }
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    if (debouncedSearch) performSearch(debouncedSearch);
    else setSuggestionsOpen(false);
  }, [debouncedSearch, performSearch]);

  useEffect(() => {
    loadLikedSongs();
    const { data: auth } = supabase.auth.onAuthStateChange(() => loadLikedSongs());
    const channel = supabase.channel("likes-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => loadLikedSongs())
      .subscribe();

    return () => {
      auth?.subscription?.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [loadLikedSongs]);

  useEffect(() => {
    const close = (e) => { 
        if (rootRef.current && !rootRef.current.contains(e.target)) { 
            setSuggestionsOpen(false); 
            setMyPlaylistOpen(false); 
        } 
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="as-header-prime" ref={rootRef}>
      <div className="as-inner">
<Link to="/" className="as-logo-wrap">
  <img
    src="https://media.maasongs.online/svgviewer-png-output.png"
    alt="AudioStation"
    className="as-logo-image"
  />
</Link>

        {/* SEARCH BAR */}
        <div className="as-search-container">
          <div className="as-search-box">
            <FaSearch className="as-s-icon" />
            <input 
              type="text" 
              placeholder="Search music..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => searchText && setSuggestionsOpen(true)}
            />
            {searching ? <FaSpinner className="as-spin" /> : searchText && <FaTimes onClick={() => setSearchText("")} />}
          </div>

          {suggestionsOpen && suggestions.length > 0 && (
            <div className="as-search-dropdown">
              {suggestions.map((item, i) => (
                <div key={i} className="as-search-item" onClick={() => handleSearchItemClick(item)}>
                  {item.type === 'album' ? <FaCompactDisc className="type-icon-a" /> : <FaPlay className="type-icon-s" />}
                  <div className="item-info">
                    <span className="item-title">{item.payload.title}</span>
                    <span className="item-type">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="as-nav">
          <Link to="/" className={isActive("/")}>Explore</Link>

          <div className="as-lib-box">
            <button className="as-lib-toggle" onClick={() => setMyPlaylistOpen(!myPlaylistOpen)}>
              <FaHeart /> Library {myPlaylistOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {myPlaylistOpen && (
              <div className="as-lib-dropdown">
                <div className="as-lib-header">
                  <span>LIKED SONGS ({likedSongs.length})</span>
                  {likedSongs.length > 0 && (
                    <button className="as-play-all-btn" onClick={handlePlayAll}>
                      <FaPlay size={8} /> PLAY ALL
                    </button>
                  )}
                </div>
                <div className="as-lib-scroll">
                  {loadingLiked ? (
                    <div className="as-status"><FaSpinner className="as-spin" /> Loading...</div>
                  ) : likedSongs.length ? (
                    likedSongs.map((s) => (
                      <div key={s.id} className="as-lib-track" onClick={() => player.playList([s], 0, true)}>
                        <FaPlay className="as-p-icon" />
                        <div className="as-t-name">{s.title}</div>
                      </div>
                    ))
                  ) : (
                    <div className="as-status">No liked songs</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="as-social"><FaInstagram /></a>
        </nav>
      </div>

      <style>{`
        .as-header-prime { background: #050507; border-bottom: 1px solid #1a1a24; position: sticky; top: 0; z-index: 1000; height: 70px; display: flex; align-items: center; color: #fff; font-family: sans-serif; }
        .as-inner { max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .as-logo-wrap { text-decoration: none; display: flex; align-items: center; gap: 10px; min-width: 150px; }
        .as-logo-glow { background: #569aff; width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .as-main-name { font-weight: 800; font-size: 18px; color: #fff; }
        .as-main-name .purple { color: #569aff; }

        .as-search-container { position: relative; flex: 1; max-width: 500px; }
        .as-search-box { background: #192849; border: 1px solid #d0d0d0; border-radius: 8px; padding: 8px 15px; display: flex; align-items: center; gap: 10px; }
        .as-search-box input { background: transparent; border: none; color: #fff; outline: none; width: 100%; font-size: 14px; }
        .as-s-icon { color: #4b5563; }

        .as-search-dropdown { position: absolute; top: 110%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; }
        .as-search-item { padding: 10px 15px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #1e293b; }
        .as-search-item:hover { background: #1e293b; }
        .type-icon-a { color: #3b82f6; }
        .type-icon-s { color: #569aff; font-size: 10px; }
        .item-info { display: flex; flex-direction: column; }
        .item-title { font-size: 14px; font-weight: 600; }
        .item-type { font-size: 10px; color: #6b7280; text-transform: uppercase; }

        .as-nav { display: flex; align-items: center; gap: 20px; }
        .as-nav-link { text-decoration: none; color: #9ca3af; font-weight: 600; transition: 0.2s; }
        .as-nav-link.active, .as-nav-link:hover { color: #fff; }

        .as-lib-box { position: relative; }
        .as-lib-toggle { background: #569aff; color: #000000; border: 1px solid #312e81; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
        .as-lib-dropdown { position: absolute; top: 125%; right: 0; width: 280px; background: #050507; border: 1px solid #1e293b; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 10; }
        .as-lib-header { padding: 10px 15px; font-size: 11px; font-weight: 800; color: #4b5563; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
        
        .as-play-all-btn { background: #569aff; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 700; transition: 0.2s; }
        .as-play-all-btn:hover { background: #569aff; transform: scale(1.05); }

        .as-lib-scroll { max-height: 300px; overflow-y: auto; }
        .as-lib-track { padding: 10px 15px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
        .as-lib-track:hover { background: #0f172a; }
        .as-p-icon { font-size: 10px; color: #569aff; }
        .as-t-name { font-size: 12px; color: #e5e7eb; }
        .as-status { padding: 20px; text-align: center; color: #4b5563; font-size: 13px; }
        .as-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .as-social { color: #9ca3af; font-size: 18px; transition: 0.2s; }
        .as-social:hover { color: #fff; }
        
        @media (max-width: 768px) { .as-search-container { display: none; } }
      `}</style>
    </header>
  );
}
