import React from 'react';

const DisclaimerPage = () => {
  // Define colors for Light Theme
  const mainTextColor = '#333';
  const headerColor = '#0056b3';
  const noticeColor = '#856404'; // Darker color for notice box text

  return (
    <div 
      className="disclaimer-page-container" 
      style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto', 
        lineHeight: '1.6', 
        fontFamily: 'Arial, sans-serif', 
        color: mainTextColor 
      }}
    >
      <h1 style={{ color: headerColor, borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        Disclaimer for AudioStation (Educational Project)
      </h1>
      
      <div 
        style={{ 
          marginTop: '20px', 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#fffbe6', // Light yellow background for notice
          border: '1px solid #ffc107', 
          borderRadius: '4px' 
        }}
      >
        <p style={{ fontWeight: 'bold', color: noticeColor }}>
          Purpose of This Application:
        </p>
        <p style={{ color: noticeColor }}>
          AudioStation is built strictly as an educational and technical demonstration. It is intended to showcase front-end development, component architecture, and design concepts. It is not a real commercial product, and no user data is collected or stored.
        </p>
      </div>

      {/* --- Content Source and Status --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: headerColor }}>1. Content and Data Status</h2>
        <p>
          Any audio tracks, images, or metadata displayed within AudioStation are used solely for simulation purposes. The content may be sourced from publicly available APIs or simulated data to demonstrate functionality.
        </p>
        <ul style={{ color: mainTextColor }}>
          <li>No Commercial Use: The application is not licensed for public music distribution.</li>
          <li>As-Is Functionality: Features may not work flawlessly and may contain bugs, as it is a project under continuous development and review.</li>
        </ul>
      </section>

      {/* --- Responsibility and Liability --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: headerColor }}>2. Project Responsibility</h2>
        <p>
          While we strive for high quality, we cannot guarantee that the application will be uninterrupted, error-free, or compatible with all devices.
        </p>
        <p>
          By using this educational project, you acknowledge that its use is for informational and demonstrative purposes. The developer holds no liability for any perceived loss or inconvenience resulting from the application's temporary nature or performance quirks.
        </p>
      </section>
      
      <p style={{ marginTop: '40px', fontSize: '0.9em', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        This disclaimer reflects the application's status as a non-commercial, educational project.
      </p>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Last Updated: November 30, 2025
      </p>
    </div>
  );
};

export default DisclaimerPage;