-- Add sender_id to track gift ownership per sender session (UUID, client-generated).
-- This allows the "My gifts" dashboard to query by sender without a login system.

alter table public.gifts
  add column if not exists sender_id text;

create index if not exists gifts_sender_id_idx on public.gifts (sender_id)
  where sender_id is not null;
