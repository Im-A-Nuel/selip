// Best-effort in-process attempt limiter for the PIN gate. Keyed by gift id.
//
// Caveat: serverless deployments run multiple isolated instances, so this is a
// per-instance limiter, not a global one. It raises the cost of a brute-force
// attack meaningfully without a shared store; a production setup would back this
// with Redis or a DB column. Good enough to stop a naive scripted attack and to
// demonstrate the control. Parked on globalThis to survive bundle/HMR splits.

interface AttemptRecord {
  count: number;
  // epoch ms until which the gift is locked out; 0 when not locked
  lockedUntil: number;
}

interface LimiterState {
  attempts: Map<string, AttemptRecord>;
}

const globalForLimiter = globalThis as unknown as {
  __selipLimiter?: LimiterState;
};

function state(): LimiterState {
  if (!globalForLimiter.__selipLimiter) {
    globalForLimiter.__selipLimiter = { attempts: new Map() };
  }
  return globalForLimiter.__selipLimiter;
}

// Tunables: 5 wrong tries, then a 15-minute lockout.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export interface LimitCheck {
  ok: boolean;
  // seconds remaining when locked out
  retryAfter?: number;
}

// Call before checking a secret. Returns ok:false when the gift is locked out.
export function checkPinAttempts(giftId: string, now = Date.now()): LimitCheck {
  const rec = state().attempts.get(giftId);
  if (!rec) return { ok: true };
  if (rec.lockedUntil && now < rec.lockedUntil) {
    return { ok: false, retryAfter: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  // Lockout elapsed: reset the window.
  if (rec.lockedUntil && now >= rec.lockedUntil) {
    state().attempts.delete(giftId);
  }
  return { ok: true };
}

// Record a wrong attempt. Triggers a lockout once MAX_ATTEMPTS is reached.
export function recordPinFailure(giftId: string, now = Date.now()): void {
  const map = state().attempts;
  const rec = map.get(giftId) ?? { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    rec.count = 0;
  }
  map.set(giftId, rec);
}

// Clear all state for a gift after a successful claim.
export function clearPinAttempts(giftId: string): void {
  state().attempts.delete(giftId);
}
