import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioShell } from "./PortfolioShell";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SubPageShell({
  children,
  flushTop = false,
}: {
  children: React.ReactNode;
  flushTop?: boolean;
}) {
  return (
    <PortfolioShell>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" style={flushTop ? undefined : { paddingTop: "108px" }}>
        {!flushTop && (
          <div className="wrap" style={{ marginBottom: "8px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "var(--sc-ink-soft)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>Back to home</span>
            </Link>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </PortfolioShell>
  );
}
