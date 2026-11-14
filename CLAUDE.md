# Periodensystem 3D

## Dieses Projekt

- **Live:** https://periodensystem.thinklabs.workers.dev
- **Produktions-Branch:** `main`
- **Aufbau:** Die ganze Seite steckt in einer index.html. `worker.js` liefert sie als statische Datei aus und stellt die API für den Klassenmodus bereit (`/api/klasse`, ein Durable Object `Klasse` pro Klasse, Daten werden nach 2 Tagen gelöscht). Konfiguration: wrangler.jsonc; was nicht online geht: .assetsignore.
- **Design:** gemeinsamer Lexikon-Look wie mindblow und Weltgeschichte (Wunsch der Besitzerin vom 14.11.2026): Schrift Outfit, Verlauf Pink → Blau (#FF3D85 → #5072FF), Glasflächen über weichen Farbwolken, hell als Standard und dunkel über `prefers-color-scheme`. Die 3D-Kacheln lesen ihre Grundfarben aus den `--tile-*`-Tokens (`readTheme()` im Skript) und zeichnen sich beim Wechsel des Modus neu; die Bühnen in den Fenstern (Atom, Moleküle, Batterie, Vergleich) bleiben absichtlich dunkel.

- **Fotos der Elemente:** `bilder/el/<Symbol>.jpg`, Bildnachweis in `bilder/bilder.json`, geladen mit `python3 tools/bilder-laden.py` (Hauptbild des englischen Wikipedia-Artikels, langsam, eigener User-Agent; aus Cloud-Sitzungen oft 429, dann später oder lokal). Falsches Bild: Commons-Datei in `DATEI` im Skript eintragen und `python3 tools/bilder-laden.py <Symbol>` (Hafnium ist so eingetragen, sein Artikel hat kein Hauptbild). Kein Foto gibt es ab Fermium (100) sowie für Astat, Francium, Promethium, Radon und Curium (von Curium gibt es nur ein Fair-Use-Bild auf en.wikipedia, nicht übernehmen); das Atom-Fenster erklärt warum (`NOFOTO` in `showFoto`). Auf Windows `py -3` statt `python3`; nie zwei Läufe gleichzeitig, sonst sperrt Wikimedia (429).
- **«Im Lexikon»** im Atom-Fenster: sucht den Elementnamen (plus Stichwörter in `LX_EXTRA`) in den `lexikon.json` der anderen Lexika, im Browser, ohne Build.
- **Molekül-Galerie** (Molekül-Labor, Modus «Galerie», Direktlink `#molekuel=<id>`): alle Moleküle aus `MOLS` in 3D, Lewis, Polarität und Kalotte, ohne sie bauen zu müssen. Zählt nicht als «entdeckt» (`labMode==='gal'` überspringt die Entdeckungen in `refreshLab`). Das Atom-Fenster verlinkt unter «Kommt vor in» alle Moleküle mit dem Element in die Galerie.
- **Lektionen** (`LESSONS` im Skript, Direktlink `#lektion=<id>`): vier Schritte mit Denkfrage und Werkzeug-Knopf, danach «Das Wichtigste». Neue Lektion = Eintrag in `LESSONS` und in `tools/lexikon.mjs`.

## Regeln für Claude (gelten in jeder Sitzung, auch in der Cloud und am Handy)

Die vollständigen Regeln und die Liste aller Projekte stehen im Repo **`marcis-lab/claude-wissen`** (Datei `CLAUDE.md`).
Wenn du Zugriff darauf hast, lies sie zuerst. Neues, das dauerhaft gelten soll, dort eintragen und pushen.

Kurzfassung:
- **GitHub ist die einzige Quelle.** Jede Änderung committen und auf den Produktions-Branch pushen (siehe unten).
  Cloudflare ist direkt mit GitHub verbunden und veröffentlicht automatisch. Nie von Hand `wrangler deploy`, kein API-Token, keine GitHub Action.
- **Geheimnisse** (API-Keys) nie ins Repo, nur als Cloudflare-Secret. Secrets trägt die Besitzerin selbst ein.
- **Jede HTML-Seite braucht ein Favicon:** `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` im Wurzelordner und im `<head>` jeder Seite verlinkt.
- **Nichts Internes öffentlich:** Neue Projektdateien (README, Notizen, Code) gehören in `.assetsignore`, falls der Worker den ganzen Ordner ausliefert.
- **Kein Name der Besitzerin** in Adressen. Seiten ohne eigene Domain laufen auf `<projekt>.thinklabs.workers.dev`.
- **Am Ende jeder Sitzung** committen und pushen.