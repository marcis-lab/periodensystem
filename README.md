# Periodensystem 3D

Interaktives 3D-Periodensystem im Browser: drehbare Anordnungen (Tabelle, Kugel, Helix, Würfel), Färbung nach Kategorien, Werten, Temperatur und Entdeckungsjahr, Bohr-Modell und Orbitale für jedes Element, ein Molekül-Labor mit Baukasten und ein Quiz.

Die ganze Seite steckt in einer einzigen Datei: `index.html`. Three.js und die Schriften werden von einem CDN geladen – es braucht also keinen Build-Schritt.

## Lokal ansehen

`index.html` einfach im Browser öffnen (Doppelklick).

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

## Cloudflare Pages

Eigenes Pages-Projekt `periodensystem`, online unter https://periodensystem-49a.pages.dev/

Neu veröffentlichen (nur `index.html` hochladen, nicht den ganzen Ordner):

```powershell
New-Item -ItemType Directory -Force dist | Out-Null; Copy-Item index.html dist
wrangler pages deploy dist --project-name periodensystem --branch main
```
