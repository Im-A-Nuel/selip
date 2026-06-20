-- Custom occasion only: a drawn or uploaded card image, stored as a compressed
-- JPEG data URL. Kept small client-side (max ~1.6MB string) so the row is light.
alter table public.gifts
  add column if not exists card_image text;
