import { supabase, ensureAuth } from './supabase.js';
import { renderHonours } from './honours.js';

const TABS = ['home', 'fixtures', 'vault', 'club'];
const TITLES = {
  home: ['Chelsea UAE', 'Official Supporters Club'],
  fixtures: ['Fixtures', 'Season 2026/27'],
  vault: ['The Vault', 'Films and finals'],
  club: ['The Club', 'Membership and perks'],
  card: ['Membership', 'Your card'],
  perks: ['Perks', 'Member discounts'],
  menu: ['Matchday menu', 'Belgian Beer Café'],
  trips: ['Away trips', 'Members only'],
  hafh: ['Home Away From Home', "Who's travelling"],
  honours: ['Honours', 'Every trophy'],
  notices: ['Club notices', 'From the committee'],
  terms: ['Terms', 'Membership terms']
};

const state = {
  userId: null,
  profile: null,
  fixtures: [],
  rsvpIds: new Set(),
  vaultFilter: 'all',
  fixFilter: 'all',
  perkFilter: 'all',
  vaultItems: [],
  perks: [],
  trips: [],
  tripRegs: new Set(),
  hafh: [],
  notices: [],
  settings: {},
  memoryCount: 0,
  prediction: null,
  current: 'home',
  parent: null
};

const $ = (s) => document.querySelector(s);

function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 2100);
}

function show(id, parent) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('on'));
  const v = $(`#v-${id}`);
  if (v) v.classList.add('on');
  state.current = id;
  state.parent = TABS.includes(id) ? null : parent || 'club';
  const t = TITLES[id] || TITLES.home;
  $('#barTitle').textContent = t[0];
  $('#barSub').textContent = t[1];
  $('#backBtn').classList.toggle('on', !!state.parent);
  $('#crest').style.display = state.parent ? 'none' : 'grid';
  const tabFor = state.parent ? 'club' : id;
  document.querySelectorAll('nav button').forEach((b) => {
    b.setAttribute('aria-selected', b.getAttribute('data-tab') === tabFor ? 'true' : 'false');
  });
  $('#main').scrollTop = 0;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    d: String(d.getDate()).padStart(2, '0'),
    m: months[d.getMonth()],
    label: `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].toUpperCase()}`
  };
}

function parseFixtureTeams(title) {
  const parts = title.split(' v ');
  if (parts.length === 2) return { away: parts[0].trim(), home: parts[1].trim() };
  return { away: '—', home: '—' };
}

function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

async function loadSettings() {
  const { data } = await supabase.from('app_settings').select('key, value');
  state.settings = {};
  (data || []).forEach((row) => { state.settings[row.key] = row.value; });
  const otd = state.settings.on_this_day || {};
  if (otd.year) $('.otd .yr').textContent = otd.year;
  if (otd.headline) $('.otd h4').textContent = otd.headline;
  const count = state.settings.member_count_display;
  if (count) $('.join-top .count b').textContent = count;
}

async function loadProfile() {
  if (!state.userId) return;
  const { data } = await supabase.from('profiles').select('*').eq('id', state.userId).maybeSingle();
  state.profile = data;
  if (data) {
    $('#hubName').textContent = data.full_name;
    $('#hubRole').textContent = `Full member · ${data.member_number}${data.payment_status === 'pending' ? ' · payment pending' : ''}`;
    $('#joinWrap').style.display = 'none';
    $('#cardWrap').style.display = 'block';
    $('#cardName').textContent = data.full_name;
    $('#cardNo').textContent = data.member_number;
    renderQr(data.member_number);
  } else {
    $('#joinWrap').style.display = 'block';
    $('#cardWrap').style.display = 'none';
    $('#hubName').textContent = 'Your membership';
    $('#hubRole').textContent = 'Not a member yet';
  }
}

