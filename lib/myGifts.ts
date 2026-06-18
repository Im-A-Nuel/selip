// Client-only: remember gift ids the sender created on this device so the
// "My gifts" dashboard can resolve their status. There is no sender auth yet;
// this is intentionally local (localStorage), not a server-side ownership list.

const KEY = "selip.myGifts";

export function rememberGiftId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const ids = getGiftIds();
    if (!ids.includes(id)) {
      localStorage.setItem(KEY, JSON.stringify([id, ...ids].slice(0, 100)));
    }
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function getGiftIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
