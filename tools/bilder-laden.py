#!/usr/bin/env python3
"""Fotos der Elemente einmal von Wikimedia herunterladen und selbst ausliefern.

Für jedes Element wird das Hauptbild des englischen Wikipedia-Artikels geholt (dort ist es meist ein echtes
Foto des Elements: Gold-Kristalle, leuchtende Neonröhre, flüssiges Brom), in 640 px Breite unter
bilder/el/<Symbol>.jpg gespeichert und der Bildnachweis (Urheber, Lizenz, Link) nach bilder/bilder.json geschrieben.

Langsam und mit eigenem User-Agent, wie Wikimedia es verlangt. Schon geladene Bilder werden übersprungen.
Aus Cloud-Sitzungen sperrt Wikimedia oft (Fehler 429), dann lokal ausführen.
Aufruf im Repo-Ordner:  python3 tools/bilder-laden.py
Einzelne Elemente neu laden:  python3 tools/bilder-laden.py Au Ne
Nur Urheber-Angaben bereinigen:  python3 tools/bilder-laden.py --nachweis
Bild bewusst ersetzen: in DATEI unten eine Commons-Datei eintragen und das Element neu laden.
"""
import json, os, re, sys, time, html, urllib.parse, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'bilder', 'el')
MANIFEST = os.path.join(ROOT, 'bilder', 'bilder.json')
UA = 'periodensystem Bilder-Skript (Lexikon fuer Schulen, einmaliger Download)'
WIDTH = 640
PAUSE = 4.0

# Englische Artikelnamen (Ordnungszahl 1 bis 99). Ab Fermium (100) gibt es keine Fotos:
# Davon wurden nur einzelne Atome hergestellt. Astat und Francium wurden nie in sichtbarer Menge gesehen.
EN = ('Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon '
      'Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel '
      'Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum '
      'Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium '
      'Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium '
      'Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury_(element) Thallium '
      'Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium '
      'Americium Curium Berkelium Californium Einsteinium').split()
SYM = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo '
       'Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb '
       'Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es').split()
SKIP = {'At', 'Fr'}
# Wo der Artikel kein Hauptbild hat oder es kein Foto des Elements ist: Commons-Datei hier fest eintragen.
# Ohne Foto bleiben Promethium, Radon und Curium (auf Commons kein freies Foto; «Curium.jpg» auf en.wikipedia ist
# nur Fair Use und darf nicht übernommen werden); die Seite erklärt das im Atom-Fenster (NOFOTO in showFoto).
DATEI = {'Hf': 'Hf-crystal bar.jpg'}


def get(url, binary=False):
    for versuch in range(8):
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
                return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                warte = max(int(e.headers.get('Retry-After') or 0), 30 * (versuch + 1))
                print(f'  429 von Wikimedia, warte {warte}s ...', flush=True)
                time.sleep(warte)
                continue
            raise
    raise RuntimeError('Wikimedia sperrt weiterhin (429). Später nochmals oder lokal versuchen.')


def api(params):
    q = urllib.parse.urlencode({'format': 'json', 'formatversion': '2', **params})
    time.sleep(PAUSE)
    return get(f'https://en.wikipedia.org/w/api.php?{q}')


def strip(s):
    s = re.sub(r'<[^>]+>', '', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def kuenstler(s):
    """Urheber-Angabe von Commons kürzen: Wiki-Reste («(talk)», «Original uploader was …») raus, Alchemist-hp vereinheitlichen."""
    s = strip(s)
    s = re.sub(r'\(talk\)|Contact email:.*$|\.?\s*Touched up by.*$', '', s)
    s = re.sub(r'^\S+\.(jpe?g|png):\s*', '', s, flags=re.I)          # «Datei.jpg: Urheber»
    s = re.sub(r'[“”"]', '', s)
    s = re.sub(r'(The )?[Oo]riginal(ly)? upload(er was|ed by| by)\s*', '', s)
    s = re.sub(r'\s+at (en|de)\.wikipedia\b\.?|\s+at English Wikipedia\.?', '', s)
    s = re.sub(r'\s*derivative work:\s*', ', ', s)
    s = re.sub(r'\s*\(see File:[^)]*\)', '', s)
    s = re.sub(r'Alchemist-hp.*pse-mendelejew\.de\)?', 'Alchemist-hp (pse-mendelejew.de)', s)
    s = re.sub(r'\s*\([^)]*$', '', s)                                  # offene Klammer am Ende
    s = re.sub(r'\s+', ' ', s).strip(' .,=')
    if not s or re.fullmatch(r'(Unknown author\s*)+|Unspecified|unknown', s, re.I):
        return 'unbekannt'
    return s[:120]


def main():
    os.makedirs(OUT, exist_ok=True)
    man = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    if sys.argv[1:] == ['--nachweis']:   # nur die Urheber-Angaben im Bildnachweis nachbereinigen, nichts laden
        for sym, b in man.items():
            neu = kuenstler(b['artist'])
            if neu != b['artist']:
                print(f'{sym}: {b["artist"]!r} -> {neu!r}')
                b['artist'] = neu
        json.dump(man, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
        return
    nur = set(sys.argv[1:])
    todo = [(s, t) for s, t in zip(SYM, EN) if s not in SKIP and ((s in nur) if nur else (s not in man or not os.path.exists(os.path.join(ROOT, man[s]['src'].lstrip('/')))))]
    print(f'{len(todo)} Fotos zu laden, {len(man)} schon vorhanden.', flush=True)
    for sym, titel in todo:
        try:
            datei = DATEI.get(sym)
            if not datei:
                d = api({'action': 'query', 'prop': 'pageimages', 'piprop': 'name', 'redirects': '1', 'titles': titel.replace('_', ' ')})
                pages = d['query'].get('pages', [])
                datei = pages and pages[0].get('pageimage')
            if not datei:
                print(f'- {sym}: kein Hauptbild im Artikel', flush=True)
                continue
            d = api({'action': 'query', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': str(WIDTH),
                     'iiextmetadatafilter': 'Artist|LicenseShortName|ImageDescription', 'titles': 'File:' + datei})
            ii = d['query']['pages'][0]['imageinfo'][0]
            m = ii.get('extmetadata', {})
            url = ii.get('thumburl') or ii['url']
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.jpg'
            if ext in ('.svg', '.tif', '.tiff'):
                ext = '.png'
            name = sym + ext
            time.sleep(PAUSE)
            open(os.path.join(OUT, name), 'wb').write(get(url, binary=True))
            man[sym] = {
                'src': '/bilder/el/' + name,
                'artist': kuenstler(m.get('Artist', {}).get('value')),
                'license': strip(m.get('LicenseShortName', {}).get('value')) or 'siehe Commons',
                'page': ii.get('descriptionurl', ''),
                'file': datei,
            }
            json.dump(man, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
            print(f'+ {sym}: {datei}  ({man[sym]["license"]})', flush=True)
        except Exception as e:
            print(f'! {sym}: {e}', flush=True)
            if '429' in str(e):
                sys.exit(1)
    print('Fertig.', flush=True)


if __name__ == '__main__':
    main()