async function loadFixtures() {
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select('*')
    .order('match_date', { ascending: true });
  if (error) throw error;

  const { data: counts } = await supabase.from('fixture_going_counts').select('*');
  const countMap = Object.fromEntries((counts || []).map((c) => [c.fixture_id, c.going_count]));

  let rsvpIds = new Set();
  if (state.userId) {
    const { data: rsvps } = await supabase.from('rsvps').select('fixture_id').eq('profile_id', state.userId);
    rsvpIds = new Set((rsvps || []).map((r) => r.fixture_id));
  }
  state.rsvpIds = rsvpIds;

  state.fixtures = (fixtures || []).map((f) => ({
    ...f,
    going: countMap[f.id] || 0,
    rsvp: rsvpIds.has(f.id),
    ...fmtDate(f.match_date)
  }));

  syncHero();
  renderFixtures();
  renderPredictions();
}

function featuredFixture() {
  return state.fixtures.find((f) => f.is_featured) || state.fixtures[0];
}

function syncHero() {
  const f = featuredFixture();
  if (!f) return;
  const teams = parseFixtureTeams(f.title);
  $('#heroComp').textContent = f.competition;
  $('#heroKo').textContent = f.kickoff_gst.replace(' GST', '');
  $('#heroDate').textContent = `${f.label} · GST`;
  $('#heroAway').textContent = teams.away;
  $('#heroHome').textContent = teams.home;
  $('#goingCount').textContent = f.going;
  $('#faceMore').textContent = '+' + Math.max(f.going - 3, 0);
  const btn = $('#comingBtn');
  btn.textContent = f.rsvp ? "You're going" : "I'm coming";
  btn.classList.toggle('gold', !f.rsvp);
}

async function toggleRsvp(fixture) {
  if (!state.profile) {
    toast('Join as a member first');
    show('card', 'home');
    return;
  }
  if (fixture.rsvp) {
    await supabase.from('rsvps').delete().eq('fixture_id', fixture.id).eq('profile_id', state.userId);
    fixture.rsvp = false;
    fixture.going = Math.max(0, fixture.going - 1);
    toast(`Removed from ${fixture.title}`);
  } else {
    await supabase.from('rsvps').insert({ fixture_id: fixture.id, profile_id: state.userId });
    fixture.rsvp = true;
    fixture.going += 1;
    toast(`You're down for ${fixture.title}`);
  }
  state.rsvpIds = new Set(fixture.rsvp ? [...state.rsvpIds, fixture.id] : [...state.rsvpIds].filter((id) => id !== fixture.id));
  syncHero();
  renderFixtures();
}

function renderFixtures() {
  const list = state.fixtures.filter((f) => {
    if (state.fixFilter === 'all') return true;
    if (state.fixFilter === 'going') return f.rsvp;
    return f.competition === state.fixFilter;
  });
  const el = $('#fixList');
  if (!list.length) {
    el.innerHTML = '<div class="empty">Nothing here yet. Mark yourself in on a fixture and it will show up.</div>';
    return;
  }
  el.innerHTML = list.map((f) => `
    <div class="fx${f.is_featured ? ' next' : ''}">
      <div class="dt"><b>${f.d}</b><small>${f.m}</small></div>
      <div class="md"><em>${f.competition}</em><b>${f.title}</b><small>${f.kickoff_gst}${f.going ? ` · ${f.going} going` : ''}</small></div>
      <button class="rsvp" data-id="${f.id}" aria-pressed="${f.rsvp ? 'true' : 'false'}">${f.rsvp ? 'Going' : "I'm in"}</button>
    </div>`).join('');

  el.querySelectorAll('[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = state.fixtures.find((x) => x.id === btn.getAttribute('data-id'));
      if (f) toggleRsvp(f);
    });
  });
}

async function loadVault() {
  const { data } = await supabase.from('vault_items').select('*').eq('published', true).order('sort_order');
  state.vaultItems = data || [];
  renderVault();
}

