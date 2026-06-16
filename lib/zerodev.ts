// ZeroDev session keys / permissions: programmable gift rules.
// MVP rule: auto-refund to sender if unclaimed within N days, enforced at the
// smart-account level (not the backend) so the refund stays trustless.
//
// Pure config + rule helpers here; the signer wiring runs in week 4. UI never
// imports the SDK directly (CLAUDE.md convention).

export interface ZeroDevConfig {
  projectId: string;
}

export function getZeroDevConfig(): ZeroDevConfig | null {
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
  return projectId ? { projectId } : null;
}

export function isZeroDevConfigured(): boolean {
  return getZeroDevConfig() !== null;
}

export interface RefundRule {
  type: "refund_if_unclaimed";
  days: number;
}

// Compute the unix deadline a refund permission should encode.
export function refundDeadline(createdAtMs: number, days: number): number {
  return Math.floor(createdAtMs / 1000) + days * 24 * 60 * 60;
}

// Default MVP rule: refund to sender if unclaimed within 30 days.
export function defaultRefundRule(): RefundRule {
  return { type: "refund_if_unclaimed", days: 30 };
}
