"use client";

import React, { useEffect, useState } from "react";

export function Preloader() {
  const [phase, setPhase] = useState<"dim" | "bright" | "done">("dim");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("done");
      return;
    }

    const t1 = window.setTimeout(() => setPhase("bright"), 240);
    const t2 = window.setTimeout(() => setPhase("done"), 820);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className={`ac-preloader${phase === "bright" ? " is-bright" : ""}${
        phase === "done" ? " is-done" : ""
      }`}
      aria-hidden="true"
    >
      <div className="ac-preloader-inner">
        <span className="ac-preloader-mark">AMR</span>
        <span className="ac-preloader-cursor" />
      </div>
    </div>
  );
}
