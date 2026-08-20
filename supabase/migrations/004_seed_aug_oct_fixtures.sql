-- 004_seed_aug_oct_fixtures.sql
-- Inserts Aug–Oct 2026 fixtures if missing (e.g. 002 was skipped).
-- Safe to re-run.

insert into public.fixtures (match_date, competition, title, kickoff_gst, is_featured, sort_order, predictions_open)
select v.* from (values
  ('2026-08-24'::date, 'Premier League', 'Fulham v Chelsea',                    '23:00 GST', true,  1, true),
  ('2026-08-27'::date, 'League Cup',     'Chelsea v Luton Town',                '22:30 GST', false, 2, true),
  ('2026-08-30'::date, 'Premier League', 'Chelsea v Brighton & Hove Albion FC', '17:00 GST', false, 3, true),
  ('2026-09-06'::date, 'Premier League', 'Arsenal v Chelsea',                   '19:30 GST', false, 4, true),
  ('2026-09-12'::date, 'League Cup',     'Chelsea v Hull City',                 '18:00 GST', false, 5, true),
  ('2026-09-18'::date, 'Premier League', 'Brentford FC v Chelsea',              '23:00 GST', false, 6, true),
  ('2026-10-10'::date, 'Premier League', 'Chelsea v AFC Bournemouth',           '18:00 GST', false, 7, true),
  ('2026-10-17'::date, 'Premier League', 'Everton v Chelsea',                   '15:30 GST', false, 8, true),
  ('2026-10-24'::date, 'Premier League', 'Chelsea v Tottenham Hotspur',         '21:30 GST', false, 9, true),
  ('2026-10-31'::date, 'Premier League', 'Chelsea v Manchester United',         '16:30 GST', false, 10, true)
) as v(match_date, competition, title, kickoff_gst, is_featured, sort_order, predictions_open)
where not exists (
  select 1 from public.fixtures f
  where f.match_date = v.match_date
);

-- Normalise titles on any older rows from 002 seed
update public.fixtures set title = 'Chelsea v Brighton & Hove Albion FC'
where match_date = '2026-08-30' and title = 'Chelsea v Brighton & Hove Albion';

update public.fixtures set title = 'Brentford FC v Chelsea'
where match_date = '2026-09-18' and title = 'Brentford v Chelsea';

-- Featured hero: next gathering (Fulham away)
update public.fixtures set is_featured = false where is_featured = true;
update public.fixtures set is_featured = true
where match_date = '2026-08-24';
