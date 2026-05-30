// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import AlbumPage from "./pages/AlbumPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import PlayerBar from "./components/PlayerBar.jsx";
import SpotifyHelper from "./pages/SpotifyHelper.jsx";
import SongHelper from "./pages/SongHelper.jsx";
import AddSongAdmin from "./pages/AddSongAdmin.jsx";
import TestAudio from "./pages/TestAudio.jsx";
import DisclaimerPage from './pages/DisclaimerPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage'; // <-- New Import
import ContactPage from './pages/ContactPage'; // <-- New Import

// IMPORTANT: Use the MusicPlayerContext provider to expose the global player
import { PlayerProvider } from "./context/MusicPlayerContext";

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    // Wrap entire app with PlayerProvider so usePlayer() works everywhere
    <PlayerProvider>
      <div className="app">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="container">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  // If Home still expects a prop to trigger play, it can call the shared context itself.
                  // You may remove prop usage later — keeping nothing here to avoid confusion.
                />
              }
            />
            <Route
              path="/album/:slug"
              element={
                // AlbumPage itself uses usePlayer() directly, so no need to pass onPlayQueue props.
                <AlbumPage />
              }
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/spotify-helper" element={<SpotifyHelper />} />
            <Route path="/song-helper" element={<SongHelper />} />
            <Route path="/admin/add-song" element={<AddSongAdmin />} />
            <Route path="/test-audio" element={<TestAudio />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/contact" element={<ContactPage />} /> {/* <-- Add this route */}
          </Routes>
        </main>

        {/* Render the shared PlayerBar once (it reads state from MusicPlayerContext) */}
        <PlayerBar />

        <Footer />
      </div>
    </PlayerProvider>
  );
}

export default App;