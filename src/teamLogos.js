// Team crest IDs from football-data.org (free crest CDN)
const CREST_IDS = {
  'arsenal': 57,
  'aston villa': 58,
  'afc bournemouth': 1044,
  'bournemouth': 1044,
  'brentford': 402,
  'brentford fc': 402,
  'brighton': 397,
  'brighton & hove albion': 397,
  'brighton & hove albion fc': 397,
  'chelsea': 61,
  'crystal palace': 354,
  'everton': 62,
  'fulham': 63,
  'hull': 322,
  'hull city': 322,
  'ipswich': 349,
  'ipswich town': 349,
  'leeds': 341,
  'leeds united': 341,
  'liverpool': 64,
  'luton': 389,
  'luton town': 389,
  'manchester city': 65,
  'manchester united': 66,
  'newcastle': 67,
  'newcastle united': 67,
  'nottingham forest': 351,
  'sunderland': 71,
  'tottenham': 73,
  'tottenham hotspur': 73,
  'coventry': 1076,
  'coventry city': 1076,
};

function normalizeTeam(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+fc$/i, '')
    .replace(/^afc\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function teamCrestUrl(teamName) {
  const key = normalizeTeam(teamName);
  const id = CREST_IDS[key];
  return id ? `https://crests.football-data.org/${id}.png` : null;
}

export function teamInitials(teamName) {
  const words = (teamName || '').split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

export function crestImg(teamName, className = 'team-crest') {
  const url = teamCrestUrl(teamName);
  const safe = (teamName || '').replace(/"/g, '&quot;');
  if (url) {
    return `<img class="${className}" src="${url}" alt="${safe}" loading="lazy">`;
  }
  return `<span class="${className} fallback" title="${safe}">${teamInitials(teamName)}</span>`;
}

export function setTeamCrest(el, teamName) {
  if (!el) return;
  const url = teamCrestUrl(teamName);
  if (url) {
    el.innerHTML = `<img class="team-crest" src="${url}" alt="${teamName}" loading="lazy">`;
  } else {
    el.innerHTML = `<span class="team-crest fallback">${teamInitials(teamName)}</span>`;
  }
}
