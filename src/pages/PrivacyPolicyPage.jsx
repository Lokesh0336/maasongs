import React from "react";

const PrivacyPolicyPage = () => {
  const darkTextColor = "#333";
  const lightGreyTextColor = "#666";

  return (
    <div
      className="policy-page-container"
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        lineHeight: "1.6",
        fontFamily: "Arial, sans-serif",
        color: darkTextColor,
      }}
    >
      <h1
        style={{
          color: "#007bff",
          borderBottom: "2px solid #007bff",
          paddingBottom: "10px",
        }}
      >
        Privacy Policy for AudioStation (Educational Use)
      </h1>

      <p style={{ fontSize: "0.9em", color: lightGreyTextColor, marginBottom: "30px" }}>
        Effective Date: November 30, 2025
      </p>

      {/* PRIMARY OBJECTIVE */}
      <div
        style={{
          backgroundColor: "#f0f8ff",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #b8daff",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ color: "#0056b3" }}>Primary Objective and Commitment</h2>

        <p style={{ color: darkTextColor }}>
          The AudioStation application is designed and operated exclusively for
          educational and demonstration purposes. Our core policy is the strict
          non-collection of personal information. We are firmly committed to
          protecting the privacy of users by not gathering any data from them.
        </p>
      </div>

      {/* WE DO NOT COLLECT ANY DATA */}
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#dc3545" }}>1. Personal Information: NONE Collected</h2>

        <p style={{ color: darkTextColor }}>
          AudioStation does not require registration, user accounts, or sign-in.
        </p>

        <p style={{ color: darkTextColor }}>
          We want to be absolutely clear: we do NOT collect, store, or transmit
          any personally identifiable information (PII) from our users. This includes:
        </p>

        <ul style={{ color: darkTextColor }}>
          <li>Names or Email Addresses</li>
          <li>Physical Addresses or Phone Numbers</li>
          <li>Date of Birth or Financial Information</li>
          <li>
            User-Generated Content (playlists, favorites, or settings are not saved on
            any server)
          </li>
          <li>IP Addresses or Geolocation Data</li>
        </ul>

        <p style={{ fontWeight: "bold", color: "#dc3545" }}>
          All interaction is temporary and stored only in your current browser session.
        </p>
      </section>

      {/* DATA HANDLING */}
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#28a745" }}>2. Data Usage and Scope (Local Only)</h2>

        <h3>2.1. Local Storage for Educational Demonstration</h3>
        <p style={{ color: darkTextColor }}>
          Any functional features such as temporary settings or audio controls are
          managed entirely through client-side memory or session storage.
        </p>

        <ul style={{ color: darkTextColor }}>
          <li>All data is temporary and deleted when the browser tab is closed.</li>
          <li>No data is transmitted to servers or third parties.</li>
        </ul>

        <h3>2.2. No External Tracking or Analytics</h3>
        <p style={{ color: darkTextColor }}>
          We do not use tracking pixels, analytics tools, or any service that tracks or
          monitors user behavior.
        </p>
      </section>

      {/* POLICY UPDATES */}
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ color: darkTextColor }}>3. Changes to This Privacy Policy</h2>
        <p style={{ color: darkTextColor }}>
          Updates to this Privacy Policy will be posted with a revised effective date.
          Since the application does not collect user data, significant changes are
          unlikely.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
