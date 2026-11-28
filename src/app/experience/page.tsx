import React from "react";
import type { Metadata } from "next";
import { SubPageShell } from "@/components/SubPageShell";
import { ExperienceSection } from "@/components/ExperienceSection";

export const metadata: Metadata = {
  title: "Experience | Amr Ahmed",
  description:
    "Career roadmap and leadership experience of Amr Ahmed A.Aziz across DAZU, BetyChef, Egy-V, and more.",
};

export default function ExperiencePage() {
  return (
    <SubPageShell>
      <ExperienceSection />
    </SubPageShell>
  );
}