function renderVault() {
  const list = state.vaultItems.filter((v) => state.vaultFilter === 'all' || v.category === state.vaultFilter);
  const thumbs = ['', 'a', 'b', 'c'];
  $('#vaultList').innerHTML = list.map((v, i) => `
    <button class="vrow" data-url="${encodeURIComponent(v.youtube_url)}">
      <div class="vth ${thumbs[i % thumbs.length]}"></div>
      <div class="tx"><b>${v.title}</b><small>${v.subtitle}</small></div>
    </button>`).join('');
  $('#vaultList').querySelectorAll('.vrow').forEach((r) => {
    r.addEventListener('click', () => {
      window.open(decodeURIComponent(r.getAttribute('data-url')), '_blank', 'noopener,noreferrer');
    });
  });
}

async function loadNotices() {
  const { data } = await supabase.from('notices').select('*').order('published_at', { ascending: false });
  state.notices = data || [];
  renderNotices();
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function renderNotices() {
  $('#noticeList').innerHTML = state.notices.map((n) => `
    <div class="ntc${n.pinned ? ' pin' : ''}">
      <div class="mt"><em>${n.tag}</em><span>${timeAgo(n.published_at)}</span></div>
      <b>${n.title}</b><p>${n.body}</p><div class="by">${n.author}</div>
    </div>`).join('');
  const pinned = state.notices.find((n) => n.pinned) || state.notices[0];
  if (pinned) $('#noticeTeaser').textContent = pinned.title + '.';
}

async function loadPerks() {
  const { data } = await supabase.from('perks').select('*').eq('published', true).order('sort_order');
  state.perks = data || [];
  renderPerks();
}

function renderPerks() {
  const list = state.perks.filter((p) => state.perkFilter === 'all' || p.category === state.perkFilter);
  $('#perkList').innerHTML = list.map((p) => `
    <div class="pcard"><div class="hd">
      <div class="lg ${p.is_open_slot ? 'o' : p.logo_label === 'BBC' ? 'g' : ''}">${p.logo_label || '○'}</div>
      <div><b>${p.name}</b><div class="loc">${p.location}</div><span class="off">${p.offer}</span></div>
    </div><div class="how">${p.how_to_redeem}</div></div>`).join('');
}

async function loadTrips() {
  const { data: trips } = await supabase.from('trips').select('*').eq('published', true).order('sort_order');
  state.trips = trips || [];
  if (state.userId) {
    const { data: regs } = await supabase.from('trip_registrations').select('trip_id').eq('profile_id', state.userId);
    state.tripRegs = new Set((regs || []).map((r) => r.trip_id));
  }
  renderTrips();
}

function renderTrips() {
  $('#tripList').innerHTML = state.trips.map((t) => {
    const full = t.taken >= t.capacity;
    const reg = state.tripRegs.has(t.id);
    const pct = Math.round((t.taken / t.capacity) * 100);
    return `<div class="trip"><div class="r"><div><b>${t.name}</b><small>${t.description}</small></div>
      <div class="cost">${t.cost_aed.toLocaleString()}<em>AED</em></div></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="left">${full ? 'Full · waiting list' : `${t.capacity - t.taken} of ${t.capacity} places left`}</div>
      <button class="btn ${reg ? 'out' : ''}" data-trip="${t.id}">${reg ? 'Place held · 48 hours' : full ? 'Join waiting list' : 'Register a place'}</button></div>`;
  }).join('');
  $('#tripList').querySelectorAll('[data-trip]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!state.profile) { toast('Members only'); show('card'); return; }
      const trip = state.trips.find((t) => t.id === btn.getAttribute('data-trip'));
      if (state.tripRegs.has(trip.id)) { toast(`Place already held for ${trip.name}`); return; }
      await supabase.from('trip_registrations').insert({
        trip_id: trip.id,
        profile_id: state.userId,
        status: trip.taken >= trip.capacity ? 'waiting' : 'held',
        held_until: new Date(Date.now() + 48 * 3600000).toISOString()
      });
      if (trip.taken < trip.capacity) {
        await supabase.from('trips').update({ taken: trip.taken + 1 }).eq('id', trip.id);
        trip.taken += 1;
      }
      state.tripRegs.add(trip.id);
      renderTrips();
      toast('Place held. Pay within 48 hours.');
    });
  });
}

