# Periodensystem 3D

## Dieses Projekt

- **Live:** https://periodensystem.thinklabs.workers.dev
- **Produktions-Branch:** `main`
- **Aufbau:** Alles in einer index.html. Worker liefert nur index.html aus (wrangler.jsonc, .assetsignore).

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