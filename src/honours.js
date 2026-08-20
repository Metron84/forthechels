function yt(q) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export const HONOURS = [
  {
    yr: '2025', t: 'Conference League', sub: 'Real Betis 1-4 Chelsea · Wrocław',
    note: 'The night that completed the set. No club had won all five before.',
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Real Betis Conference League final 2025 highlights' },
      { k: 'yt', t: 'Cole Palmer on the comeback', s: 'Player interview', q: 'Cole Palmer Conference League final interview' },
      { k: 'pod', t: 'We won them all', s: 'Podcast', q: 'Chelsea Conference League 2025 podcast' },
      { k: 'trf', t: 'Watching it in Dubai', s: 'TRF film', q: 'The Reflective Football Chelsea' }
    ]
  },
  {
    yr: '2025', t: 'FIFA Club World Cup', sub: 'Champions of the world',
    note: 'Chelsea went to the United States and came back world champions.',
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Club World Cup 2025 final highlights' },
      { k: 'yt', t: 'Lifting the trophy', s: 'The moment', q: 'Chelsea Club World Cup 2025 trophy lift' },
      { k: 'pod', t: 'World champions', s: 'Podcast', q: 'Chelsea Club World Cup podcast' }
    ]
  },
  {
    yr: '2021', t: 'Champions League', sub: 'Man City 0-1 Chelsea · Porto',
    note: "Havertz rounds Ederson. Tuchel's side hold on.",
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Manchester City Champions League final 2021 highlights' },
      { k: 'yt', t: 'Havertz, the goal', s: 'The moment', q: 'Kai Havertz goal Champions League final 2021' },
      { k: 'pod', t: 'Porto, retold', s: 'Podcast', q: 'Chelsea 2021 Champions League final podcast' }
    ]
  },
  {
    yr: '2019', t: 'Europa League', sub: 'Chelsea 4-1 Arsenal · Baku',
    note: "Hazard's last night in blue, and he took it with him.",
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Arsenal Europa League final 2019 highlights' },
      { k: 'yt', t: "Hazard's goodbye", s: 'Player', q: 'Eden Hazard Europa League final 2019' }
    ]
  },
  {
    yr: '2013', t: 'Europa League', sub: 'Benfica 1-2 Chelsea · Amsterdam',
    note: 'Ivanović, 93rd minute, and Amsterdam went blue.',
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Benfica Europa League final 2013 highlights' },
      { k: 'yt', t: 'Ivanović, 93rd minute', s: 'The moment', q: 'Ivanovic winner Europa League final 2013' }
    ]
  },
  {
    yr: '2012', t: 'Champions League', sub: 'Bayern 1-1 Chelsea, 4-3 pens · Munich',
    note: 'In their own stadium. Drogba headed it, then Drogba won it.',
    links: [
      { k: 'yt', t: 'Final highlights', s: 'Match coverage', q: 'Chelsea Bayern Munich Champions League final 2012 highlights' },
      { k: 'yt', t: 'Penalty five', s: 'The moment', q: 'Drogba winning penalty Champions League final 2012' },
      { k: 'pod', t: 'Munich, fourteen years on', s: 'Podcast', q: 'Chelsea Munich 2012 podcast' },
      { k: 'trf', t: 'Where were you? Munich', s: 'Member stories', q: 'The Reflective Football Chelsea fans' }
    ]
  },
  {
    yr: '1998', t: "Cup Winners' Cup", sub: 'Chelsea 1-0 Stuttgart · Stockholm',
    note: 'Zola off the bench, one touch, one goal.',
    links: [
      { k: 'yt', t: "Zola's winner", s: 'The moment', q: 'Zola goal Cup Winners Cup final 1998' }
    ]
  },
  {
    yr: '1971', t: "Cup Winners' Cup", sub: 'Real Madrid 1-2 Chelsea · Athens',
    note: 'The first European trophy. It started here.',
    links: [
      { k: 'yt', t: 'Athens, 1971', s: 'Archive', q: 'Chelsea Real Madrid Cup Winners Cup final 1971' }
    ]
  }
];

export function renderHonours() {
  const list = document.getElementById('troList');
  if (!list) return;

  list.innerHTML = HONOURS.map((h, i) => {
    const rows = h.links.map((l) => `
      <a class="vlink" href="${yt(l.q)}" target="_blank" rel="noopener noreferrer">
        <span class="pl ${l.k === 'trf' ? 'trf' : l.k === 'pod' ? 'pod' : ''}"></span>
        <span class="tx"><b>${l.t}</b><small>${l.s}</small></span>
        <span class="go">&#8599;</span>
      </a>`).join('');
    return `<div class="tro-c" data-h="${i}">
      <button class="tro-hd" aria-expanded="false">
        <span class="yr">${h.yr}</span><span class="tx"><b>${h.t}</b><small>${h.sub}</small></span>
        <span class="ch">&#9662;</span>
      </button>
      <div class="tro-bd"><p class="note">${h.note}</p>${rows}</div>
    </div>`;
  }).join('');

  list.querySelectorAll('.tro-hd').forEach((b) => {
    b.addEventListener('click', () => {
      const card = b.parentNode;
      const open = card.classList.contains('open');
      list.querySelectorAll('.tro-c').forEach((c) => {
        c.classList.remove('open');
        c.querySelector('.tro-hd').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        card.classList.add('open');
        b.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
