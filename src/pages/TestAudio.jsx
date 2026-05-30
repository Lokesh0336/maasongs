// src/pages/TestAudio.jsx
import React from "react";

export default function TestAudio() {
  const url =
    "https://pub-78cfe95a5e1b4a34879ea516d38d4350.r2.dev/Varaha%20Roopam.mp3";

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Audio Player</h1>
      <p>Testing this URL:</p>
      <code style={{ fontSize: 12 }}>{url}</code>

      <div style={{ marginTop: 16 }}>
        <audio
          controls  
          src={url}
          style={{ width: 400 }}
          onError={(e) => console.error("Native <audio> error:", e)}
        />
      </div>
    </div>
  );
}
