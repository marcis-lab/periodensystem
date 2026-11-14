// Cloudflare Worker für das Periodensystem 3D.
// Liefert die Seite (index.html) als statische Datei aus und stellt die kleine API
// für den Klassenmodus bereit: /api/klasse/...
// Jede Klasse ist ein eigenes Durable Object (Name = Klassencode). Gespeichert werden
// nur Spitzname, Punkte und Zeit – und nach 2 Tagen wird alles automatisch gelöscht.

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // ohne 0/O und 1/I
const MAX_AGE = 2 * 24 * 3600 * 1000;
const MAX_PLAYERS = 60;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const randStr = (n, chars = CODE_CHARS) => {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return [...b].map(v => chars[v % chars.length]).join('');
};
const int = (v, lo, hi, def) => { v = Math.round(Number(v)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };
async function readBody(req) {
  const t = await req.text();
  if (t.length > 2000) return null;
  try { return JSON.parse(t || '{}'); } catch { return null; }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/klasse')) return env.ASSETS.fetch(req);

    const parts = url.pathname.split('/').filter(Boolean);   // ['api','klasse',code?,action?]
    const code = (parts[2] || '').toUpperCase(), action = parts[3] || '';

    // Neue Klasse eröffnen
    if (!code) {
      if (req.method !== 'POST') return json({ error: 'Nur POST erlaubt.' }, 405);
      const body = await readBody(req);
      if (!body) return json({ error: 'Ungültige Anfrage.' }, 400);
      for (let i = 0; i < 6; i++) {
        const c = randStr(5);
        const res = await stub(env, c).fetch('https://klasse/create', { method: 'POST', body: JSON.stringify({ n: body.n }) });
        if (res.status === 409) continue;
        const j = await res.json();
        return json({ code: c, ...j });
      }
      return json({ error: 'Bitte nochmals versuchen.' }, 503);
    }

    if (!/^[A-Z0-9]{5}$/.test(code)) return json({ error: 'Diese Klasse gibt es nicht (mehr).' }, 404);
    if (!action && req.method === 'GET') return stub(env, code).fetch('https://klasse/state');
    if (['join', 'score', 'close'].includes(action) && req.method === 'POST') {
      const body = await readBody(req);
      if (!body) return json({ error: 'Ungültige Anfrage.' }, 400);
      return stub(env, code).fetch('https://klasse/' + action, { method: 'POST', body: JSON.stringify(body) });
    }
    return json({ error: 'Unbekannte Anfrage.' }, 404);
  }
};

const stub = (env, code) => env.KLASSE.get(env.KLASSE.idFromName(code));

export class Klasse {
  constructor(state) { this.state = state; }

  async fetch(req) {
    const path = new URL(req.url).pathname;
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    let room = await this.state.storage.get('room');

    if (path === '/create') {
      if (room) return json({ error: 'exists' }, 409);
      room = { created: Date.now(), n: int(body.n, 5, 20, 10), tk: randStr(16), open: true, players: {} };
      await this.state.storage.put('room', room);
      await this.state.storage.setAlarm(Date.now() + MAX_AGE);
      return json({ n: room.n, tk: room.tk });
    }

    if (!room || Date.now() - room.created > MAX_AGE) return json({ error: 'Diese Klasse gibt es nicht (mehr).' }, 404);
    const players = room.players;

    if (path === '/state') {
      return json({ n: room.n, open: room.open,
        players: Object.values(players).map(({ name, score, answered, ms, done }) => ({ name, score, answered, ms, done })) });
    }

    if (path === '/join') {
      if (!room.open) return json({ error: 'Diese Klasse ist schon beendet.' }, 403);
      if (Object.keys(players).length >= MAX_PLAYERS) return json({ error: 'Die Klasse ist voll.' }, 403);
      let name = String(body.name || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
      if (!name) return json({ error: 'Bitte einen Spitznamen eingeben.' }, 400);
      const taken = new Set(Object.values(players).map(p => p.name.toLowerCase()));
      if (taken.has(name.toLowerCase())) { let k = 2; while (taken.has((name + ' ' + k).toLowerCase())) k++; name = name.slice(0, 17) + ' ' + k; }
      const pid = randStr(16);
      players[pid] = { name, score: 0, answered: 0, ms: 0, done: false };
      await this.state.storage.put('room', room);
      return json({ pid, name, n: room.n });
    }

    if (path === '/score') {
      const p = players[String(body.pid || '')];
      if (!p) return json({ error: 'Unbekannt.' }, 404);
      if (p.done) return json({ ok: true });
      const answered = int(body.answered, 0, room.n, p.answered);
      if (answered < p.answered) return json({ ok: true });
      p.answered = answered;
      p.score = int(body.score, 0, answered, p.score);
      p.ms = int(body.ms, 0, 6 * 3600 * 1000, p.ms);
      p.done = !!body.done && answered >= room.n;
      await this.state.storage.put('room', room);
      return json({ ok: true });
    }

    if (path === '/close') {
      if (body.tk !== room.tk) return json({ error: 'Nicht erlaubt.' }, 403);
      room.open = false;
      await this.state.storage.put('room', room);
      return json({ ok: true });
    }

    return json({ error: 'Unbekannte Anfrage.' }, 404);
  }

  async alarm() { await this.state.storage.deleteAll(); }
}
