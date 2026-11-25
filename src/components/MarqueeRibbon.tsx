"use client";

import React from "react";

const ITEMS = [
  "GROWTH STRATEGY",
  "BETYCHEF",
  "DAZU (BRIGHT CREATIONS)",
  "EGY-V",
  "MBA MARKETING",
  "GO-TO-MARKET",
  "PRODUCT & BRAND",
  "FOUNDER",
];

export function MarqueeRibbon() {
  return (
    <div className="ac-marquee" aria-hidden="true">
      <div className="ac-marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="ac-marquee-group">
            {ITEMS.map((item) => (
              <span key={`${dup}-${item}`} className="ac-marquee-item">
                {item}
                <span className="ac-marquee-dot">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
