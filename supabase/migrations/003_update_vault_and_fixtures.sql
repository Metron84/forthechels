-- 003_update_vault_and_fixtures.sql
-- Run after 001 + 002. Safe to re-run.
-- Vault titles from YouTube oembed; fixtures from fixtur.es (Aug 2026)

-- ─── Vault: real YouTube titles ───

update public.vault_items set
  title = '120 years of CFC',
  subtitle = 'Chelsea Football Club'
where youtube_url like '%eYbYFfubQGA%';

update public.vault_items set
  title = '10 Greatest Premier League Comeback in Chelsea History',
  subtitle = 'GrdArena'
where youtube_url like '%-jHdBQr2atk%';

update public.vault_items set
  title = 'Jose Mourinho takes Chelsea to Title Glory',
  subtitle = 'Premier League · Greatest PL Stories'
where youtube_url like '%0_WKQZAaytc%';

update public.vault_items set
  title = '10 Greatest Champions League Comeback in Chelsea History',
  subtitle = 'GrdArena'
where youtube_url like '%BZVlzksqbeM%';

update public.vault_items set
  title = 'To Win It All...',
  subtitle = 'Chelsea Football Club'
where youtube_url like '%skg-lydt89w%';

update public.vault_items set
  title = 'Cobham Unseen · Man City week',
  subtitle = 'Chelsea Football Club · playlist entry'
where youtube_url like '%fObQ1sXiTAw%';

update public.vault_items set
  title = 'Every Chelsea Goal · 2016/17 title season',
  subtitle = 'Chelsea Football Club · playlist entry'
where youtube_url like '%Y1-76T_boV4%';

update public.vault_items set
  title = 'N''Golo Kanté · Top 10 Chelsea Moments',
  subtitle = 'Chelsea Football Club · playlist entry'
where youtube_url like '%XnzYbCe-dpE%';

-- ─── Fixtures: title fixes on existing rows (fixtur.es) ───

update public.fixtures set title = 'Fulham v Chelsea'
where match_date = '2026-08-24';

update public.fixtures set title = 'Chelsea v Luton Town'
where match_date = '2026-08-27';

update public.fixtures set title = 'Chelsea v Brighton & Hove Albion FC'
where match_date = '2026-08-30';

update public.fixtures set title = 'Arsenal v Chelsea'
where match_date = '2026-09-06';

update public.fixtures set title = 'Chelsea v Hull City'
where match_date = '2026-09-12';

update public.fixtures set title = 'Brentford FC v Chelsea'
where match_date = '2026-09-18';

update public.fixtures set title = 'Chelsea v AFC Bournemouth'
where match_date = '2026-10-10';

update public.fixtures set title = 'Everton v Chelsea'
where match_date = '2026-10-17';

update public.fixtures set title = 'Chelsea v Tottenham Hotspur'
where match_date = '2026-10-24';

update public.fixtures set title = 'Chelsea v Manchester United'
where match_date = '2026-10-31';

-- ─── Fixtures: remainder of season from fixtur.es ───
-- GST: UK +01:00 → add 3h to local; UK +00:00 → add 4h to local

insert into public.fixtures (match_date, competition, title, kickoff_gst, is_featured, sort_order, predictions_open)
select v.* from (values
  ('2026-11-07'::date, 'Premier League', 'Sunderland v Chelsea',           '19:00 GST', false, 11, true),
  ('2026-11-21'::date, 'Premier League', 'Chelsea v Leeds United',         '19:00 GST', false, 12, true),
  ('2026-11-28'::date, 'Premier League', 'Nottingham Forest v Chelsea',    '19:00 GST', false, 13, true),
  ('2026-12-02'::date, 'League Cup',     'Chelsea v Crystal Palace',       '00:00 GST', false, 14, true),
  ('2026-12-05'::date, 'Premier League', 'Chelsea v Liverpool',            '19:00 GST', false, 15, true),
  ('2026-12-12'::date, 'Premier League', 'Manchester City v Chelsea',      '19:00 GST', false, 16, true),
  ('2026-12-19'::date, 'Premier League', 'Chelsea v Aston Villa',          '19:00 GST', false, 17, true),
  ('2026-12-26'::date, 'FA Cup',         'Coventry City v Chelsea',        '19:00 GST', false, 18, true),
  ('2026-12-30'::date, 'League Cup',     'Ipswich Town v Chelsea',         '00:00 GST', false, 19, true),
  ('2027-01-02'::date, 'Premier League', 'Chelsea v Newcastle United',     '19:00 GST', false, 20, true),
  ('2027-01-06'::date, 'League Cup',     'Crystal Palace v Chelsea',       '00:00 GST', false, 21, true),
  ('2027-01-16'::date, 'Premier League', 'Chelsea v Sunderland',           '19:00 GST', false, 22, true),
  ('2027-01-23'::date, 'Premier League', 'Leeds United v Chelsea',         '19:00 GST', false, 23, true),
  ('2027-01-30'::date, 'Premier League', 'Chelsea v Nottingham Forest',    '19:00 GST', false, 24, true),
  ('2027-02-06'::date, 'Premier League', 'Manchester United v Chelsea',    '19:00 GST', false, 25, true),
  ('2027-02-10'::date, 'League Cup',     'Newcastle United v Chelsea',     '00:00 GST', false, 26, true),
  ('2027-02-20'::date, 'Premier League', 'Chelsea v Ipswich Town',         '19:00 GST', false, 27, true),
  ('2027-02-27'::date, 'Premier League', 'Aston Villa v Chelsea',          '19:00 GST', false, 28, true),
  ('2027-03-03'::date, 'League Cup',     'Chelsea v Coventry City',        '00:00 GST', false, 29, true),
  ('2027-03-13'::date, 'Premier League', 'Chelsea v Arsenal',              '19:00 GST', false, 30, true),
  ('2027-03-20'::date, 'Premier League', 'Hull City v Chelsea',            '19:00 GST', false, 31, true),
  ('2027-04-10'::date, 'Premier League', 'Chelsea v Fulham',               '18:00 GST', false, 32, true),
  ('2027-04-17'::date, 'Premier League', 'Brighton & Hove Albion FC v Chelsea', '18:00 GST', false, 33, true),
  ('2027-04-24'::date, 'Premier League', 'Chelsea v Manchester City',      '18:00 GST', false, 34, true),
  ('2027-05-01'::date, 'Premier League', 'Liverpool v Chelsea',            '18:00 GST', false, 35, true),
  ('2027-05-08'::date, 'Premier League', 'Tottenham Hotspur v Chelsea',    '18:00 GST', false, 36, true),
  ('2027-05-15'::date, 'Premier League', 'Chelsea v Everton',              '18:00 GST', false, 37, true),
  ('2027-05-23'::date, 'Premier League', 'AFC Bournemouth v Chelsea',      '18:00 GST', false, 38, true),
  ('2027-05-30'::date, 'Premier League', 'Chelsea v Brentford FC',         '19:00 GST', false, 39, true)
) as v(match_date, competition, title, kickoff_gst, is_featured, sort_order, predictions_open)
where not exists (
  select 1 from public.fixtures f
  where f.match_date = v.match_date and f.title = v.title
);

-- Keep one featured match for home hero
update public.fixtures set is_featured = false where is_featured = true;
update public.fixtures set is_featured = true
where match_date = '2026-08-24' and title = 'Fulham v Chelsea';
