import { track } from "@vercel/analytics";

/**
 * Unified product analytics.
 * - Always: Vercel Analytics (if enabled on project)
 * - Optional: Mixpanel  → NEXT_PUBLIC_MIXPANEL_TOKEN
 * - Optional: Amplitude → NEXT_PUBLIC_AMPLITUDE_API_KEY
 *
 * Prefer ONE of Mixpanel or Amplitude + Vercel. Avoid all three long-term.
 */

export type FlareEvent =
  | "signup_started"
  | "login_success"
  | "forgot_password"
  | "flare_created"
  | "flare_respond"
  | "message_sent"
  | "filter_used"
  | "gold_pricing_view"
  | "checkout_click"
  | "notifications_enabled"
  | "report_or_block"
  | "logout";

type Props = Record<string, string | number | boolean | null | undefined>;

function cleanProps(data?: Props): Record<string, string | number | boolean> {
  if (!data) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function sendMixpanel(name: string, props: Record<string, string | number | boolean>) {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || typeof window === "undefined") return;

  const payload = [
    {
      event: name,
      properties: {
        token,
        distinct_id: getDistinctId(),
        time: Date.now(),
        ...props,
      },
    },
  ];

  const body = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  // fire-and-forget
  void fetch(`https://api-eu.mixpanel.com/track?data=${body}`, {
    method: "GET",
    mode: "no-cors",
    keepalive: true,
  }).catch(() => undefined);
}

function sendAmplitude(name: string, props: Record<string, string | number | boolean>) {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey || typeof window === "undefined") return;

  void fetch("https://api.eu.amplitude.com/2/httpapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      events: [
        {
          user_id: getDistinctId(),
          event_type: name,
          event_properties: props,
          time: Date.now(),
        },
      ],
    }),
    keepalive: true,
  }).catch(() => undefined);
}

function getDistinctId(): string {
  try {
    const key = "flare24_aid";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `f24_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function trackEvent(name: FlareEvent, data?: Props) {
  const props = cleanProps(data);
  try {
    track(name, props);
  } catch {
    // never break UX
  }
  try {
    sendMixpanel(name, props);
    sendAmplitude(name, props);
  } catch {
    // never break UX
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

export function trackForgotPassword() {
  trackEvent("forgot_password");
}

export function trackGoldView() {
  trackEvent("gold_pricing_view");
}

export function trackCheckoutClick() {
  trackEvent("checkout_click", { plan: "gold_monthly" });
}

export function trackNotificationsEnabled() {
  trackEvent("notifications_enabled");
}

export function trackReportOrBlock(action: "report" | "block") {
  trackEvent("report_or_block", { action });
}

export function trackLogout() {
  trackEvent("logout");
}
