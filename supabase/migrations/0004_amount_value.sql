-- Numeric value of a gift (major units, e.g. 50 for $50). amount_display stays
-- the formatted string for the UI; amount_value enables server-side checks
-- (e.g. funding amount == gift amount) once on-chain funding is wired.
alter table public.gifts
  add column if not exists amount_value numeric;
