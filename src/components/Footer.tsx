"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { profile } from "@/data/profile";
import { WaveText } from "./WaveText";
import { CrowdScene } from "./CrowdScene";

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/amr-z9/",
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M6.9 8.5a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zM5.3 10h3.2v9.5H5.3V10zm5.2 0h3.1v1.3h.1c.4-.8 1.5-1.6 3.1-1.6 3.3 0 3.9 2.2 3.9 5v4.8h-3.2v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3h-3.2V10z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/201551269903",
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm5.2 12.7c-.2.6-1.3 1.2-1.8 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3 0-1.5.8-2.2 1-2.5.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5.3.6.9 2.1 1 2.3.1.2.1.4 0 .6-.1.2-.2.4-.3.5-.2.2-.3.4-.5.5-.2.2-.3.3-.1.6.2.3.8 1.3 1.8 2.1 1.2 1.1 2.2 1.4 2.6 1.6.3.1.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.4-.3.7-.2.3.1 1.9.9 2.2 1.1.3.2.5.2.6.4.1.2.1.8-.1 1.4z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/amr_be9",
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M21.2 4.6 3.5 11.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 10.5-6.6c.5-.3.9-.1.6.2l-8.5 7.7-.3 4.6c.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.3-.5-1.9-1.7-1.1z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/Amr_z9",
    svg: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M18.2 3h3.2l-7 8 8.2 10h-6.4l-5-6.6L5.5 21H2.3l7.5-8.6L1.9 3h6.6l4.5 6 5.2-6zm-1.1 16.2h1.8L7.4 4.7H5.5l11.6 14.5z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/amr_z9/",
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/amr.ahmed.774595/",
    svg: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.1H7.7v3h2.5V21h3.3z" />
      </svg>
    ),
  },
];

export function Footer() {
  const navItems = [
    { label: "About", href: "/about" },
    { label: "Skills", href: "/skills" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top wrap">
        <div className="footer-identity">
          <h2>{profile.shortName}.</h2>
          <div className="footer-direct-contact">
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>
                <span aria-hidden="true">📞</span>
                <span>{profile.phone}</span>
              </a>
            )}
            <a href={`mailto:${profile.email}`}>
              <span aria-hidden="true">✉️</span>
              <span>{profile.email}</span>
            </a>
          </div>
          <div className="footer-socials" aria-label="Social links">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={item.name}
                title={item.name}
              >
                {item.svg}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-top-spacer" aria-hidden="true" />

        <nav aria-label="Footer navigation" className="footer-explore">
          <p>Explore</p>
          <div className="footer-explore-links">
            {navItems.map((item) => (
              <a key={item.href} className="wave-target" href={item.href}>
                <WaveText text={item.label} />
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="footer-finale">
        <div className="footer-finale-heading wrap footer-finale-custom">
          <a href="#" className="footer-back-top">
            Back to top <ArrowUp size={16} aria-hidden="true" />
          </a>
          <p className="footer-see-you">{profile.footer.finaleHeading}</p>
          <span className="footer-legal">
            © {profile.footer.copyrightYear} {profile.fullName} ·{" "}
            <Link href="/privacy">Privacy</Link>
          </span>
        </div>

        <CrowdScene descId="footer-crowd-desc" />

        <div className="footer-scene-bottom wrap">
          <small>{profile.footer.crowdCaption}</small>
        </div>
      </div>
    </footer>
  );
}
