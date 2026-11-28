export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-S009FFTKK9";

export type GAEventName =
  | "section_view"
  | "cta_click"
  | "project_open"
  | "project_link_click"
  | "contact_form_submit"
  | "email_copy"
  | "email_click"
  | "social_click";

export type GAEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: GAEventName, params?: GAEventParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params);
}
