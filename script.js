(() => {
  'use strict';

  /* =========================================================
     CONFIG — edit these to personalise the invitation
     ========================================================= */
  const CONFIG = {
    couple: 'Mayra & Vivaan',
    hashtag: '#MayraWedsVivaan',
    // Main wedding moment for the countdown (IST: 10 Feb 2027, 9:00 AM)
    countdownTo: '2027-02-10T09:00:00+05:30',
    // Optional: path/URL to an MP3 (e.g. 'music/shehnai.mp3').
    // Leave empty to use the built-in synthesized shehnai & tanpura melody.
    musicUrl: '',
    // WhatsApp number that receives RSVPs (country code, no +)
    rsvpWhatsApp: '919876543210',
    venue: '[Venue Name], [City], [State]',
    mapsQuery: 'Venue Name City',
    contacts: [
      { name: 'Rajesh Sharma', role: "Groom's Father", phone: '919876543210' },
      { name: 'Mahesh Patel',  role: "Bride's Father", phone: '919812345678' },
    ],
    events: [
      { day: 1, part: 'Morning',   name: 'Ganesh Sthapan',   icon: 'i-diya',
        desc: 'We begin by invoking the blessings of Lord Ganesha for an auspicious and obstacle-free celebration.',
        start: '2027-02-10T09:00:00+05:30', end: '2027-02-10T11:00:00+05:30', venue: '[Temple Hall], [Venue Name]' },
      { day: 1, part: 'Afternoon', name: 'Bhojan Samarambh', icon: 'i-thali',
        desc: 'A grand traditional feast shared with family & friends — come hungry!',
        start: '2027-02-10T12:30:00+05:30', end: '2027-02-10T15:00:00+05:30', venue: '[Dining Hall], [Venue Name]' },
      { day: 1, part: 'Evening',   name: 'Mameru',           icon: 'i-gift',
        desc: "The bride's maternal family arrives bearing gifts and heartfelt blessings.",
        start: '2027-02-10T17:00:00+05:30', end: '2027-02-10T19:00:00+05:30', venue: '[Courtyard], [Venue Name]' },
      { day: 1, part: 'Night',     name: 'Dandiya Raas',     icon: 'i-dandiya',
        desc: 'Swirl, twirl and dance the night away to the beats of the dhol. Traditional attire encouraged!',
        start: '2027-02-10T21:00:00+05:30', end: '2027-02-11T00:30:00+05:30', venue: '[Lawn], [Venue Name]' },
      { day: 2, part: 'Morning',   name: 'Jan Prastan',      icon: 'i-dhol',
        desc: 'The baraat sets off in royal style with music, dance and joyous celebration.',
        start: '2027-02-11T09:00:00+05:30', end: '2027-02-11T10:30:00+05:30', venue: '[Groom\'s Residence / Start Point]' },
      { day: 2, part: 'Afternoon', name: 'Hastmelap',        icon: 'i-rings',
        desc: 'The sacred union — the couple\'s hands are joined as they take their vows around the holy fire.',
        start: '2027-02-11T11:30:00+05:30', end: '2027-02-11T14:00:00+05:30', venue: '[Mandap], [Venue Name]' },
    ],
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     HELPERS
     ========================================================= */
  const toast = (() => {
    const el = $('#toast'); let t;
    return msg => { el.textContent = msg; el.classList.add('show'); clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 2400); };
  })();

  const gcalStamp = iso => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const gcalUrl = ({ title, start, end, details, location }) =>
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(title) +
    '&dates=' + gcalStamp(start) + '/' + gcalStamp(end) +
    '&details=' + encodeURIComponent(details) +
    '&location=' + encodeURIComponent(location) +
    '&ctz=Asia/Kolkata';

  const fmtTime = iso => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toUpperCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* =========================================================
     MANDALA GENERATOR (decorative SVG backgrounds)
     ========================================================= */
  function buildMandala(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('fill', 'none'); g.setAttribute('stroke', 'currentColor'); g.setAttribute('stroke-width', '.6');
    const rings = [ { n: 8, r: 18, len: 16, w: 7 }, { n: 16, r: 36, len: 20, w: 7 }, { n: 24, r: 58, len: 22, w: 6 }, { n: 36, r: 80, len: 16, w: 4 } ];
    rings.forEach(({ n, r, len, w }) => {
      for (let i = 0; i < n; i++) {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', `M0 ${-r} C${w} ${-r - len * .4} ${w * .6} ${-r - len * .9} 0 ${-r - len} C${-w * .6} ${-r - len * .9} ${-w} ${-r - len * .4} 0 ${-r}Z`);
        p.setAttribute('transform', `rotate(${(360 / n) * i + (n % 16 ? 0 : 180 / n)})`);
        g.appendChild(p);
      }
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', r); g.appendChild(c);
    });
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', 6); dot.setAttribute('fill', 'currentColor');
    g.appendChild(dot);
    svg.appendChild(g);
  }
  $$('.js-mandala').forEach(buildMandala);

  /* =========================================================
     PETALS
     ========================================================= */
  function startPetals() {
    if (reduceMotion) return;
    const box = $('#petals');
    const colors = ['#f59e0b', '#fb923c', '#e11d48', '#f43f5e', '#fbbf24', '#d4af37'];
    const count = innerWidth < 600 ? 12 : 20;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const size = 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * .8}px;` +
        `background:${colors[i % colors.length]};animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 15}s;opacity:${.5 + Math.random() * .4}`;
      box.appendChild(p);
    }
  }

  /* =========================================================
     MUSIC — MP3 (song.mp3 / song.m4a / song.wav) with Synth Fallback
     ========================================================= */
  const Music = (() => {
    let playing = false;
    let usingSynth = false;
    const audioEl = $('#bgSong');
    const TARGET_VOLUME = 0.65; // 65% volume

    // --- Web Audio synth state for fallback ---
    let ctx, master, reverb, lead, lead2Ref, leadGain, vib, timer, nextNote = 0, noteIdx = 0, nextDrone = 0, droneIdx = 0;

    const SA = 261.63; // Sa = C4
    const hz = semi => SA * Math.pow(2, semi / 12);
    const BEAT = 0.42;
    // Raag Yaman inspired phrase: [semitone offset from Sa, beats] (null = rest)
    const PHRASE = [
      [-1,1],[2,1],[4,2],[2,1],[0,3],[null,1],
      [-1,1],[2,1],[4,1],[6,1],[7,3],[6,1],[4,1],[2,1],[4,2],[2,1],[0,3],[null,1],
      [4,1],[6,1],[9,1],[11,1],[12,3],[11,1],[9,1],[7,2],[null,1],
      [6,1],[7,1],[9,1],[7,1],[6,1],[4,1],[2,2],[4,1],[2,1],[0,4],[null,2],
      [12,2],[11,1],[9,1],[7,2],[9,1],[7,1],[6,1],[4,1],[6,1],[7,3],[6,1],[4,1],[2,1],[-1,1],[2,1],[0,5],[null,3]
    ];
    const DRONE = [-5, 0, 0, -12]; // Pa(low), Sa, Sa, Sa(low) — classic tanpura cycle

    function makeReverb() {
      const len = ctx.sampleRate * 2.8, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      const c = ctx.createConvolver(); c.buffer = buf; return c;
    }

    function initSynth() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
      reverb = makeReverb();
      const wet = ctx.createGain(); wet.gain.value = .45;
      reverb.connect(wet).connect(master);

      lead = ctx.createOscillator(); lead.type = 'sawtooth';
      const lead2 = ctx.createOscillator(); lead2.type = 'square'; lead2.detune.value = 6;
      const mix2 = ctx.createGain(); mix2.gain.value = .35;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.4;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
      leadGain = ctx.createGain(); leadGain.gain.value = 0;
      vib = ctx.createOscillator(); vib.frequency.value = 5.4;
      const vibAmt = ctx.createGain(); vibAmt.gain.value = 4;
      vib.connect(vibAmt); vibAmt.connect(lead.frequency); vibAmt.connect(lead2.frequency);
      lead.connect(bp); lead2.connect(mix2).connect(bp);
      bp.connect(lp).connect(leadGain);
      leadGain.connect(master); leadGain.connect(reverb);
      lead.frequency.value = lead2.frequency.value = hz(0);
      lead.start(); lead2.start(); vib.start();
      lead2Ref = lead2;
    }

    function pluck(freq, t) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator();
      o.type = 'sawtooth'; o2.type = 'triangle';
      o.frequency.value = freq; o2.frequency.value = freq * 2.003;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(500, t + 2.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .02); g.gain.exponentialRampToValueAtTime(.0008, t + 3.2);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(master); g.connect(reverb);
      o.start(t); o2.start(t); o.stop(t + 3.3); o2.stop(t + 3.3);
    }

    function scheduleNote(semi, beats, t) {
      const dur = beats * BEAT, g = leadGain.gain;
      if (semi === null) { g.setTargetAtTime(0, t, .08); return; }
      const f = hz(semi);
      [lead.frequency, lead2Ref.frequency].forEach(p => p.setTargetAtTime(f, t, .045));
      g.setTargetAtTime(.16, t, .05);
      g.setTargetAtTime(.11, t + dur * .6, .15);
    }

    function scheduler() {
      const ahead = ctx.currentTime + .25;
      while (nextNote < ahead) {
        const [s, b] = PHRASE[noteIdx];
        scheduleNote(s, b, nextNote);
        nextNote += b * BEAT;
        noteIdx = (noteIdx + 1) % PHRASE.length;
      }
      while (nextDrone < ahead) {
        pluck(hz(DRONE[droneIdx] - 12), nextDrone);
        nextDrone += BEAT * 2;
        droneIdx = (droneIdx + 1) % DRONE.length;
      }
    }

    async function play() {
      // 1. Try playing root audio file (song.mp3 / song.m4a / song.wav)
      if (audioEl) {
        try {
          audioEl.volume = TARGET_VOLUME;
          await audioEl.play();
          playing = true;
          usingSynth = false;
          return true;
        } catch (e) {
          // If audio file is missing (404) or user blocked, fall back to synth
        }
      }

      // 2. Synthesized Shehnai melody fallback
      try {
        if (!ctx) initSynth();
        await ctx.resume();
        const now = ctx.currentTime;
        if (nextNote < now) { nextNote = now + .1; nextDrone = now + .1; }
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(.9, now, .4);
        clearInterval(timer); timer = setInterval(scheduler, 60); scheduler();
        playing = true;
        usingSynth = true;
        return true;
      } catch (err) {
        return false;
      }
    }

    function pause() {
      if (audioEl && !audioEl.paused) audioEl.pause();
      if (ctx && usingSynth) {
        const now = ctx.currentTime;
        master.gain.setTargetAtTime(0, now, .15);
        clearInterval(timer);
        setTimeout(() => { if (!playing) ctx.suspend(); }, 600);
      }
      playing = false;
    }

    return { play, pause, get playing() { return playing; } };
  })();

  const musicBtn = $('#musicBtn');
  function syncMusicBtn() {
    musicBtn.classList.toggle('playing', Music.playing);
    musicBtn.setAttribute('aria-pressed', Music.playing);
    musicBtn.setAttribute('aria-label', Music.playing ? 'Pause background music' : 'Play background music');
  }

  musicBtn.addEventListener('click', async () => {
    Music.playing ? Music.pause() : await Music.play();
    syncMusicBtn();
  });

  // Autoplay on first user interaction (touch, click, scroll, keydown)
  const autoPlayEvents = ['click', 'touchstart', 'scroll', 'keydown'];
  const startAudioOnInteraction = async () => {
    if (!Music.playing) {
      await Music.play();
      syncMusicBtn();
    }
    autoPlayEvents.forEach(evt => window.removeEventListener(evt, startAudioOnInteraction, { passive: true }));
  };
  autoPlayEvents.forEach(evt => window.addEventListener(evt, startAudioOnInteraction, { passive: true, once: true }));

  // Pause when tab is hidden, resume when visible again
  let resumeOnShow = false;
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden && Music.playing) { resumeOnShow = true; Music.pause(); }
    else if (!document.hidden && resumeOnShow) { resumeOnShow = false; await Music.play(); }
    syncMusicBtn();
  });

  /* =========================================================
     WELCOME → OPEN INVITATION
     ========================================================= */
  $('#openBtn').addEventListener('click', async () => {
    $('#welcome').classList.add('gone');
    document.body.classList.remove('locked');
    musicBtn.classList.add('show');
    startPetals();
    await Music.play();
    syncMusicBtn();
    setTimeout(() => { $('#palace').classList.add('open'); $('#welcome').remove(); }, 1000);
  }, { once: true });

  /* =========================================================
     SCROLL REVEAL + ACTIVE NAV
     ========================================================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  const navLinks = $$('.bottom-nav a');
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id === 'countdown' ? 'date' : e.target.id === 'actions' ? 'events' : e.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'date', 'countdown', 'events', 'actions', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) navIO.observe(el);
  });

  /* =========================================================
     HEART → REVEAL DATES
     ========================================================= */
  const heartZone = $('#heartZone');
  $('#heartBtn').addEventListener('click', () => {
    if (heartZone.classList.contains('revealed')) return;
    // burst of little hearts
    for (let i = 0; i < 16; i++) {
      const h = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      h.setAttribute('class', 'burst-heart');
      h.innerHTML = '<use href="#i-heart"/>';
      const a = (Math.PI * 2 * i) / 16, d = 90 + Math.random() * 70;
      h.style.setProperty('--x', `${Math.cos(a) * d - 9}px`);
      h.style.setProperty('--y', `${Math.sin(a) * d}px`);
      h.style.setProperty('--r', `${Math.random() * 360}deg`);
      h.style.color = i % 2 ? '#c2185b' : '#d4af37';
      heartZone.appendChild(h);
      setTimeout(() => h.remove(), 1300);
    }
    if (navigator.vibrate) navigator.vibrate(40);
    heartZone.classList.add('revealed');
  });

  /* =========================================================
     COUNTDOWN
     ========================================================= */
  const target = new Date(CONFIG.countdownTo).getTime();
  const nums = Object.fromEntries($$('.t-num').map(el => [el.dataset.unit, el]));
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const vals = {
      d: Math.floor(diff / 864e5),
      h: Math.floor(diff / 36e5) % 24,
      m: Math.floor(diff / 6e4) % 60,
      s: Math.floor(diff / 1e3) % 60,
    };
    for (const k in vals) {
      const v = String(vals[k]).padStart(2, '0');
      if (nums[k].textContent !== v) {
        nums[k].textContent = v;
        nums[k].classList.remove('tick'); void nums[k].offsetWidth; nums[k].classList.add('tick');
      }
    }
    if (diff === 0) {
      $('#cdNote').textContent = '🎉 The celebrations have begun! Thank you for being part of our journey.';
      clearInterval(cdTimer);
    }
  }
  const cdTimer = setInterval(tick, 1000); tick();

  /* =========================================================
     EVENTS RENDER + TABS
     ========================================================= */
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CONFIG.mapsQuery);
  CONFIG.events.forEach((ev, i) => {
    const card = document.createElement('article');
    card.className = 'ev frame reveal' + (i % 2 ? ' d1' : '');
    const cal = gcalUrl({ title: `${ev.name} · ${CONFIG.couple} Wedding`, start: ev.start, end: ev.end, details: `${ev.desc}\n\nWe look forward to celebrating with you! ${CONFIG.hashtag}`, location: ev.venue });
    card.innerHTML = `
      <div class="ev-top">
        <div class="ev-icon"><svg><use href="#${ev.icon}"/></svg></div>
        <div><div class="ev-part">Day ${ev.day} · ${esc(ev.part)}</div><h3>${esc(ev.name)}</h3></div>
      </div>
      <p class="desc">${esc(ev.desc)}</p>
      <div class="ev-meta">
        <div><svg><use href="#i-clock"/></svg><span>${fmtTime(ev.start)} – ${fmtTime(ev.end)}</span></div>
        <div><svg><use href="#i-pin"/></svg><span>${esc(ev.venue)}</span></div>
      </div>
      <div class="ev-actions">
        <a class="chip" href="${cal}" target="_blank" rel="noopener"><svg><use href="#i-cal"/></svg>Calendar</a>
        <a class="chip" href="${mapsUrl}" target="_blank" rel="noopener"><svg><use href="#i-pin"/></svg>Directions</a>
      </div>`;
    $('#day-' + ev.day).appendChild(card);
    io.observe(card);
  });

  const dayTabs = $$('.day-tab');
  dayTabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const targetSelector = tab.dataset.target;
      const targetEl = targetSelector ? document.querySelector(targetSelector) : null;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Track active Day button as user scrolls through the stacked layout
  const daySectionIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        dayTabs.forEach(tab => {
          const match = tab.dataset.target === id;
          tab.classList.toggle('active', match);
          tab.setAttribute('aria-selected', match ? 'true' : 'false');
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  ['day-1-section', 'day-2-section'].forEach(id => {
    const el = document.getElementById(id);
    if (el) daySectionIO.observe(el);
  });

  /* =========================================================
     QUICK ACTIONS
     ========================================================= */
  const first = CONFIG.events[0], last = CONFIG.events[CONFIG.events.length - 1];
  $('#mainCalBtn').href = gcalUrl({
    title: `${CONFIG.couple} — Wedding Celebrations 💍`,
    start: first.start, end: last.end,
    details: CONFIG.events.map(e => `• ${e.name} — ${new Date(e.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}, ${fmtTime(e.start)}`).join('\n') + `\n\n${CONFIG.hashtag}`,
    location: CONFIG.venue,
  });

  $('#hashtag').textContent = CONFIG.hashtag;
  $('#copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.hashtag);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: CONFIG.hashtag });
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    toast(`✨ ${CONFIG.hashtag} copied!`);
  });

  /* =========================================================
     CONTACTS
     ========================================================= */
  const contactsEl = $('#contacts');
  if (contactsEl) {
    contactsEl.innerHTML = CONFIG.contacts.map(c => `
      <div class="person frame">
        <div><b>${esc(c.name)}</b><small>${esc(c.role)}</small></div>
        <div class="acts">
          <a class="round wa" href="https://wa.me/${c.phone}?text=${encodeURIComponent('Namaste! Regarding ' + CONFIG.couple + "'s wedding…")}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(c.name)}"><svg><use href="#i-wa"/></svg></a>
          <a class="round call" href="tel:+${c.phone}" aria-label="Call ${esc(c.name)}"><svg><use href="#i-phone"/></svg></a>
        </div>
      </div>`).join('');
  }
})();

