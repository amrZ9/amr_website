"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Mail, MapPin, Phone, Linkedin } from "lucide-react";

const CV = {
  name: "AMR AHMED A.AZIZ",
  phone: "+20 (0) 155 126 9903",
  email: "amrz08875@gmail.com",
  linkedinHandle: "amr-ahmed-70468520b",
  linkedinUrl: "https://www.linkedin.com/in/amr-ahmed-70468520b",
  location: "Sheikh Zayed City, Giza, Egypt",
  summary:
    "Growth and marketing professional and MBA holder with a founder's mindset. Currently driving growth strategy and marketing execution across DAZU's Wealth, Business, and Realty lines. Previously launched two ventures: Egy-V, which didn't survive but sharpened how I execute, and BetyChef, a marketplace turning home chefs' skill into a real business, launched on the App Store and Google Play with real orders and collaborations. Background in customer service, retail sales, and team leadership, built on one skill: understanding what people need and building something they'll actually use.",
  languages: ["Arabic: Native", "English: Fluent"],
  coreSkills: [
    "Go-to-market planning",
    "Stakeholder negotiation",
    "Brand & UX direction",
    "Customer segmentation & targeting",
    "Team leadership",
    "Customer-facing communication",
  ],
  tools: [
    "Claude Code",
    "Notion",
    "Lovable",
    "Amadeus / Farelogix (GDS)",
    "Gamma",
    "Canva",
    "Google Analytics",
    "MS Office",
  ],
  education: [
    {
      degree: "MBA | Marketing",
      school: "Arab Academy for Science & Technology",
      date: "Oct 2024 – Oct 2026",
    },
    {
      degree: "Bachelor of Business Administration",
      school: "Helwan University",
      date: "Sept 2017 – Jul 2022",
    },
  ],
  work: [
    {
      role: "Growth & Marketing",
      company: "DAZU (Bright Creations)",
      date: "Sep 2026 – Present",
      tagline:
        "Supporting DAZU's business lines through marketing strategy, growth planning, and execution.",
      bullets: [
        "Develop growth strategies and marketing initiatives across DAZU Wealth, Business, and Realty.",
        "Coordinate with the marketing agency, Media Republic, on brand direction, content planning, campaign execution, and marketing deliverables.",
        "Build growth programs and conversion initiatives to improve acquisition, activation, and customer engagement.",
        "Develop marketing operations, KPI tracking, budgets, and campaign calendars to support measurable growth.",
      ],
    },
    {
      role: "Founder | Product & Growth Lead",
      company: "BetyChef",
      date: "Oct 2025 – Sep 2026",
      tagline:
        "A homemade food delivery marketplace app connecting homemade food chefs directly with customers.",
      bullets: [
        "Ran early-stage validation: 100+ direct conversations with homemade food chefs to confirm demand and define MVP scope before development began.",
        "Owned end-to-end product development; UX, vendor onboarding, customer segmentation, target market and brand identity, while absorbing repeated delays in development support.",
        "Built and launched BetyChef on the Apple App Store and Google Play, independently rebuilding the app using AI tools after development support fell through; went on to drive real orders and collaborations.",
        "Drove early growth on both sides of the marketplace: onboarded 10 chefs (supply-side acquisition) and reached 59 downloads (demand-side acquisition) pre-marketing; validating product-market fit before spending on paid channels.",
        "Negotiated and structured a partnership with a competing platform to consolidate market position, then withdrew when it conflicted with product and brand vision.",
        "Owned top-of-funnel growth strategy: built a multi-channel content plan across Facebook, Instagram, and LinkedIn (12-post launch calendar) to drive awareness and acquisition ahead of go-to-market.",
        "Initiated growth operations: coordinated with Runners Co. to outsource delivery and remove a fulfillment bottleneck, signed a payment gateway partnership with Paymob, and hired a dedicated hire to scale supply-side (chef) acquisition.",
      ],
    },
    {
      role: "Customer Service Agent (Part-Time)",
      company: "Alorica",
      date: "May 2026 – Sep 2026",
      tagline: "Part-time position held alongside building BetyChef.",
      bullets: [
        "Handled inbound customer support calls for the QVC account while maintaining performance metrics.",
      ],
    },
    {
      role: "Founder",
      company: "Egy-V",
      date: "Jul 2025 – Oct 2025",
      tagline:
        "A one-stop platform to discover Egypt's historical sites and book entry tickets online, like a digital gateway to Egypt's heritage.",
      bullets: [
        "Validated market demand and scoped an MVP through independent research, surveys, and site-level data collection to size the opportunity before committing resources.",
        "Registered a company (Anovera) and modeled revenue and cost forecasts to inform the business plan and go-to-market approach.",
        "Commissioned a freelance team to build the platform website and compiled a database of 30+ historical and cultural sites to support MVP launch.",
        "Pursued a B2G partnership with eFinance for ticketing integration under the ministry's digitization initiative; when the required government approvals didn't materialize, concluded the B2G model wasn't viable and made the call to pull the plug.",
      ],
    },
    {
      role: "Customer Service Agent",
      company: "Concentrix",
      date: "Mar 2024 – Jul 2025",
      bullets: [
        "Delivered customer support across three international accounts (Booking.com, HSBC, Expedia) via phone, email, and chat.",
        "Consistently met performance targets, collaborated with team members to provide personalized travel recommendations, and maintained accurate system records.",
        "Demonstrated proficiency in GDS systems (Amadeus, Farelogix), ensuring accurate and efficient travel arrangements.",
      ],
    },
    {
      role: "Sales Assistant",
      company: "Egypt Laptop",
      date: "May 2018 – Oct 2020",
      bullets: [
        "Sold computer hardware in a first professional role, building product knowledge and direct customer communication skills.",
        "Earned Employee of the Month within first 3 months for sales performance.",
        "Personally contributed ~1M EGP in sales, accounting for approximately 15–20% of the branch's overall sales target.",
      ],
    },
  ],
  projects: [
    {
      title: "Mal3ab",
      org: "X Project (Student Activity)",
      date: "Nov 2020 – Aug 2021",
      bullets: [
        "Led a team of 15 as Project Manager, covering product strategy, MVP scoping, BMC, and go-to-market planning to build a business plan for a football-field booking marketplace across Egypt.",
        "Owned product strategy and cross-functional team leadership; a similar concept later aired on Shark Tank, validating the original market insight and an early instinct for product-market fit.",
      ],
    },
    {
      title: "PLASEA",
      org: "Enactus Helwan University (Student Activity)",
      date: "Apr 2021 – Sep 2022",
      bullets: [
        "Contributed to MVP development and early-stage product iteration for a sustainability initiative producing biodegradable plastic bags from seaweed, gaining hands-on exposure to the production process.",
        "Supported marketing strategy and customer segmentation for the initiative, applying early go-to-market thinking to a sustainability-focused product.",
      ],
    },
  ],
  internships: [
    {
      role: "Operations Intern",
      company: "Carrefour (Majid Al Futtaim)",
      date: "Feb 2022",
      bullets: [
        "Learned customer journey management and in-store operations, gaining firsthand insight into retail workflow and service delivery.",
      ],
    },
  ],
  courses: [
    "Google Project Management | Google",
    "Marketing Strategy | Illinois Institute of Technology",
    "Project Management Essentials | IBM",
    "Business Strategy | University of Virginia Darden",
    "Finance & Accounting | The Wharton School",
  ],
};

