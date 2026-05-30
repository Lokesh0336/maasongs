// src/components/Footer.jsx
import React from "react";
import { Link } from 'react-router-dom';
import { FaInstagram } from "react-icons/fa"; 

// --- Configuration Constants ---
const INSTAGRAM_URL = "https://www.instagram.com/lokesh_ragutla96/";

export default function Footer({ theme }) {
  const currentYear = new Date().getFullYear();
  // MODIFICATION: Enforcing dark theme for consistency with PlayerBar
  const isDark = true; 

  return (
    <>
      <style>{`
        .footer {
          padding: 40px 20px;
          background: rgba(10, 15, 25, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          margin-bottom: 90px; /* Space for the floating PlayerBar */
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #aaa;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #8b5cf6; /* Matching your purple accent */
        }

        .footer-separator {
          color: #444;
          font-size: 14px;
        }

        .footer-copy {
          color: #666;
          font-size: 13px;
          margin: 10px 0;
        }

        .footer-tagline {
          color: #444;
          font-size: 12px;
          font-style: italic;
          margin-top: 5px;
        }

        .footer-social {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }

        .social-icon {
          color: #aaa;
          font-size: 20px;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .social-icon:hover {
          color: #d62976; /* Instagram Pink */
          transform: translateY(-3px);
        }
      `}</style>

      <footer className="footer">
        <div className="footer-links">
          <a href="/privacy" className="footer-link">
            Privacy Policy
          </a>
          <span className="footer-separator">·</span>
          <a href="/terms" className="footer-link">
            Terms of Use
          </a>
          <span className="footer-separator">·</span>
          {/* 🚀 Internal React Link */}
          <Link to="/disclaimer" className="footer-link">
            Disclaimer
          </Link>
          <span className="footer-separator">·</span>
          <a href="/contact" className="footer-link">
            Contact
          </a>
        </div>

        <div className="footer-social">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaInstagram />
          </a>
        </div>

        <p className="footer-copy">
          &copy; {currentYear} <strong>AudioStation</strong>. All rights reserved.
        </p>
        
        <p className="footer-tagline">
          The ultimate destination for your audio experience.
        </p>
      </footer>
    </>
  );
}
