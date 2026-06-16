-- Avatar URL on profile (Google photo or any external image URL).
alter table public.profiles
  add column if not exists avatar_url text;
