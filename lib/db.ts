// Server-side gift repository. Holds metadata only (non-custodial); never keys
// or funds. Uses Supabase Postgres when env is set, else an in-memory fallback
// so the app and API are fully runnable in local dev without a database.
//
// See SCHEMA.md `gifts` table.

import type { CreateGiftInput, Gift, GiftStatus } from "./gifts";

export interface GiftRepo {
  create(input: CreateGiftInput, slug: string): Promise<Gift>;
  getById(id: string): Promise<Gift | null>;
  getBySlug(slug: string): Promise<Gift | null>;
  update(id: string, patch: Partial<Gift>): Promise<Gift | null>;
  listByIds(ids: string[]): Promise<Gift[]>;
  listBySenderId(senderId: string): Promise<Gift[]>;
}

// ---- In-memory fallback (dev / no-DB) -------------------------------------

// In Next dev (and across separate route bundles) module singletons are not
// shared, so the store is parked on globalThis to survive bundle boundaries and
// HMR within a single Node process. This is the dev/demo fallback only; real
// deployments use Supabase, which is shared by definition.
interface MemoryState {
  store: Map<string, Gift>;
  slugIndex: Map<string, string>;
  seq: number;
}

const globalForMem = globalThis as unknown as {
  __selipMemory?: MemoryState;
};

function memState(): MemoryState {
  if (!globalForMem.__selipMemory) {
    globalForMem.__selipMemory = {
      store: new Map(),
      slugIndex: new Map(),
      seq: 0,
    };
  }
  return globalForMem.__selipMemory;
}

class MemoryRepo implements GiftRepo {
  private get store() {
    return memState().store;
  }
  private get slugIndex() {
    return memState().slugIndex;
  }

  async create(input: CreateGiftInput, slug: string): Promise<Gift> {
    const state = memState();
    state.seq += 1;
    const id = `mem_${state.seq.toString(16).padStart(8, "0")}`;
    const gift: Gift = {
      id,
      claim_slug: slug,
      occasion: input.occasion,
      occasion_label: input.occasion_label,
      protection: input.protection ?? "open",
      recipient_email: input.recipient_email,
      pin_hash: input.pin_hash,
      unlock_at: input.unlock_at,
      amount_display: input.amount_display,
      message: input.message,
      card_theme: input.card_theme,
      rule_type: input.rule_type,
      rule_param: input.rule_param,
      sender_id: input.sender_id,
      status: "draft",
      created_at: new Date().toISOString(),
    };
    this.store.set(id, gift);
    this.slugIndex.set(slug, id);
    return gift;
  }

  async getById(id: string): Promise<Gift | null> {
    return this.store.get(id) ?? null;
  }

  async getBySlug(slug: string): Promise<Gift | null> {
    const id = this.slugIndex.get(slug);
    return id ? (this.store.get(id) ?? null) : null;
  }

  async update(id: string, patch: Partial<Gift>): Promise<Gift | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    this.store.set(id, next);
    return next;
  }

  async listByIds(ids: string[]): Promise<Gift[]> {
    return ids
      .map((id) => this.store.get(id))
      .filter((g): g is Gift => Boolean(g));
  }

  async listBySenderId(senderId: string): Promise<Gift[]> {
    const all = [...memState().store.values()];
    return all
      .filter((g) => g.sender_id === senderId)
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }
}

// ---- Supabase repo ---------------------------------------------------------

const TABLE = "gifts";

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url, key };
  return null;
}

class SupabaseRepo implements GiftRepo {
  // Lazy client so the module loads even when @supabase/supabase-js is absent.
  private clientPromise: Promise<any> | null = null;

  constructor(
    private url: string,
    private key: string,
  ) {}

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = import("@supabase/supabase-js").then((m) =>
        m.createClient(this.url, this.key, {
          auth: { persistSession: false },
        }),
      );
    }
    return this.clientPromise;
  }

  async create(input: CreateGiftInput, slug: string): Promise<Gift> {
    const db = await this.client();
    const { data, error } = await db
      .from(TABLE)
      .insert({
        claim_slug: slug,
        occasion: input.occasion,
        occasion_label: input.occasion_label ?? null,
        protection: input.protection ?? "open",
        recipient_email: input.recipient_email ?? null,
        pin_hash: input.pin_hash ?? null,
        unlock_at: input.unlock_at ?? null,
        amount_display: input.amount_display,
        message: input.message ?? null,
        card_theme: input.card_theme,
        rule_type: input.rule_type,
        rule_param: input.rule_param ?? null,
        sender_id: input.sender_id ?? null,
        status: "draft" as GiftStatus,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Gift;
  }

  async getById(id: string): Promise<Gift | null> {
    const db = await this.client();
    const { data, error } = await db
      .from(TABLE)
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Gift) ?? null;
  }

  async getBySlug(slug: string): Promise<Gift | null> {
    const db = await this.client();
    const { data, error } = await db
      .from(TABLE)
      .select()
      .eq("claim_slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Gift) ?? null;
  }

  async update(id: string, patch: Partial<Gift>): Promise<Gift | null> {
    const db = await this.client();
    const { data, error } = await db
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Gift) ?? null;
  }

  async listByIds(ids: string[]): Promise<Gift[]> {
    if (ids.length === 0) return [];
    const db = await this.client();
    const { data, error } = await db.from(TABLE).select().in("id", ids);
    if (error) throw new Error(error.message);
    return (data as Gift[]) ?? [];
  }

  async listBySenderId(senderId: string): Promise<Gift[]> {
    const db = await this.client();
    const { data, error } = await db
      .from(TABLE)
      .select()
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data as Gift[]) ?? [];
  }
}

// ---- Singleton -------------------------------------------------------------

let repo: GiftRepo | null = null;

export function getRepo(): GiftRepo {
  if (repo) return repo;
  const cfg = supabaseConfig();
  repo = cfg ? new SupabaseRepo(cfg.url, cfg.key) : new MemoryRepo();
  return repo;
}

export const usingMemoryStore = supabaseConfig() === null;
