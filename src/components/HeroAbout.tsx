"use client";

import React, { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { WaveText } from "./WaveText";
import { OrbitalHeroCanvas } from "./OrbitalHeroCanvas";
import { MetricsStrip } from "./MetricsStrip";
import { trackEvent } from "@/lib/analytics";

function buildCodePreview() {
  const varName =
    profile.shortName.toLowerCase().replace(/[^a-z0-9]/g, "") || "profile";
  const obj = {
    name: profile.fullName,
    role: `${profile.rolePrimary} ${profile.roleSecondary}`.replace(/\.$/, ""),
    focus: profile.skills[0]?.items.slice(0, 3) ?? [],
    experience: profile.experience.slice(0, 2).map((e) => ({
      role: e.title,
      company: e.place,
      since: e.date || e.badge || "Ongoing",
    })),
    projects: Object.fromEntries(
      profile.projects.map((p) => [p.title, p.subtitle])
    ),
    email: profile.email,
  };
  return `const ${varName} = ${JSON.stringify(obj, null, 2)};`;
}

export function HeroAbout() {
  const [line1, line2] = profile.heroTitleLines;
  const codeText = buildCodePreview();

  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Hero intro letter & code-mark animation
  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    if (!hero || !title) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      hero.dataset.heroIntro = "done";
      return;
    }

    hero.dataset.heroIntro = "animating";
    const marks = Array.from(
      title.querySelectorAll<SVGElement>(".hero-code-mark svg")
    );
    const words = Array.from(title.querySelectorAll<HTMLElement>(".hero-word"));

    marks.forEach((svg, i) => {
      svg.animate(
        [
          {
            transform: `rotate(${i === 0 ? -45 : 45}deg) scale(0.96)`,
            opacity: 0,
          },
          { transform: "rotate(0deg) scale(1)", opacity: 1 },
        ],
        {
          duration: 950,
          delay: 60 + i * 80,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        }
      );
    });

    let maxDelay = 0;
    words.forEach((word, wIdx) => {
      const letters = Array.from(
        word.querySelectorAll<HTMLElement>(".hero-letter")
      );
      letters.forEach((letter, lIdx) => {
        const delay = wIdx * 120 + lIdx * 36;
        if (delay > maxDelay) maxDelay = delay;
        letter.animate(
          [
            { transform: "translateY(105%)", opacity: 0 },
            { transform: "translateY(0%)", opacity: 1 },
          ],
          {
            duration: 750,
            delay,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          }
        );
      });
    });

    const timer = window.setTimeout(() => {
      hero.dataset.heroIntro = "done";
    }, maxDelay + 800);

    return () => window.clearTimeout(timer);
  }, []);

  // 2. 3D Portrait scroll journey from Hero -> Biography
  useEffect(() => {
    const about = sectionRef.current;
    const journey = journeyRef.current;
    const card = cardRef.current;
    if (!about || !journey || !card) return;

    const heroLink = about.querySelector<HTMLElement>(".hero-portrait-link");
    const bioPortrait = about.querySelector<HTMLElement>(".bio-portrait");
    const stage = journey.querySelector<HTMLElement>(".portrait-sticky-stage");
    if (!heroLink || !bioPortrait || !stage) return;

    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const mqMobile = window.matchMedia("(max-width: 700px) and (pointer: coarse)");

    let rafId = 0;
    let currentP = 0;
    let targetP = 0;
    let startY = 0;
    let travelY = 1;
    let scaleX = 0.5;
    let scaleY = 0.5;
    let deltaY = 0;
    let deltaX = 0;
    let radiusStart = 9;
    let radiusEnd = 16;
    let lastTime = 0;
    let dead = false;

    const applyTransform = () => {
      const sx = scaleX + (1 - scaleX) * currentP;
      const sy = scaleY + (1 - scaleY) * currentP;
      const smooth = currentP * currentP * (3 - 2 * currentP);
      card.style.transform = `perspective(1200px) translate(${
        deltaX * (1 - currentP)
      }px, ${deltaY * (1 - currentP)}px) scale(${sx}, ${sy}) rotateY(${
        180 * smooth
      }deg)`;
      card.style.borderRadius = `${
        radiusStart + (radiusEnd - radiusStart) * currentP
      }px`;
      card.style.willChange =
        currentP > 0 && currentP < 1 ? "transform" : "auto";
      about.classList.toggle(
        "portrait-motion-active",
        targetP > 0 || currentP > 0
      );
    };

    const tick = (now: number) => {
      if (dead) return;
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.67;
      lastTime = now;
      currentP +=
        (targetP - currentP) *
        (1 - Math.exp(-dt / (mqMobile.matches ? 100 : 65)));
      const settled = Math.abs(targetP - currentP) < 1e-4;
      if (settled) currentP = targetP;
      applyTransform();
      if (settled) {
        rafId = 0;
        lastTime = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      if (!mqMotion.matches) return;
      targetP = Math.max(0, Math.min(1, (window.scrollY - startY) / travelY));
      about.classList.toggle(
        "portrait-motion-active",
        targetP > 0 || currentP > 0
      );
      if (!rafId && targetP !== currentP) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const measure = () => {
      if (dead) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
      if (!mqMotion.matches) {
        about.classList.remove("portrait-motion-ready", "portrait-motion-active");
        return;
      }
      about.classList.add("portrait-motion-ready");
      const aboutRect = about.getBoundingClientRect();
      const heroRect = heroLink.getBoundingClientRect();
      const bioRect = bioPortrait.getBoundingClientRect();
      const vh = mqMobile.matches
        ? stage.getBoundingClientRect().height
        : document.documentElement.clientHeight;
      const topOffset = vh - 20 - bioRect.height;

      startY = aboutRect.top + window.scrollY;
      travelY = bioRect.top + window.scrollY - startY - topOffset;

      if (travelY <= 0 || !bioRect.width) {
        about.classList.remove("portrait-motion-ready", "portrait-motion-active");
        return;
      }

      scaleX = heroRect.width / bioRect.width;
      scaleY = heroRect.height / bioRect.height;
      deltaY =
        heroRect.top +
        window.scrollY -
        startY -
        topOffset -
        (bioRect.height - heroRect.height) / 2;
      deltaX =
        heroRect.left +
        heroRect.width / 2 -
        (bioRect.left + bioRect.width / 2);
      radiusStart =
        parseFloat(getComputedStyle(heroLink).borderTopLeftRadius) /
          Math.min(scaleX, scaleY) || 9;
      radiusEnd =
        parseFloat(getComputedStyle(bioPortrait).borderTopLeftRadius) || 16;

      journey.style.height = `${travelY + vh}px`;
      card.style.width = `${bioRect.width}px`;
      card.style.height = `${bioRect.height}px`;
      card.style.left = `${bioRect.left - aboutRect.left}px`;
      card.style.top = `${topOffset}px`;

      currentP = targetP = Math.max(
        0,
        Math.min(1, (window.scrollY - startY) / travelY)
      );
      about.classList.toggle("portrait-motion-active", targetP > 0);
      applyTransform();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(heroLink);
    ro.observe(bioPortrait);

    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (mqMobile.matches && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", measure);
    mqMotion.addEventListener("change", measure);

    measure();
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    return () => {
      dead = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", measure);
      mqMotion.removeEventListener("change", measure);
      about.classList.remove("portrait-motion-ready", "portrait-motion-active");
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="about-section">
      <div ref={journeyRef} className="portrait-journey" aria-hidden="true">
        <div className="portrait-sticky-stage">
          <div ref={cardRef} className="portrait-card">
            <div className="portrait-face portrait-face-front">
              <img
                alt=""
                width={1280}
                height={1280}
                decoding="async"
                src={profile.portraitImage}
              />
            </div>
            <div className="portrait-face portrait-face-back">
              <img
                alt=""
                width={1280}
                height={1280}
                decoding="async"
                src={profile.portraitImage}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={heroRef}
        className="hero wrap"
        data-sc-act="flow"
        data-hero-intro="pending"
      >
        <OrbitalHeroCanvas />

        <a
          href="#biography"
          className="hero-portrait-link"
          aria-label={`About ${profile.fullName}`}
        >
          <img
            alt={`${profile.fullName} portrait`}
            width={1280}
            height={1280}
            decoding="async"
            src={profile.portraitImage}
          />
        </a>

        <div className="hero-heading-composition ac-hero-halo">
          <h1
            ref={titleRef}
            className="hero-title hero-display-title"
            aria-label={`${line1} ${line2}`}
          >
            <span className="title-line" aria-hidden="true">
              <span className="hero-word">
                <span className="hero-code-open hero-code-mark" aria-hidden="true">
                  <svg
                    viewBox="20 0 110 160"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    focusable="false"
                  >
                    <path
                      className="hero-code-depth"
                      opacity=".16"
                      d="M105 30 48 80 105 130"
                      transform="translate(5 6)"
                    />
                    <path d="M105 30 48 80 105 130" />
                  </svg>
                </span>
                {line1.split("").map((ch, idx) => (
                  <span key={`l1-${idx}`} className="hero-letter-window">
                    <span className="hero-letter">{ch}</span>
                  </span>
                ))}
              </span>
            </span>

            <span className="title-line" aria-hidden="true">
              <span className="hero-word">
                <span className="hero-code-close hero-code-mark" aria-hidden="true">
                  <svg
                    viewBox="0 0 180 160"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    focusable="false"
                  >
                    <path
                      className="hero-code-depth"
                      opacity=".16"
                      d="M65 30 25 130M100 30 157 80 100 130"
                      transform="translate(5 6)"
                    />
                    <path d="M65 30 25 130M100 30 157 80 100 130" />
                  </svg>
                </span>
                {line2.split("").map((ch, idx) => (
                  <span key={`l2-${idx}`} className="hero-letter-window">
                    <span className="hero-letter">{ch}</span>
                  </span>
                ))}
              </span>
            </span>
          </h1>
        </div>

        <div className="hero-footer">
          <span className="hero-year">{profile.heroYear}</span>
          <span className="hero-focus">
            <span className="terminal-text">
              <span aria-hidden="true">{"{{ "}</span>
              <span>{profile.heroFocusTag}</span>
              <span className="terminal-caret" aria-hidden="true" />
              <span aria-hidden="true">{" }}"}</span>
            </span>
          </span>
        </div>
      </div>

      <div className="ac-chapter-bar">
        <div className="wrap ac-chapter-bar-inner">
          <span>
            <span className="ac-chapter-index">01</span> / BIOGRAPHY
          </span>
          <span>FOUNDER &amp; GROWTH</span>
        </div>
      </div>

      <div
        id="biography"
        className="biography wrap measure-content"
        data-sc-act="flow"
        data-ac-reveal="out"
      >
        <div className="bio-introduction">
          <h2>
            Hi, I&apos;m
            <br /> {profile.shortName}.
          </h2>
          <p className="bio-role">
            {profile.rolePrimary} <span>{profile.roleSecondary}</span>
          </p>
          <div className="bio-current">
            <span>{profile.currentRole.label}</span>
            <p>
              <strong>{profile.currentRole.company}</strong>
              <br />
              {profile.currentRole.title}
              <br />
              <span>{profile.currentRole.location}</span>
            </p>
          </div>
        </div>

        <figure className="bio-portrait">
          <img
            alt={`Portrait of ${profile.fullName}`}
            loading="lazy"
            width={1280}
            height={1280}
            decoding="async"
            src={profile.portraitImage}
          />
        </figure>

        <div className="bio-description">
          <p className="bio-lead">
            {profile.bioLead.prefix}
            <strong>{profile.bioLead.highlight1}</strong>
            {profile.bioLead.middle}
            <strong>{profile.bioLead.highlight2}</strong>
            {profile.bioLead.suffix}
          </p>
          <div className="bio-actions">
            <a
              className="bio-projects wave-target"
              href="#projects"
              onClick={() =>
                trackEvent("cta_click", {
                  cta_name: "explore_projects",
                  location: "biography",
                })
              }
            >
              <WaveText text="Explore projects" />
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <MetricsStrip />
    </section>
  );
}
