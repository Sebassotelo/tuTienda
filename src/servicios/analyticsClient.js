const DEFAULT_THROTTLE_MS = 60 * 60 * 1000;

function getStorageValue(key) {
  if (typeof window === "undefined") return 0;

  return Number(window.localStorage.getItem(key) || 0);
}

function setStorageValue(key, value) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, String(value));
}

export function shouldTrack(key, throttleMs = DEFAULT_THROTTLE_MS) {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const lastTrackedAt = getStorageValue(key);

  if (lastTrackedAt && now - lastTrackedAt < throttleMs) {
    return false;
  }

  setStorageValue(key, now);
  return true;
}

export async function trackAccountEvent({
  user,
  type,
  metadata = {},
  throttleKey = "",
  throttleMs = DEFAULT_THROTTLE_MS,
}) {
  if (!user || !type || typeof window === "undefined") return;

  const storageKey = `mystore:analytics:${type}:${throttleKey || user.email || user.uid || "user"}`;

  if (!shouldTrack(storageKey, throttleMs)) return;

  try {
    const token = await user.getIdToken();

    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, metadata }),
    });

    if (!response.ok) {
      setStorageValue(storageKey, 0);
    }
  } catch (error) {
    setStorageValue(storageKey, 0);
  }
}

