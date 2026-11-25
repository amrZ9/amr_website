"use client";

import React, { useState } from "react";
import { ArrowUpRight, FolderOpen, X } from "lucide-react";
import { profile, ProjectItem } from "@/data/profile";
import { WaveText } from "./WaveText";

export function ProjectsSection() {
  const [activeId, setActiveId] = useState<string | null>(
    profile.projects[0]?.id ?? null
  );

  const activeProject = profile.projects.find((p) => p.id === activeId) ?? null;

  return (
    <section
      id="projects"
      className="projects-section wrap section-pad measure-content"
      data-sc-act="flow"
    >
      <div className="ac-chapter-bar">
        <div className="ac-chapter-bar-inner">
          <span>
            <span className="ac-chapter-index">03</span> / VENTURES &amp; PROJECTS
          </span>
          <span>CASE STUDIES</span>
        </div>
      </div>

      <div data-ac-reveal="out">
      <div className="projects-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
        <h2>
          Featured
          <br />
          Ventures &amp; Projects
        </h2>
        {profile.githubUrl ? (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wave-target"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <WaveText text="GitHub" />
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        ) : (
          profile.socials[0] && (
            <a
              href={profile.socials[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="wave-target"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <WaveText text={profile.socials[0].name} />
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          )
        )}
      </div>

      <p className="projects-intro">{profile.projectsIntro}</p>

      <div className="project-folder-grid">
        {profile.projects.map((project, idx) => {
          const isOpen = activeId === project.id;
          return (
            <button
              key={project.id}
              type="button"
              data-folder-id={project.id}
              data-ac-stagger="out"
              aria-expanded={isOpen}
              onClick={() => setActiveId(isOpen ? null : project.id)}
              className={`project-folder ac-loupe${isOpen ? " is-open" : ""}`}
              style={
                {
                  ["--ac-delay" as string]: `${idx * 75}ms`,
                  ...(project.accent
                    ? { ["--venture-accent" as string]: project.accent }
                    : {}),
                } as React.CSSProperties
              }
            >
              <span className="folder-scene">
                <span className="folder-back" />
                <span className="folder-paper folder-paper-back">
                  <span className="folder-paper-lines" />
                </span>
                <span className="folder-paper folder-paper-preview">
                  <span className="folder-case-preview">
                    <span>{project.folderLabel}</span>
                    <strong>{project.title}</strong>
                  </span>
                </span>
                <span className="folder-paper folder-paper-front" />
                <span className="folder-front">
                  <span className="folder-front-title">{project.title}</span>
                  <span className="folder-open-icon" aria-hidden="true">
                    <FolderOpen size={16} />
                  </span>
                </span>
              </span>
              <span className="folder-caption">
                <span>{project.subtitle}</span>
                <span className="folder-caption-action">
                  {isOpen ? "Close" : project.folderAction}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {activeProject && (
        <div key={activeProject.id} className="project-details-panel ac-panel-unfurl">
          <div
            className="project-panel-toolbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--sc-ink-soft)" }}>
              {activeProject.category}
            </span>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="icon-button"
              aria-label="Close project details"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="project-studies">
            {activeProject.kind === "case-study" ? (
              <CaseStudyView project={activeProject} />
            ) : (
              <ShowcaseView project={activeProject} />
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

function CaseStudyView({ project }: { project: ProjectItem }) {
  return (
    <article className="project-study jaks-case-study">
      <div className="case-study-overview study-content">
        <p className="project-category">{project.category}</p>
        <h3>{project.title}</h3>
        <p className="case-study-summary">{project.summary}</p>
        {project.facts && (
          <dl className="case-study-facts">
            {project.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {project.privacyNote && (
          <p className="case-study-privacy">{project.privacyNote}</p>
        )}
      </div>

      {project.narrative && (
        <div className="case-study-narrative">
          {project.narrative.map((sec) => (
            <section key={sec.title} className="case-study-section">
              <h4>{sec.title}</h4>
              {sec.paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {sec.steps && (
                <ol className="case-study-delivery">
                  {sec.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
              {sec.bullets && (
                <ul>
                  {sec.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}

function ShowcaseView({ project }: { project: ProjectItem }) {
  return (
    <article className={`project-study study-${project.id}`}>
      <div className="study-content">
        <p className="project-category">{project.category}</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>

        {project.stack && (
          <div className="stack-list">
            {project.stack.map((tech) => (
              <span key={tech} className="stack-tag">
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <details className="project-details" open>
            <summary>Project details</summary>
            <ul>
              {project.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </details>
        )}

        {project.architecture && (
          <details className="project-details architecture-disclosure">
            <summary>{project.architecture.title}</summary>
            <div className="architecture-exhibit">
              {project.architecture.nodes.map((node, i) => (
                <div key={i} className="architecture-node">
                  <strong>{node.label}</strong>
                  {node.sublabel && <span>{node.sublabel}</span>}
                </div>
              ))}
              {project.architecture.note && (
                <p className="architecture-note">{project.architecture.note}</p>
              )}
            </div>
          </details>
        )}

        {project.links && project.links.length > 0 && (
          <div className="project-links">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="wave-target"
              >
                <WaveText text={link.label} />
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
      </div>

      {project.image && (
        <figure className={`project-image image-${project.id}`}>
          <img
            src={project.image}
            alt={project.imageAlt ?? project.title}
            loading="lazy"
          />
        </figure>
      )}
    </article>
  );
}
