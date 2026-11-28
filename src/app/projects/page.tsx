import React from "react";
import type { Metadata } from "next";
import { SubPageShell } from "@/components/SubPageShell";
import { ProjectsSection } from "@/components/ProjectsSection";

export const metadata: Metadata = {
  title: "Projects | Amr Ahmed",
  description:
    "Featured ventures, growth case studies, and product builds by Amr Ahmed A.Aziz.",
};

export default function ProjectsPage() {
  return (
    <SubPageShell>
      <ProjectsSection />
    </SubPageShell>
  );
}