function buildWordHtml(): string {
  const workHtml = CV.work
    .map(
      (w) => `
      <div style="margin-bottom:12pt;">
        <div style="font-weight:bold;font-size:11pt;color:#111;">${w.role} | <span style="font-weight:normal;font-style:italic;color:#444;">${w.company}</span> <span style="float:right;font-weight:normal;font-size:9.5pt;color:#555;">${w.date}</span></div>
        ${w.tagline ? `<div style="font-style:italic;font-size:9.5pt;color:#444;margin:2pt 0 4pt;">${w.tagline}</div>` : ""}
        <ul style="margin:3pt 0 0 16pt;padding:0;font-size:10pt;line-height:1.45;color:#222;">
          ${w.bullets.map((b) => `<li style="margin-bottom:3pt;">${b}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  const projectsHtml = CV.projects
    .map(
      (p) => `
      <div style="margin-bottom:10pt;">
        <div style="font-weight:bold;font-size:11pt;color:#111;">${p.title} | <span style="font-weight:normal;font-style:italic;color:#444;">${p.org}</span> <span style="float:right;font-weight:normal;font-size:9.5pt;color:#555;">${p.date}</span></div>
        <ul style="margin:3pt 0 0 16pt;padding:0;font-size:10pt;line-height:1.45;color:#222;">
          ${p.bullets.map((b) => `<li style="margin-bottom:3pt;">${b}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  const internshipsHtml = CV.internships
    .map(
      (i) => `
      <div style="margin-bottom:10pt;">
        <div style="font-weight:bold;font-size:11pt;color:#111;">${i.role} | <span style="font-weight:normal;font-style:italic;color:#444;">${i.company}</span> <span style="float:right;font-weight:normal;font-size:9.5pt;color:#555;">${i.date}</span></div>
        <ul style="margin:3pt 0 0 16pt;padding:0;font-size:10pt;line-height:1.45;color:#222;">
          ${i.bullets.map((b) => `<li style="margin-bottom:3pt;">${b}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${CV.name} - CV</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; margin: 32pt; }
    h1 { font-size: 20pt; margin: 0 0 6pt 0; letter-spacing: 0.5pt; }
    h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1pt; color: #1b4332; border-bottom: 1pt solid #1b4332; padding-bottom: 2pt; margin: 14pt 0 8pt 0; }
    .meta { font-size: 9.5pt; color: #444; margin-bottom: 12pt; }
  </style>
</head>
<body>
  <h1>${CV.name}</h1>
  <div class="meta">${CV.phone} · ${CV.email} · linkedin.com/in/${CV.linkedinHandle} · ${CV.location}</div>
  <p style="font-size:10pt;font-style:italic;line-height:1.45;color:#222;">${CV.summary}</p>

  <h2>Education</h2>
  ${CV.education
    .map(
      (e) =>
        `<div style="font-size:10pt;margin-bottom:4pt;"><strong>${e.degree}</strong> | <em>${e.school}</em> <span style="float:right;color:#555;">${e.date}</span></div>`
    )
    .join("")}

  <h2>Work</h2>
  ${workHtml}

  <h2>Projects</h2>
  ${projectsHtml}

  <h2>Internships</h2>
  ${internshipsHtml}

  <h2>Courses</h2>
  <ul style="margin:3pt 0 0 16pt;padding:0;font-size:10pt;line-height:1.45;color:#222;">
    ${CV.courses.map((c) => `<li>${c}</li>`).join("")}
  </ul>

  <h2>Core Skills, Tools &amp; Languages</h2>
  <p style="font-size:10pt;line-height:1.45;"><strong>Core Skills:</strong> ${CV.coreSkills.join(" · ")}</p>
  <p style="font-size:10pt;line-height:1.45;"><strong>Tools:</strong> ${CV.tools.join(" · ")}</p>
  <p style="font-size:10pt;line-height:1.45;"><strong>Languages:</strong> ${CV.languages.join(" · ")}</p>
</body>
</html>`;
}

export default function CvPage() {
  return (
    <main className="cv-page">
      <style>{`
        .cv-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: #f5f5f3;
          padding: 32px 20px 80px;
          font-family: var(--font-space-grotesk), system-ui, sans-serif;
        }
        .cv-toolbar {
          max-width: 940px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cv-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #b5b5b5;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .cv-back:hover {
          color: #ffffff;
        }
        .cv-downloads {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cv-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: #161616;
          color: #f5f5f3;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }
        .cv-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.36);
          background: #222;
        }
        .cv-btn-primary {
          background: #f5f5f3;
          color: #0a0a0a;
          border-color: #f5f5f3;
        }
        .cv-btn-primary:hover {
          background: #e2e2de;
          border-color: #e2e2de;
        }
        .cv-sheet {
          max-width: 940px;
          margin: 0 auto;
          background: #ffffff;
          color: #1c1c1c;
          border-radius: 16px;
          padding: clamp(24px, 4vw, 44px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
        }
        .cv-top-name {
          font-size: clamp(24px, 3.2vw, 32px);
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #141414;
          margin: 0 0 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid #1b4332;
        }
        .cv-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 28px;
          margin-top: 20px;
        }
        @media (max-width: 760px) {
          .cv-grid {
            grid-template-columns: 1fr;
          }
        }
        .cv-sidebar {
          background: #f0f0ea;
          padding: 20px 18px;
          border-radius: 6px;
          font-size: 13px;
          color: #262626;
        }
        .cv-contact-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 26px;
        }
        .cv-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #222;
          text-decoration: none;
          line-height: 1.35;
          word-break: break-word;
        }
        .cv-contact-item:hover {
          text-decoration: underline;
        }
        .cv-side-heading {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1b4332;
          margin: 22px 0 8px;
        }
        .cv-side-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          line-height: 1.4;
        }
        .cv-main-summary {
          font-size: 13.5px;
          font-style: italic;
          line-height: 1.6;
          color: #222;
          margin: 0 0 22px;
        }
        .cv-section {
          margin-bottom: 22px;
        }
        .cv-section:last-child {
          margin-bottom: 0;
        }
        .cv-section-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1b4332;
          border-bottom: 1.5px solid #1b4332;
          padding-bottom: 4px;
          margin: 0 0 12px;
        }
        .cv-edu-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 13.5px;
          margin-bottom: 6px;
        }
        .cv-entry {
          margin-bottom: 16px;
        }
        .cv-entry:last-child {
          margin-bottom: 0;
        }
        .cv-entry-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cv-entry-title {
          font-size: 14px;
          font-weight: 700;
          color: #141414;
          margin: 0;
        }
        .cv-entry-company {
          font-weight: 400;
          font-style: italic;
          color: #444;
        }
        .cv-entry-date {
          font-size: 12px;
          color: #555;
          white-space: nowrap;
        }
        .cv-entry-tagline {
          font-size: 12.5px;
          font-style: italic;
          color: #444;
          margin: 2px 0 6px;
        }
        .cv-bullets {
          margin: 4px 0 0 16px;
          padding: 0;
          font-size: 13px;
          line-height: 1.52;
          color: #222;
        }
        .cv-bullets li {
          margin-bottom: 4px;
        }
        @media print {
          body {
            background: #ffffff !important;
          }
          .cv-page {
            background: #ffffff;
            padding: 0;
          }
          .cv-toolbar {
            display: none !important;
          }
          .cv-sheet {
            box-shadow: none;
            border-radius: 0;
            padding: 0;
            max-width: 100%;
          }
          .cv-sidebar {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="cv-toolbar">
        <Link href="/" className="cv-back">
          <ArrowLeft size={16} />
          Back to portfolio
        </Link>

        <div className="cv-downloads">
          <a
            href="/cv/Amr-Ahmed-CV.pdf"
            download="Amr-Ahmed-CV.pdf"
            className="cv-btn cv-btn-primary"
          >
            <Download size={15} />
            Download PDF
          </a>
          <a
            href="/cv/Amr-Ahmed-CV.docx"
            download="Amr-Ahmed-CV.docx"
            className="cv-btn"
          >
            <FileText size={15} />
            Download Word (.docx)
          </a>
        </div>
      </div>

      <article className="cv-sheet">
        <h1 className="cv-top-name">{CV.name}</h1>

        <div className="cv-grid">
          <aside className="cv-sidebar">
            <div className="cv-contact-list">
              <a
                className="cv-contact-item"
                href={`tel:${CV.phone.replace(/[^+\d]/g, "")}`}
              >
                <Phone size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{CV.phone}</span>
              </a>
              <a className="cv-contact-item" href={`mailto:${CV.email}`}>
                <Mail size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{CV.email}</span>
              </a>
              <a
                className="cv-contact-item"
                href={CV.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{CV.linkedinHandle}</span>
              </a>
              <div className="cv-contact-item">
                <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{CV.location}</span>
              </div>
            </div>

            <h2 className="cv-side-heading">Languages</h2>
            <ul className="cv-side-list">
              {CV.languages.map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>

            <h2 className="cv-side-heading">Core Skills</h2>
            <ul className="cv-side-list">
              {CV.coreSkills.map((skill) => (
                <li key={skill}>– {skill}</li>
              ))}
            </ul>

            <h2 className="cv-side-heading">Tools</h2>
            <ul className="cv-side-list">
              {CV.tools.map((tool) => (
                <li key={tool}>– {tool}</li>
              ))}
            </ul>
          </aside>

          <div>
            <p className="cv-main-summary">{CV.summary}</p>

            <section className="cv-section">
              <h2 className="cv-section-title">Education</h2>
              {CV.education.map((edu) => (
                <div key={edu.degree} className="cv-edu-row">
                  <span>
                    <strong>{edu.degree}</strong> |{" "}
                    <em style={{ color: "#444" }}>{edu.school}</em>
                  </span>
                  <span className="cv-entry-date">{edu.date}</span>
                </div>
              ))}
            </section>

            <section className="cv-section">
              <h2 className="cv-section-title">Work</h2>
              {CV.work.map((item) => (
                <div key={`${item.role}-${item.company}`} className="cv-entry">
                  <div className="cv-entry-head">
                    <h3 className="cv-entry-title">
                      {item.role} |{" "}
                      <span className="cv-entry-company">{item.company}</span>
                    </h3>
                    <span className="cv-entry-date">{item.date}</span>
                  </div>
                  {item.tagline && (
                    <p className="cv-entry-tagline">{item.tagline}</p>
                  )}
                  <ul className="cv-bullets">
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="cv-section">
              <h2 className="cv-section-title">Projects</h2>
              {CV.projects.map((p) => (
                <div key={p.title} className="cv-entry">
                  <div className="cv-entry-head">
                    <h3 className="cv-entry-title">
                      {p.title} |{" "}
                      <span className="cv-entry-company">{p.org}</span>
                    </h3>
                    <span className="cv-entry-date">{p.date}</span>
                  </div>
                  <ul className="cv-bullets">
                    {p.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="cv-section">
              <h2 className="cv-section-title">Internships</h2>
              {CV.internships.map((item) => (
                <div key={item.company} className="cv-entry">
                  <div className="cv-entry-head">
                    <h3 className="cv-entry-title">
                      {item.role} |{" "}
                      <span className="cv-entry-company">{item.company}</span>
                    </h3>
                    <span className="cv-entry-date">{item.date}</span>
                  </div>
                  <ul className="cv-bullets">
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="cv-section">
              <h2 className="cv-section-title">Courses</h2>
              <ul className="cv-bullets">
                {CV.courses.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
