"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun, Ellipsis, X, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { WaveText } from "./WaveText";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light"
    );
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLinks = [
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Skills", href: "/skills" },
    { label: "Experience", href: "/experience" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="wordmark"
            href="/"
            aria-label={`${profile.fullName}, home`}
          >
            <span className="wordmark-text">{profile.shortName}</span>
          </a>

          <div className="header-actions">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              aria-pressed={isDark}
              className="wave-target icon-button theme-toggle"
            >
              <span
                className="wave-icon"
                aria-hidden="true"
                style={{ ["--wave-icon-size" as string]: "20px" }}
              >
                <span className="wave-icon-track">
                  <span>{isDark ? <Sun size={18} /> : <Moon size={18} />}</span>
                  <span>{isDark ? <Sun size={18} /> : <Moon size={18} />}</span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="icon-button nav-menu-trigger wave-target"
              aria-label="Navigation menu"
              aria-expanded={menuOpen}
              aria-controls="navigation-panel"
              aria-haspopup="dialog"
            >
              <span
                className="wave-icon"
                aria-hidden="true"
                style={{ ["--wave-icon-size" as string]: "24px" }}
              >
                <span className="wave-icon-track">
                  <span>
                    <Ellipsis size={24} />
                  </span>
                  <span>
                    <Ellipsis size={24} />
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="navigation-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="nav-panel is-open ac-nav-drawer"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="wordmark-text" style={{ fontWeight: 600 }}>
              {profile.shortName}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="icon-button wave-target"
              aria-label="Close navigation menu"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <X size={22} />
            </button>
          </div>

          <nav
            className="nav-panel-links"
            aria-label="Site navigation"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(12px, 2.5vh, 24px)",
            }}
          >
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="wave-target"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                <WaveText text={item.label} />
              </a>
            ))}
          </nav>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              borderTop: "1px solid var(--sc-hairline)",
              paddingTop: "20px",
            }}
          >
            <a
              href={`mailto:${profile.email}`}
              className="wave-target"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <WaveText text={profile.email} />
              <ArrowUpRight size={16} />
            </a>
            <div style={{ display: "flex", gap: "16px" }}>
              {profile.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wave-target"
                >
                  <WaveText text={s.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
