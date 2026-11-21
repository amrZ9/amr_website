"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root: HTMLElement) => {
        layout: () => void;
        destroy: () => void;
      };
    };
  }
}

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ScrollCraft) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!scriptReady || !rootRef.current || !window.ScrollCraft) return;
    const instance = window.ScrollCraft.mount(rootRef.current);
    const ro = new ResizeObserver(() => instance.layout());
    rootRef.current
      .querySelectorAll(".measure-content")
      .forEach((el) => ro.observe(el));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => instance.layout();
    mq.addEventListener("change", onChange);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
      instance.destroy();
    };
  }, [scriptReady]);

  return (
    <div ref={rootRef} className="portfolio">
      <Script
        src="/scrollcraft/scrollcraft.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      {children}
    </div>
  );
}
