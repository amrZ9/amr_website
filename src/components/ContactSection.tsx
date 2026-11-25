"use client";

import React, { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { profile } from "@/data/profile";
import { WaveText } from "./WaveText";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Portfolio Inquiry from ${name || "Visitor"}`
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${senderEmail}\n\n${message}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="contact-section section-pad"
      data-sc-act="flow"
    >
      <div className="ac-chapter-bar">
        <div className="wrap ac-chapter-bar-inner">
          <span>
            <span className="ac-chapter-index">05</span> / CONTACT
          </span>
          <span>GET IN TOUCH</span>
        </div>
      </div>

      <div className="wrap" data-ac-reveal="out">
        <div className="contact-layout">
          <div className="contact-opening">
            <h2>{profile.contactHeading}</h2>
            <p>{profile.contactSubheading}</p>

            <div className="contact-details">
              <div className="email-block">
                <a
                  className="email-link wave-target"
                  href={`mailto:${profile.email}`}
                >
                  <WaveText text={profile.email} />
                  <ArrowUpRight size={20} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy email address"
                  className="wave-target icon-button copy-email"
                >
                  <span
                    className="wave-icon"
                    aria-hidden="true"
                    style={{ ["--wave-icon-size" as string]: "20px" }}
                  >
                    <span className="wave-icon-track">
                      <span>{copied ? <Check size={18} /> : <Copy size={18} />}</span>
                      <span>{copied ? <Check size={18} /> : <Copy size={18} />}</span>
                    </span>
                  </span>
                </button>
              </div>
              <span className="copy-status" role="status">
                {copied ? "Copied to clipboard" : ""}
              </span>
              {(profile.phone || profile.location) && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    color: "var(--sc-ink-soft)",
                  }}
                >
                  {profile.phone}
                  {profile.phone && profile.location ? " · " : ""}
                  {profile.location}
                </p>
              )}
            </div>

            <div className="social-links">
              {profile.socials.map((s) => (
                <a
                  key={s.name}
                  className="wave-target"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WaveText text={s.name} />
                </a>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field">
              <label htmlFor="inquiry-name">Your name</label>
              <input
                id="inquiry-name"
                placeholder="What should I call you?"
                autoComplete="name"
                required
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="contact-field">
              <label htmlFor="inquiry-email">Email address</label>
              <input
                id="inquiry-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                name="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
            <div className="contact-field contact-message">
              <label htmlFor="inquiry-project">What do you have in mind?</label>
              <textarea
                id="inquiry-project"
                name="project"
                placeholder="A little about your opportunity or project…"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="contact-submit">
              <button className="button draft-button wave-target" type="submit">
                <WaveText text="Create email draft" />
                <ArrowUpRight size={22} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
