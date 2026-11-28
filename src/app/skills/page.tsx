import React from "react";
import type { Metadata } from "next";
import { SubPageShell } from "@/components/SubPageShell";
import { SkillsSection } from "@/components/SkillsSection";

export const metadata: Metadata = {
  title: "Skills | Amr Ahmed",
  description:
    "Core growth, marketing, product capabilities, tools, and executive education of Amr Ahmed A.Aziz.",
};

export default function SkillsPage() {
  return (
    <SubPageShell>
      <SkillsSection />
    </SubPageShell>
  );
}
