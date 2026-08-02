import { track } from "@vercel/analytics";

/** Custom events tracked in Vercel Analytics dashboard. */
export type FlareEvent =
  | "signup_started"
  | "login_success"
  | "flare_created"
  | "flare_respond"
  | "message_sent"
  | "filter_used"
  | "gold_pricing_view"
  | "notifications_enabled"
  | "report_or_block";

export function trackEvent(
  name: FlareEvent,
  data?: Record<string, string | number | boolean | null>
) {
  try {
    track(name, data);
  } catch {
    // Analytics must never break the app
  }
}

export function trackFlareCreated(city: string, duration: string) {
  trackEvent("flare_created", { city, duration });
}

export function trackFlareRespond(city: string) {
  trackEvent("flare_respond", { city });
}

export function trackFilter(filter: string) {
  trackEvent("filter_used", { filter });
}

export function trackMessageSent() {
  trackEvent("message_sent");
}

export function trackLoginSuccess(method: "password" | "magic") {
  trackEvent("login_success", { method });
}

export function trackSignupStarted() {
  trackEvent("signup_started");
}

export function trackGoldView() {
  trackEvent("gold_pricing_view");
}

export function trackNotificationsEnabled() {
  trackEvent("notifications_enabled");
}

export function trackReportOrBlock(action: "report" | "block") {
  trackEvent("report_or_block", { action });
}
