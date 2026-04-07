const pending = new Map<string, number>();
const TTL_MS = 10 * 60 * 1000;

function purgeExpired(): void {
  const now = Date.now();
  for (const [key, expires] of pending) {
    if (now > expires) {
      pending.delete(key);
    }
  }
}

export function registerOAuthState(state: string): void {
  purgeExpired();
  pending.set(state, Date.now() + TTL_MS);
}

export function consumeOAuthState(state: string | undefined): boolean {
  if (!state) {
    return false;
  }
  const expires = pending.get(state);
  pending.delete(state);
  return expires !== undefined && Date.now() < expires;
}
