import React from "react";
import Link from "next/link";
import { profile } from "@/data/profile";

export default function PrivacyPage() {
  return (
    <main className="F9D64a_privacy">
      <h1>Privacy</h1>
      <p>
        This personal portfolio and biography website for {profile.fullName}{" "}
        uses Google Analytics 4 to understand aggregated traffic and site
        interactions. It does not sell personal data.
      </p>
      <p>
        If you reach out via email ({profile.email}), your message is used
        solely to respond to your inquiry.
      </p>
      <p>
        <Link href="/">← Back to home</Link>
      </p>
    </main>
  );
}
