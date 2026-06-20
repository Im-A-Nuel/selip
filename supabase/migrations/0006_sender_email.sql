-- Optional sender email, used only to notify them when the gift is opened.
-- Non-custodial: this is contact metadata, not an account.
alter table public.gifts
  add column if not exists sender_email text;
