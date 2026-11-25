"use client";

import React, { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

export function ExperienceSection() {
  const [sub1, sub2] = profile.experienceSubheading.split("\n");
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [road, setRoad] = useState({ d: "", width: 1, height: 1 });

  useEffect(() => {
    const el = roadmapRef.current;
    if (!el) return;
    let dead = false;

    const measure = () => {
      if (dead) return;
      const rect = el.getBoundingClientRect();
      const markers = Array.from(
        el.querySelectorAll<HTMLElement>(".journey-stop-marker")
      ).map((m) => {
        const mr = m.getBoundingClientRect();
        return {
          x: mr.left - rect.left + mr.width / 2,
          y: mr.top - rect.top + mr.height / 2,
        };
      });

      if (markers.length < 2) return;
      const isMobile = window.matchMedia("(max-width: 1000px)").matches;
      let d = `M ${markers[0].x} ${markers[0].y}`;
      for (let i = 1; i < markers.length; i++) {
        const prev = markers[i - 1];
        const curr = markers[i];
        if (isMobile) {
          const midY = (prev.y + curr.y) / 2;
          d += ` C ${prev.x + 28} ${midY}, ${curr.x - 20} ${midY}, ${curr.x} ${curr.y}`;
        } else {
          const midX = (prev.x + curr.x) / 2;
          d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
      }
      setRoad({ d, width: rect.width || 1, height: rect.height || 1 });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll(".journey-stop").forEach((stop) => ro.observe(stop));

    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.drawn = String(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    measure();
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    return () => {
      dead = true;
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section
      id="experience"
      className="experience-section section-pad"
      data-sc-act="flow"
    >
      <div className="ac-chapter-bar">
        <div className="wrap ac-chapter-bar-inner">
          <span>
            <span className="ac-chapter-index">04</span> / EXPERIENCE
          </span>
          <span>CAREER ROADMAP</span>
        </div>
      </div>

      <div className="wrap" data-ac-reveal="out">
        <div className="experience-heading">
          <h2>{profile.experienceHeading}</h2>
          <p>
            {sub1}
            {sub2 && (
              <>
                <br /> {sub2}
              </>
            )}
          </p>
        </div>

        <div ref={roadmapRef} className="journey-roadmap">
          <svg
            className="journey-road"
            viewBox={`0 0 ${road.width} ${road.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="journey-road-base" d={road.d} />
            <path className="journey-road-ink" d={road.d} pathLength={1} />
          </svg>

          {profile.experience.map((item, idx) => (
            <article
              key={item.id}
              className={`journey-stop ${item.variant}`}
              aria-labelledby={`${item.id}-title`}
              data-ac-stagger="out"
              style={{ ["--ac-delay" as string]: `${idx * 100}ms` }}
            >
              <span className="journey-stop-marker" aria-hidden="true">
                <span />
              </span>
              <div className="journey-stop-content">
                <p className="journey-date">
                  {item.badge && (
                    <span className="journey-current">{item.badge}</span>
                  )}
                  {item.date}
                </p>
                <h3 id={`${item.id}-title`}>{item.title}</h3>
                <p className="journey-place">
                  {item.place}{" "}
                  {item.location && <span>{item.location}</span>}
                </p>
                <p className="journey-description">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
