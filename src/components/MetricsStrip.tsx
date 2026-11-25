"use client";

import React, { useEffect, useRef, useState } from "react";

interface MetricItem {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const METRICS: MetricItem[] = [
  { target: 100, suffix: "+", label: "Chef Validation Interviews" },
  { target: 2, label: "App Stores Launched" },
  { target: 3, label: "DAZU Business Lines" },
  { target: 1, prefix: "~", suffix: "M EGP", label: "Personal Retail Sales" },
];

export function MetricsStrip() {
  const stripRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(METRICS.map(() => 0));
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCounts(METRICS.map((m) => m.target));
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animatedRef.current) return;
        animatedRef.current = true;
        const duration = 1100;
        const start = performance.now();

        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setCounts(
            METRICS.map((m) =>
              p >= 1 ? m.target : Math.max(0, Math.round(m.target * eased))
            )
          );
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stripRef} className="wrap">
      <div className="ac-metrics-strip" aria-label="Key career metrics">
        {METRICS.map((m, idx) => (
          <div
            key={m.label}
            className="ac-metric-cell ac-loupe"
            data-ac-stagger="out"
            style={{ ["--ac-delay" as string]: `${idx * 80}ms` }}
          >
            <span className="ac-metric-value">
              {m.prefix ?? ""}
              {counts[idx]}
              {m.suffix ?? ""}
            </span>
            <span className="ac-metric-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
