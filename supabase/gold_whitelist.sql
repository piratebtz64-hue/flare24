-- ============================================================
-- Flare24 — Whitelist Gold (Supabase)
-- À coller dans : SQL Editor → New query → Run
-- Projet : iropzgkohudeunrauhlb
-- ============================================================

-- 1) Empêcher un user de s'auto-passer Gold via l'API client
create or replace function public.protect_is_gold()
returns trigger
language plpgsql
as $$
begin
  -- Les clients authentifiés ne peuvent pas modifier is_gold
  if tg_op = 'UPDATE'
     and new.is_gold is distinct from old.is_gold
     and coalesce(auth.role(), '') = 'authenticated' then
    new.is_gold := old.is_gold;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_is_gold on public.profiles;
create trigger trg_protect_is_gold
  before update on public.profiles
  for each row execute function public.protect_is_gold();

-- 2) À l'inscription : fondateur → is_gold = true automatiquement
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  founder boolean := lower(new.email) = 'piratebtz64@gmail.com';
begin
  insert into public.profiles (id, display_name, is_gold)
  values (
    new.id,
    split_part(new.email, '@', 1),
    founder
  )
  on conflict (id) do update
    set is_gold = public.profiles.is_gold or excluded.is_gold;
  return new;
end;
$$;

-- 3) Activer TON compte fondateur tout de suite (si déjà inscrit)
update public.profiles
set is_gold = true, updated_at = now()
where id in (
  select id from auth.users where lower(email) = 'piratebtz64@gmail.com'
);

-- 4) HELPER — activer un membre (ex. un des 50 premiers)
-- Remplace l'email puis Run :
--
-- update public.profiles
-- set is_gold = true, updated_at = now()
-- where id = (
--   select id from auth.users where lower(email) = 'ami@exemple.com'
-- );

-- 5) HELPER — retirer Gold
--
-- update public.profiles
-- set is_gold = false, updated_at = now()
-- where id = (
--   select id from auth.users where lower(email) = 'ami@exemple.com'
-- );

-- 6) Voir qui est Gold
-- select u.email, p.is_gold, p.city, p.created_at
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- order by p.is_gold desc, p.created_at desc;
