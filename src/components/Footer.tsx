"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { WaveText } from "./WaveText";
import { CrowdScene } from "./CrowdScene";

export function Footer() {
  const navItems = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top wrap">
        <div className="footer-identity">
          <h2>{profile.shortName}.</h2>
          <p>
            {profile.rolePrimary}
            <br />
            {profile.roleSecondary}
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <p>Explore</p>
          <div>
            {navItems.map((item) => (
              <a key={item.href} className="wave-target" href={item.href}>
                <WaveText text={item.label} />
              </a>
            ))}
          </div>
        </nav>

        <div className="footer-contact">
          <p>Get in touch</p>
          <a className="wave-target" href={`mailto:${profile.email}`}>
            <WaveText text={profile.email} />
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <span>
            © {profile.footer.copyrightYear} {profile.fullName} ·{" "}
            <Link href="/privacy">Privacy</Link>
          </span>
        </div>
      </div>

      <div className="footer-finale">
        <div className="footer-finale-heading wrap">
          <p>{profile.footer.finaleHeading}</p>
          <a href="#">
            Back to top <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>

        <CrowdScene descId="footer-crowd-desc" />

        <div className="footer-scene-bottom wrap">
          <small>{profile.footer.crowdCaption}</small>
        </div>
      </div>
    </footer>
  );
}
