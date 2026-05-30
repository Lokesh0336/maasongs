import React from 'react';

const TermsOfUsePage = () => {
  // Define colors optimized for a standard Light Theme (as assumed for the current flow)
  const darkTextColor = '#333';
  const headerColor = '#0056b3';

  return (
    <div 
      className="terms-of-use-container" 
      style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto', 
        lineHeight: '1.6', 
        fontFamily: 'Arial, sans-serif', 
        color: darkTextColor 
      }}
    >
      
      <h1 style={{ color: headerColor, borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        Terms of Use for AudioStation (Educational Project)
      </h1>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '30px' }}>
        Last Revised: November 30, 2025
      </p>

      {/* --- Preamble and Educational Scope --- */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: headerColor }}>1. Acceptance of Terms and Educational Scope</h2>
        <p>
          By accessing and using AudioStation, you agree to be bound by these Terms of Use. If you do not agree, you must cease use of the application immediately.
        </p>
        <p style={{ borderLeft: '3px solid #ffc107', paddingLeft: '15px', backgroundColor: '#fffbe6', color: '#856404' }}>
          Important Note: AudioStation is an educational and non-commercial demonstration project. It is intended solely to showcase front-end development skills and concepts. It is not a live, public, commercial, or licensed music streaming service.
        </p>
      </section>
      
      {/* --- User Obligations --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: headerColor }}>2. Limited License and Use</h2>
        
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and use AudioStation for personal, educational, and non-commercial purposes only.
        </p>
        
        <h3>2.1. Restrictions</h3>
        <p>
          You agree not to use the application for any purpose that is unlawful or prohibited by these Terms. Specifically, you agree not to:
        </p>
        <ul>
          <li>Reproduce, duplicate, copy, sell, or exploit any portion of the application for any commercial purpose.</li>
          <li>Attempt to reverse engineer or gain unauthorized access to any parts of the application or its underlying systems.</li>
          <li>Use any automated means (e.g., bots or scripts) to access the application.</li>
        </ul>
      </section>

      {/* --- Intellectual Property and Content --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: headerColor }}>3. Intellectual Property and Third-Party Content</h2>
        <p>
          The application design, code, and interface are the property of the developer. However, any audio content, cover art, or metadata displayed within the application is for demonstration purposes only and is sourced from external, publicly available APIs or simulated data.
        </p>
        <ul>
          <li>AudioStation does 
            not
             host or claim ownership of any third-party music, sound recordings, or associated intellectual property.</li>
          <li>The application is built to demonstrate how a real music player functions, not to provide copyrighted material.</li>
        </ul>
      </section>
      
      {/* --- Disclaimers and Liability --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: headerColor }}>4. Disclaimer of Warranties</h2>
        <p>
          The application is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, regarding the operation of AudioStation or the information, content, or materials included on the Service.
        </p>
        <p>
          We explicitly disclaim all liability for any errors or malfunctions, as the app is subject to potential bugs inherent in a project under development.
        </p>
      </section>

      {/* --- Contact Information --- */}
      <section style={{ marginTop: '30px' }}>
      </section>
      
    </div>
  );
};

export default TermsOfUsePage;