-- Selip: gifts table. Metadata only, non-custodial. Value + rules live on-chain.
-- See docs/SCHEMA.md.

create extension if not exists "pgcrypto";

create table if not exists public.gifts (
  id                 uuid primary key default gen_random_uuid(),
  claim_slug         text not null unique,
  occasion           text not null check (occasion in ('birthday','thr','graduation','wedding','custom')),
  occasion_label     text,
  amount_display     text not null,
  message            text,
  card_theme         text not null,
  rule_type          text not null check (rule_type in ('refund_if_unclaimed','unlock_on_date','vested')),
  rule_param         jsonb,
  status             text not null default 'draft'
                       check (status in ('draft','funded','claimed','refunded','expired')),
  protection         text not null default 'open'
                       check (protection in ('open','email','pin')),
  recipient_email    text,
  pin_hash           text,
  unlock_at          timestamptz,
  thanks_message     text,
  source_chain       text,
  smart_account_addr text,
  funding_tx         text,
  claim_tx           text,
  created_at         timestamptz not null default now(),
  claimed_at         timestamptz
);

create index if not exists gifts_status_idx on public.gifts (status);
create index if not exists gifts_created_at_idx on public.gifts (created_at desc);

-- Row Level Security: the app talks to this table only through the server using
-- the service-role key (which bypasses RLS). Enabling RLS with no permissive
-- policy blocks the anon/public key by default, so a leaked anon key cannot read
-- or write gift rows directly.
alter table public.gifts enable row level security;
