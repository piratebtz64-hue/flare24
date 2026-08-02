/** Web Notification helpers (base for push mobile later). */

export type NotificationPermissionState =
  | "unsupported"
  | "denied"
  | "default"
  | "granted";

export function getNotificationSupport(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result as NotificationPermissionState;
}

/** Local test notification (no server push yet). */
export function sendTestNotification(
  title = "Flare24",
  body = "Notifications activées. Tu seras alerté des nouveaux messages."
): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      tag: "flare24-test",
      silent: false,
    });
    return true;
  } catch {
    return false;
  }
}

export function notifyNewMessage(fromLabel: string, preview: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(`Message · ${fromLabel}`, {
      body: preview.slice(0, 120),
      tag: "flare24-msg",
    });
  } catch {
    // ignore
  }
}
