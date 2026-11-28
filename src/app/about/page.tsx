import React from "react";
import type { Metadata } from "next";
import { SubPageShell } from "@/components/SubPageShell";
import { HeroAbout } from "@/components/HeroAbout";

export const metadata: Metadata = {
  title: "About | Amr Ahmed",
  description:
    "Biography, background, and founder story of Amr Ahmed A.Aziz — Growth & Marketing Strategist.",
};

export default function AboutPage() {
  return (
    <SubPageShell flushTop>
      <HeroAbout />
    </SubPageShell>
  );
}
