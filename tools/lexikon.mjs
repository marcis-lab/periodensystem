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
