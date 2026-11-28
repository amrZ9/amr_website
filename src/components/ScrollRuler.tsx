"use client";

import React, { useEffect, useRef, useState } from "react";

const CHAPTERS = [
  { id: "biography", label: "01 BIOGRAPHY" },
  { id: "skills", label: "02 CAPABILITIES" },
  { id: "projects", label: "03 VENTURES" },
  { id: "experience", label: "04 EXPERIENCE" },
  { id: "contact", label: "05 CONTACT" },
];

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);

const OBSTACLE_SELECTOR =
  "footer, .hero-footer, .hero-display-title, .ac-marquee, .metrics-strip, .project-folder, .skills-specimen, .experience-item, .contact-form, .bio-introduction, h1, h2";

export function ScrollRuler() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("biography");
  const [indexHidden, setIndexHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;

    const checkVisibility = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0);

      const nav = navRef.current;
      if (!nav) return;

      const navRect = nav.getBoundingClientRect();
      if (navRect.width === 0 || navRect.height === 0) return;

      // Hide when footer reaches the bottom area of the viewport
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight - 20) {
          setIndexHidden(true);
          return;
        }
      }

      // Hide if any major content element would overlap the jump index
      const pad = 12;
      const obstacles = document.querySelectorAll<HTMLElement>(OBSTACLE_SELECTOR);
      let overlaps = false;
      for (let i = 0; i < obstacles.length; i++) {
        const el = obstacles[i];
        if (nav.contains(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (
          r.right > navRect.left - pad &&
          r.left < navRect.right + pad &&
          r.bottom > navRect.top - pad &&
          r.top < navRect.bottom + pad
        ) {
          overlaps = true;
          break;
        }
      }
      setIndexHidden(overlaps);
    };

    const scheduleCheck = () => {
      if (!raf) raf = requestAnimationFrame(checkVisibility);
    };

    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });
    checkVisibility();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
    );

    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <div className="ac-ruler" aria-hidden="true">
        {TICKS.map((t) => (
          <span
            key={t}
            className={`ac-ruler-tick${t % 25 === 0 ? " is-major" : ""}`}
          >
            {t % 25 === 0 ? t : ""}
          </span>
        ))}
        <span
          className="ac-ruler-indicator"
          style={{ top: `${progress * 100}%` }}
        />
      </div>

      <nav
        ref={navRef}
        className={`ac-jump-index${indexHidden ? " is-hidden" : ""}`}
        aria-label="Section index"
        aria-hidden={indexHidden}
      >
        {CHAPTERS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={activeId === c.id ? "is-active" : undefined}
            tabIndex={indexHidden ? -1 : undefined}
          >
            {c.label}
          </a>
        ))}
      </nav>
    </>
  );
}