async function loadHafh() {
  const { data } = await supabase.from('hafh_entries').select('*, profiles(full_name)').order('created_at');
  state.hafh = data || [];
  renderHafh();
}

function renderHafh() {
  const groups = {};
  state.hafh.forEach((e) => {
    if (!groups[e.fixture_label]) groups[e.fixture_label] = [];
    groups[e.fixture_label].push(e);
  });
  $('#hafhList').innerHTML = Object.entries(groups).map(([label, people]) => `
    <div class="hafh"><div class="hd"><em>Fixture</em><b>${label}</b><small>${people.length} members travelling</small></div>
    ${people.map((p) => `<div class="trav"><i>${p.display_initials}</i><div class="tx"><b>${p.profiles?.full_name || 'Member'}</b><small>${p.travel_note}</small></div><span class="tag">${p.tag}</span></div>`).join('')}
    </div>`).join('');
}

async function loadMemoryCount() {
  const { count } = await supabase.from('memories').select('*', { count: 'exact', head: true });
  state.memoryCount = count || 0;
  $('#wwyCount').textContent = state.memoryCount;
}

async function renderPredictions() {
  const f = featuredFixture();
  const panel = $('#predPanel');
  if (!f || !f.predictions_open) {
    panel.innerHTML = '<div class="empty">Predictions open on the next featured match.</div>';
    return;
  }
  const teams = parseFixtureTeams(f.title);
  let myPick = null;
  if (state.userId) {
    const { data } = await supabase.from('predictions').select('pick').eq('fixture_id', f.id).eq('profile_id', state.userId).maybeSingle();
    myPick = data?.pick;
    state.prediction = myPick;
  }

  panel.innerHTML = `
    <div class="picker" style="margin-top:12px;background:var(--wash);border:1px solid var(--line);border-radius:10px;padding:16px">
      <p style="font-size:13px;margin-bottom:12px">${f.title} · who wins?</p>
      <div class="opts" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <button type="button" class="pred-btn" data-pick="${teams.away}" aria-pressed="${myPick === teams.away ? 'true' : 'false'}">${teams.away}</button>
        <button type="button" class="pred-btn" data-pick="Draw" aria-pressed="${myPick === 'Draw' ? 'true' : 'false'}">Draw</button>
        <button type="button" class="pred-btn" data-pick="${teams.home}" aria-pressed="${myPick === teams.home ? 'true' : 'false'}">${teams.home}</button>
      </div>
      <button class="btn gold" id="entryBtn" style="margin-top:14px" ${myPick ? '' : 'disabled'}>${myPick ? `Entry locked · ${myPick}` : 'Pick a result to enter'}</button>
    </div>`;

  panel.querySelectorAll('.pred-btn').forEach((b) => {
    b.style.cssText = 'padding:14px 6px;border:1.5px solid var(--line);border-radius:8px;font-size:12.5px;font-weight:800;background:#fff';
    if (b.getAttribute('aria-pressed') === 'true') {
      b.style.background = 'var(--gold)';
      b.style.borderColor = 'var(--gold)';
    }
    b.addEventListener('click', () => {
      panel.querySelectorAll('.pred-btn').forEach((o) => {
        o.setAttribute('aria-pressed', 'false');
        o.style.background = '#fff';
        o.style.borderColor = 'var(--line)';
      });
      b.setAttribute('aria-pressed', 'true');
      b.style.background = 'var(--gold)';
      b.style.borderColor = 'var(--gold)';
      state.prediction = b.getAttribute('data-pick');
      const eb = $('#entryBtn');
      eb.disabled = false;
      eb.textContent = `Lock in ${state.prediction}`;
    });
  });

  $('#entryBtn')?.addEventListener('click', async () => {
    if (!state.profile) { toast('Join as a member first'); show('card'); return; }
    if (!state.prediction) return;
    await supabase.from('predictions').upsert({
      fixture_id: f.id,
      profile_id: state.userId,
      pick: state.prediction,
      locked_at: new Date().toISOString()
    }, { onConflict: 'fixture_id,profile_id' });
    $('#entryBtn').textContent = `Entry locked · ${state.prediction}`;
    toast('Prediction locked');
  });
}

