export type AuthSessionScope = "admin" | "public";
export type AuthSessionEventType = "login" | "logout" | "refresh";

export interface AuthSessionEvent {
  scope: AuthSessionScope;
  type: AuthSessionEventType;
  timestamp: number;
  sourceId: string;
  reason?: string;
}

const CHANNEL_NAME = "anganstay-auth-session";
const STORAGE_KEY = "anganstay-auth-session-event";
const SOURCE_KEY = "anganstay-auth-session-source";

const isBrowser = () => typeof window !== "undefined";

const createSourceId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getSourceId = () => {
  if (!isBrowser()) {
    return "server";
  }

  try {
    const existing = window.sessionStorage.getItem(SOURCE_KEY);
    if (existing) {
      return existing;
    }

    const next = createSourceId();
    window.sessionStorage.setItem(SOURCE_KEY, next);
    return next;
  } catch {
    return createSourceId();
  }
};

const isAuthSessionEvent = (value: unknown): value is AuthSessionEvent => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Partial<AuthSessionEvent>;
  return (
    (event.scope === "admin" || event.scope === "public") &&
    (event.type === "login" ||
      event.type === "logout" ||
      event.type === "refresh") &&
    typeof event.timestamp === "number" &&
    typeof event.sourceId === "string"
  );
};

export const broadcastAuthSessionEvent = (
  scope: AuthSessionScope,
  type: AuthSessionEventType,
  reason?: string,
) => {
  if (!isBrowser()) {
    return;
  }

  const event: AuthSessionEvent = {
    scope,
    type,
    timestamp: Date.now(),
    sourceId: getSourceId(),
    reason,
  };

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  } catch {
    // BroadcastChannel is not available in every browser context.
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
  } catch {
    // Storage can be disabled; BroadcastChannel already covered modern tabs.
  }
};

export const subscribeAuthSessionEvents = (
  scope: AuthSessionScope,
  handler: (event: AuthSessionEvent) => void,
) => {
  if (!isBrowser()) {
    return () => {};
  }

  const sourceId = getSourceId();

  const handleEvent = (event: AuthSessionEvent) => {
    if (event.scope !== scope || event.sourceId === sourceId) {
      return;
    }

    handler(event);
  };

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (message) => {
      if (isAuthSessionEvent(message.data)) {
        handleEvent(message.data);
      }
    };
  } catch {
    channel = null;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      const parsed = JSON.parse(event.newValue) as unknown;
      if (isAuthSessionEvent(parsed)) {
        handleEvent(parsed);
      }
    } catch {
      // Ignore malformed values from storage.
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    channel?.close();
  };
};
