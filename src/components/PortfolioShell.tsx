"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Preloader } from "./Preloader";
import { ScrollRuler } from "./ScrollRuler";
import { trackEvent } from "@/lib/analytics";

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root: HTMLElement) => {
        layout: () => void;
        destroy: () => void;
      };
    };
  }
}

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ScrollCraft) {
      setScriptReady(true);
    }
  }, []);

  // ScrollCraft mount
  useEffect(() => {
    if (!scriptReady || !rootRef.current || !window.ScrollCraft) return;
    const instance = window.ScrollCraft.mount(rootRef.current);
    const ro = new ResizeObserver(() => instance.layout());
    rootRef.current
      .querySelectorAll(".measure-content")
      .forEach((el) => ro.observe(el));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => instance.layout();
    mq.addEventListener("change", onChange);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
      instance.destroy();
    };
  }, [scriptReady]);

  // ArtCraft optical rack-focus + stagger reveal observer + darkroom loupe
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveals = Array.from(
      root.querySelectorAll<HTMLElement>("[data-ac-reveal]")
    );
    const staggers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-ac-stagger]")
    );

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      reveals.forEach((el) => (el.dataset.acReveal = "in"));
      staggers.forEach((el) => (el.dataset.acStagger = "in"));
      return;
    }

    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          el.dataset.acReveal = entry.isIntersecting ? "in" : "out";
        });
      },
      { rootMargin: "-6% 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => revealIo.observe(el));

    const staggerIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.dataset.acStagger = "in";
            staggerIo.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    staggers.forEach((el) => staggerIo.observe(el));

    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        ".ac-loupe"
      );
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--loupe-x", `${e.clientX - rect.left}px`);
      target.style.setProperty("--loupe-y", `${e.clientY - rect.top}px`);
    };
    root.addEventListener("pointermove", onPointerMove, { passive: true });

    // Top scroll progress bar + scroll-scrubbed heading parallax
    let scrollRaf = 0;
    const parallaxHeadings = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".skills-heading h2, .projects-header h2, .experience-heading h2, .contact-opening h2"
      )
    );
    const updateScrollFx = () => {
      scrollRaf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      root.style.setProperty("--scroll-progress", String(p));

      const vh = window.innerHeight || 1;
      parallaxHeadings.forEach((h, i) => {
        const rect = h.getBoundingClientRect();
        const center = (rect.top + rect.height / 2 - vh / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, center));
        const dir = i % 2 === 0 ? 1 : -1;
        h.style.transform = `translate3d(${(clamped * 28 * dir).toFixed(1)}px, 0, 0)`;
      });
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollFx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollFx();

    // Interactive 3D tilt on capability cards & project folders + magnetic buttons
    const tiltEls = Array.from(
      root.querySelectorAll<HTMLElement>(".skills-specimen, .project-folder")
    );
    const cleanups: Array<() => void> = [];

    tiltEls.forEach((el) => {
      el.classList.add("ac-tilt");
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(nx * 10).toFixed(2)}deg) translateY(-4px)`;
      };
      const onLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    });

    const magEls = Array.from(
      root.querySelectorAll<HTMLElement>(".bio-projects, .draft-button")
    );
    magEls.forEach((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      };
      const onLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => {
      revealIo.disconnect();
      staggerIo.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  // GA4 funnel: track each major chapter once when it enters the viewport
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sectionIds = ["biography", "experience", "projects", "skills", "contact"];
    const sections = sectionIds
      .map((id) => root.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const seen = new Set<string>();
    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).id;
          if (!id || seen.has(id)) return;
          seen.add(id);
          trackEvent("section_view", { section_id: id });
          sectionIo.unobserve(entry.target);
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((el) => sectionIo.observe(el));
    return () => sectionIo.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="portfolio">
      <div className="ac-progress-bar" aria-hidden="true" />
      <Preloader />
      <ScrollRuler />
      <Script
        src="/scrollcraft/scrollcraft.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      {children}
    </div>
  );
}
