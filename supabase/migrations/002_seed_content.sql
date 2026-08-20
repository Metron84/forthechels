-- Seed content + fixtures from fixtur.es (Chelsea, Aug–Sep 2026)
-- Times converted from UK (+01:00) to GST (UTC+4): add 3 hours to local UK time shown on fixtur.es

insert into public.vault_items (category, title, subtitle, youtube_url, sort_order) values
  ('finals', 'Club film', 'The Vault', 'https://www.youtube.com/watch?v=eYbYFfubQGA', 1),
  ('finals', 'Club film II', 'The Vault', 'https://www.youtube.com/watch?v=-jHdBQr2atk', 2),
  ('season', 'TRF · Season film', 'This season', 'https://www.youtube.com/watch?v=0_WKQZAaytc', 3),
  ('season', 'TRF · Matchday', 'This season', 'https://www.youtube.com/watch?v=BZVlzksqbeM', 4),
  ('ours', 'Member stories', 'Where were you?', 'https://www.youtube.com/watch?v=skg-lydt89w', 5),
  ('pods', 'Chelsea UAE podcast', 'Series', 'https://www.youtube.com/watch?v=fObQ1sXiTAw&list=PLx6bGx4zt6EnpKBhz5kDG5C6D9MlGR_1d', 6),
  ('pods', 'Munich, retold', 'Series', 'https://www.youtube.com/watch?v=Y1-76T_boV4&list=PLx6bGx4zt6EkDI4olGUb75-6TsOC7so70', 7),
  ('season', 'TRF · Episodes', 'Playlist', 'https://www.youtube.com/watch?v=XnzYbCe-dpE&list=PLx6bGx4zt6EmR3pXhCZNhMYWTh7GJaJ8X', 8)
on conflict do nothing;

insert into public.notices (tag, title, body, author, pinned, published_at) values
  ('Pinned', 'Season ticket ballot opens Monday',
   'Chelsea have released a members allocation for three home fixtures. The ballot runs for 48 hours and is open to paid members only. Payment link will be added to the app shortly.',
   'Ram, President', true, now()),
  ('Matchday', 'Fulham away, doors at 18:30',
   'We are in the main room this week, not upstairs. Tables are held until 19:00, after that it is first come first served. Bring your card.',
   'Committee', false, now() - interval '2 days'),
  ('Club', 'The Reflective Football is filming all season',
   'Our official media partner will be at every matchday. If you would rather not appear on camera, tell any committee member and we will keep you out of frame.',
   'Committee', false, now() - interval '5 days');

insert into public.perks (category, name, location, offer, how_to_redeem, logo_label, is_open_slot, sort_order) values
  ('food', 'Belgian Beer Café', 'Souk Madinat Jumeirah · official venue', '25% off, all season', 'Show your membership card before you pay.', 'BBC', false, 1),
  ('services', 'The Reflective Football', 'Official media partner', 'Members featured first', 'Every matchday filmed. Every episode lands in The Vault.', 'TRF', false, 2),
  ('food', 'Food slot, open', 'One restaurant or café', 'Slot available', 'Partner pays the club for the season and sets its own member offer.', '○', true, 3);

insert into public.trips (name, description, cost_aed, capacity, taken, waiting_list_only, sort_order) values
  ('Stamford Bridge, October', 'Flights, two nights, match ticket, group section', 4200, 32, 23, false, 1),
  ('Riyadh, November', 'Coach from DXB, one night, match ticket', 1450, 45, 17, false, 2),
  ('London, boxing day', 'Waiting list only · flights not included', 2900, 40, 40, true, 3);

-- Fixtures: next block from https://fixtur.es/en/team/chelsea (Aug–Sep 2026)
insert into public.fixtures (match_date, competition, title, kickoff_gst, is_featured, sort_order, predictions_open) values
  ('2026-08-24', 'Premier League', 'Fulham v Chelsea', '23:00 GST', true, 1, true),
  ('2026-08-27', 'League Cup', 'Chelsea v Luton Town', '22:30 GST', false, 2, true),
  ('2026-08-30', 'Premier League', 'Chelsea v Brighton & Hove Albion', '17:00 GST', false, 3, true),
  ('2026-09-06', 'Premier League', 'Arsenal v Chelsea', '19:30 GST', false, 4, true),
  ('2026-09-12', 'League Cup', 'Chelsea v Hull City', '18:00 GST', false, 5, true),
  ('2026-09-18', 'Premier League', 'Brentford v Chelsea', '23:00 GST', false, 6, true),
  ('2026-10-10', 'Premier League', 'Chelsea v AFC Bournemouth', '18:00 GST', false, 7, true),
  ('2026-10-17', 'Premier League', 'Everton v Chelsea', '15:30 GST', false, 8, true),
  ('2026-10-24', 'Premier League', 'Chelsea v Tottenham Hotspur', '21:30 GST', false, 9, true),
  ('2026-10-31', 'Premier League', 'Chelsea v Manchester United', '16:30 GST', false, 10, true);
