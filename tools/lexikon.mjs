// Schreibt lexikon.json (Suchindex für den Lexikon-Verbund) aus den Elementdaten in index.html.
// Nach Änderungen an den Elementen ausführen: node tools/lexikon.mjs
import fs from 'node:fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const raw = html.match(/const RAW = `([\s\S]*?)`/)[1];
const cat = Object.fromEntries([...html.match(/const CAT = \{([\s\S]*?)\n\};/)[1].matchAll(/(\w+):\{n:'([^']+)'/g)].map(m => [m[1], m[2]]));
const items = raw.trim().split('\n').map((l, i) => {
  const [s, name, , c, , , , , , yr, by, fact] = l.split('|');
  return { t: `${name} (${s})`, u: `/#el=${s}`, d: fact, k: `${s} ${name} Element Ordnungszahl ${i + 1} ${cat[c] || ''} ${by || ''} ${yr === 'A' ? 'Altertum' : yr || ''}`, p: cat[c] || 'Element' };
});
// Moleküle der Galerie (Direktlink #molekuel=<id>)
const molSrc = html.slice(html.indexOf('const MOLS=['), html.indexOf('/* Farbe und Kugelgrösse') > 0 ? html.indexOf('/* Farbe und Kugelgrösse') : undefined);
const mols = [...html.matchAll(/\{id:'([a-z0-9]+)',f:'([^']+)',name:'([^']+)'[^]*?desc:'([^']+)'/g), ...html.matchAll(/M2\('([a-z0-9]+)','([^']+)','([^']+)','[^']*','[^']*','([^']+)'\)/g)]
  .map(m => ({ id: m[1], f: m[2], name: m[3], desc: m[4] }));
const seen = new Set();
for (const m of mols) { if (seen.has(m.id)) continue; seen.add(m.id);
  items.push({ t: `${m.name} (${m.f})`, u: `/#molekuel=${m.id}`, d: m.desc, k: `${m.name} ${m.f} Molekül Formel 3D`, p: 'Molekül' }); }
items.push(
  { t: 'Molekül-Labor', u: '/', d: 'Moleküle selbst bauen und in 3D drehen.', k: 'molekül baukasten bindung chemie', p: 'Werkzeug' },
  { t: 'Batterie-Labor', u: '/', d: 'Spannungsreihe der Metalle ausprobieren.', k: 'batterie spannung strom metalle', p: 'Werkzeug' },
  { t: 'Lektion: Warum rostet Eisen?', u: '/#lektion=rost', d: 'Oxidation, Wasser als Elektrolyt und wie man Eisen schützt.', k: 'rost rosten eisen oxidation verzinken edelstahl lektion', p: 'Lektion' },
  { t: 'Lektion: Warum explodiert Natrium im Wasser?', u: '/#lektion=natrium', d: 'Alkalimetalle, Aussenelektronen und Wasserstoff.', k: 'natrium wasser explosion alkalimetall wasserstoff lektion', p: 'Lektion' },
  { t: 'Lektion: Wie funktioniert ein Akku?', u: '/#lektion=akku', d: 'Spannungsreihe, Minus- und Pluspol, Lithium-Ionen-Akku.', k: 'akku batterie lithium strom spannung lektion', p: 'Lektion' },
  { t: 'Lektion: Warum ist Gold so selten?', u: '/#lektion=gold', d: 'Erdkruste, Erdkern, Edelmetall und Neutronensterne.', k: 'gold selten edelmetall erdkern neutronenstern lektion', p: 'Lektion' },
  { t: 'Quiz und Klassenmodus', u: '/', d: 'Fragen zu den Elementen, auch für ganze Klassen.', k: 'quiz klasse schule test', p: 'Werkzeug' },
);
fs.writeFileSync(new URL('../lexikon.json', import.meta.url), JSON.stringify({ site: 'periodensystem', items }) + '\n');
console.log(`lexikon.json: ${items.length} Einträge`);
