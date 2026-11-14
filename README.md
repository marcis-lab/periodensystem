# Periodensystem 3D

Interaktives 3D-Periodensystem im Browser: drehbare Anordnungen (Tabelle, Kugel, Helix, Würfel), Färbung nach Kategorien, Werten, Temperatur, Entdeckungsjahr, Trends, Häufigkeit (Universum, Erdkruste, Körper) und Gefahren (GHS), Bohr-Modell, Orbitale, Zerfall, Spektrum und Isotope (Nuklidkarte) für jedes Element, ein Molekül-Labor mit Baukasten, ein Batterie-Labor (Spannungsreihe), ein Quiz mit Klassenmodus und eine Übersicht über den eigenen Lernfortschritt.

## Klassenmodus

Eine Lehrperson eröffnet unter «Klasse» eine Klasse und bekommt einen 5-stelligen Code. Alle, die beitreten, erhalten dieselben Fragen in derselben Reihenfolge; die Rangliste erscheint live bei der Lehrperson. Die API dafür steckt in `worker.js` (`/api/klasse`), jede Klasse ist ein Durable Object. Gespeichert werden nur Spitzname, Punkte und Zeit – nach 2 Tagen wird alles automatisch gelöscht. Lokal testen: `npx wrangler dev`.

Die ganze Seite steckt in einer einzigen Datei: `index.html`. Three.js und die Schriften werden von einem CDN geladen – es braucht also keinen Build-Schritt. Nur der Klassenmodus braucht den Worker (`worker.js`).

## Lokal ansehen

`index.html` einfach im Browser öffnen (Doppelklick). Alles ausser dem Klassenmodus funktioniert so. Mit Klassenmodus: `npx wrangler dev`.

## Auf GitHub Pages veröffentlichen

1. Auf GitHub ein neues, öffentliches Repository anlegen, z. B. `periodensystem`.
2. In diesem Ordner:

   ```bash
   git init
   git add .
   git commit -m "Periodensystem 3D"
   git branch -M main
   git remote add origin https://github.com/DEIN-NAME/periodensystem.git
   git push -u origin main
   ```

3. Auf GitHub: **Settings → Pages → Build and deployment → Source: «Deploy from a branch»**, Branch `main`, Ordner `/ (root)`, **Save**.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://DEIN-NAME.github.io/periodensystem/`

## Cloudflare

Cloudflare Worker `periodensystem`, online unter https://periodensystem.thinklabs.workers.dev

Cloudflare ist direkt mit diesem GitHub-Repo verbunden: **Jeder Push auf `main` wird automatisch veröffentlicht.**
Nichts von Hand hochladen. Konfiguration: `wrangler.jsonc` (Worker `worker.js` + Durable Object `Klasse`), ausgeschlossene Dateien: `.assetsignore` (als Seite geht nur `index.html` mit den Favicons online).
