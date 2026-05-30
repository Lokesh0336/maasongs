import React from "react";
import {
  FaInstagram,
  FaTelegramPlane,
  FaEnvelope,
  FaMusic,
} from "react-icons/fa";

const ContactPage = () => {
  return (
    <div
      className="contact-page-container"
      style={{
        padding: "25px",
        maxWidth: "850px",
        margin: "40px auto",
        lineHeight: "1.8",
        fontFamily: "'Outfit', sans-serif",

        background:
          "linear-gradient(180deg, #111827 0%, #0a0f20 100%)",

        border:
          "1px solid rgba(255,255,255,0.08)",

        borderRadius: "22px",

        color: "#f3f4f6",

        boxShadow:
          "0 15px 50px rgba(0,0,0,0.45)",

        backdropFilter: "blur(12px)",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "35px" }}>
        <div
          style={{
            width: "85px",
            height: "85px",
            margin: "0 auto 20px",

            borderRadius: "22px",

            background:
              "linear-gradient(135deg,#1e7fff,#06b6d4)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            boxShadow:
              "0 0 35px rgba(30,127,255,0.45)",
          }}
        >
          <FaMusic size={38} color="#fff" />
        </div>

        <h1
          style={{
            color: "#60a5fa",
            marginBottom: "10px",
            fontSize: "38px",
            fontWeight: "800",
          }}
        >
          Contact AudioStation
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#9ca3af",
            maxWidth: "650px",
            margin: "0 auto",
          }}
        >
          Thank you for exploring AudioStation.
          This project was developed for educational
          and demonstration purposes with a premium
          modern music experience.
        </p>
      </div>

      {/* ABOUT PROJECT */}
      <section
        style={{
          marginBottom: "35px",
          padding: "25px",

          background:
            "rgba(255,255,255,0.04)",

          border:
            "1px solid rgba(255,255,255,0.08)",

          borderRadius: "18px",
        }}
      >
        <h2
          style={{
            color: "#93c5fd",
            marginBottom: "15px",
            fontSize: "24px",
          }}
        >
          About This Project
        </h2>

        <p style={{ color: "#d1d5db" }}>
          AudioStation is a non-commercial music
          streaming demonstration project focused on
          front-end development, UI/UX design,
          performance optimization, and modern web
          application architecture.
        </p>

        <p
          style={{
            marginTop: "15px",
            color: "#9ca3af",
          }}
        >
          The platform is continuously being improved
          with premium UI design, responsive layouts,
          advanced audio player functionality, and
          multi-language music support.
        </p>
      </section>

      {/* CONTACT SECTION */}
      <section
        style={{
          padding: "25px",

          background:
            "rgba(255,255,255,0.04)",

          border:
            "1px solid rgba(255,255,255,0.08)",

          borderRadius: "18px",
        }}
      >
        <h2
          style={{
            color: "#93c5fd",
            marginBottom: "20px",
            fontSize: "24px",
          }}
        >
          Developer Contact
        </h2>

        {/* CONTACT CARDS */}
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {/* EMAIL */}
          <a
            href="mailto:lokeshragutla@gmail.com"
            style={{
              textDecoration: "none",
              color: "#fff",

              background:
                "rgba(255,255,255,0.03)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              borderRadius: "16px",

              padding: "18px",

              display: "flex",
              alignItems: "center",
              gap: "15px",

              transition: "0.3s ease",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",

                borderRadius: "14px",

                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaEnvelope size={20} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                Email
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                lokeshragutla@gmail.com
              </div>
            </div>
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/lokesh_ragutla96/"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              color: "#fff",

              background:
                "rgba(255,255,255,0.03)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              borderRadius: "16px",

              padding: "18px",

              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",

                borderRadius: "14px",

                background:
                  "linear-gradient(135deg,#ff4fd8,#7c3aed)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaInstagram size={22} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                Instagram
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                @lokesh_ragutla96
              </div>
            </div>
          </a>

          {/* TELEGRAM */}
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              color: "#fff",

              background:
                "rgba(255,255,255,0.03)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              borderRadius: "16px",

              padding: "18px",

              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",

                borderRadius: "14px",

                background:
                  "linear-gradient(135deg,#229ED9,#2563eb)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaTelegramPlane size={22} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                Telegram
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                Coming Soon
              </div>
            </div>
          </a>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          © 2026 AudioStation • Designed &
          Developed by Lokesh.R
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
