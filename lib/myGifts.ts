// Client-only: persistent sender identity + gift tracking.
//
// sender_id: a stable UUID for this browser/user. Generated once, stored in
// localStorage. Used to query the server for all gifts created by this sender,
// so "My gifts" works across tabs and page reloads. Cross-device sync requires
// auth (future work).
//
// myGifts: fallback list of gift ids for backward compat with older entries
// that were stored before sender_id existed.

const SID_KEY = "selip.sid";
const GIFTS_KEY = "selip.myGifts";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback (old browsers): pseudo-random but good enough for a client token.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getSenderId(): string {
  if (typeof window === "undefined") return "";
  try {
    const stored = localStorage.getItem(SID_KEY);
    if (stored) return stored;
    const id = generateUUID();
    localStorage.setItem(SID_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export function rememberGiftId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const ids = getGiftIds();
    if (!ids.includes(id)) {
      localStorage.setItem(GIFTS_KEY, JSON.stringify([id, ...ids].slice(0, 100)));
    }
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function getGiftIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GIFTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// ZeroDev refund-automation permission, one per gift. Kept only in the
// sender's own browser -- never sent to the backend. The session key here can
// only ever call refund() on this one gift's escrow (see lib/zerodev.ts), so
// storing it client-side carries no custody risk.
export interface StoredRefundPermission {
  escrowAddress: string;
  sessionPrivateKey: string;
  serializedAccount: string;
}

function refundKey(giftId: string): string {
  return `selip.refundPermission.${giftId}`;
}

export function storeRefundPermission(
  giftId: string,
  permission: StoredRefundPermission,
): void {
  if (typeof window === "undefined" || !giftId) return;
  try {
    localStorage.setItem(refundKey(giftId), JSON.stringify(permission));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function getRefundPermission(
  giftId: string,
): StoredRefundPermission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(refundKey(giftId));
    return raw ? (JSON.parse(raw) as StoredRefundPermission) : null;
  } catch {
    return null;
  }
}
