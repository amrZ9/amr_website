"use client";

import React, { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "biography", label: "01 BIOGRAPHY" },
  { id: "skills", label: "02 CAPABILITIES" },
  { id: "projects", label: "03 VENTURES" },
  { id: "experience", label: "04 EXPERIENCE" },
  { id: "contact", label: "05 CONTACT" },
];

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);

export function ScrollRuler() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("biography");

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

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
      window.removeEventListener("scroll", onScroll);
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

      <nav className="ac-jump-index" aria-label="Section index">
        {CHAPTERS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={activeId === c.id ? "is-active" : undefined}
          >
            {c.label}
          </a>
        ))}
      </nav>
    </>
  );
}
