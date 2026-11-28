import React from "react";
import { profile } from "@/data/profile";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="skills-section section-pad"
      data-sc-act="flow"
    >
      <div className="wrap" data-ac-reveal="out">
        <div className="skills-heading">
          <h2>{profile.skillsHeading}</h2>
          <p>
            {profile.skillsSubheading.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="skills-specimens">
          {profile.skills.map((group, idx) => (
            <article
              key={group.id}
              className="skills-specimen ac-loupe"
              aria-labelledby={group.id}
              data-ac-stagger="out"
              style={{ ["--ac-delay" as string]: `${idx * 90}ms` }}
            >
              <h3 id={group.id}>{group.title}</h3>
              <p className="skills-specimen-note">{group.note}</p>
              <ul className="skills-type-mosaic">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