function renderQr(text) {
  const canvas = $('#qrCanvas');
  if (!canvas) return;
  canvas.width = 240;
  canvas.height = 240;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 240, 240);
    ctx.drawImage(img, 0, 0, 240, 240);
  };
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
}

async function joinMember(name) {
  const { error } = await supabase.from('profiles').upsert({
    id: state.userId,
    full_name: name,
    payment_status: 'pending'
  });
  if (error) throw error;
  await loadProfile();
  toast("You're in. Payment link coming soon.");
}

function bindUi() {
  document.querySelectorAll('nav button').forEach((b) => {
    b.addEventListener('click', () => show(b.getAttribute('data-tab')));
  });
  document.querySelectorAll('[data-go]').forEach((b) => {
    b.addEventListener('click', () => {
      show(b.getAttribute('data-go'), state.current === 'home' ? 'home' : 'club');
    });
  });
  $('#backBtn').addEventListener('click', () => show(state.parent || 'club'));
  $('#qrBtn').addEventListener('click', () => show('card', state.current));

  $('#fixChips').querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      $('#fixChips').querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      state.fixFilter = b.getAttribute('data-c');
      renderFixtures();
    });
  });

  $('#comingBtn').addEventListener('click', () => {
    const f = featuredFixture();
    if (f) toggleRsvp(f);
  });

  $('#wwyBtn').addEventListener('click', async () => {
    if (!state.profile) { toast('Join first to add your memory'); show('card'); return; }
    const otd = state.settings.on_this_day || {};
    await supabase.from('memories').insert({
      profile_id: state.userId,
      headline: otd.headline || 'Munich memory',
      memory_year: otd.year || 2012,
      body: 'Shared from the app'
    });
    state.memoryCount += 1;
    $('#wwyCount').textContent = state.memoryCount;
    toast('Your memory is in The Vault');
  });

  $('#payBtn').addEventListener('click', async () => {
    const n = $('#nm').value.trim();
    if (!n) { $('#nm').focus(); toast('Add your name to continue'); return; }
    try {
      await joinMember(n);
    } catch (e) {
      toast(e.message || 'Could not join');
    }
  });

  $('#vaultChips').querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      $('#vaultChips').querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      state.vaultFilter = b.getAttribute('data-f');
      renderVault();
    });
  });

  $('#perkChips').querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      $('#perkChips').querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      state.perkFilter = b.getAttribute('data-k');
      renderPerks();
    });
  });

  $('#hafhBtn').addEventListener('click', async () => {
    if (!state.profile) { toast('Members only'); show('card'); return; }
    const label = featuredFixture()?.title || 'Next away fixture';
    await supabase.from('hafh_entries').insert({
      profile_id: state.userId,
      fixture_label: label,
      display_initials: initials(state.profile.full_name),
      travel_note: 'Add your dates in the next update',
      tag: 'Needs a ticket'
    });
    await loadHafh();
    toast("You're on the travel list");
  });

  renderHonours();
}

async function init() {
  bindUi();
  try {
    const session = await ensureAuth();
    state.userId = session.user.id;
    await loadSettings();
    await loadProfile();
    await Promise.all([
      loadFixtures(),
      loadVault(),
      loadNotices(),
      loadPerks(),
      loadTrips(),
      loadHafh(),
      loadMemoryCount()
    ]);
  } catch (e) {
    console.error(e);
    toast('Could not connect. Check Supabase settings.');
  }
}

init();
