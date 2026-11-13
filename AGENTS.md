# Web de L'Abelluco — instruccions per a agents

## Context privat
Abans de començar qualsevol tasca: si no existeix ../notes-abelluco, clona el repositori privat
notes-abelluco al costat d'aquest; fes-hi git pull i llegeix normes-comunes.md i projectes/web-labelluco.md.
Cada vegada que acabis una tasca: si s'han pres decisions rellevants, actualitza projectes/web-labelluco.md,
aquest AGENTS.md i DECISIONS.md, i fes commit i push dels dos repositoris.

## Què és
Web de L'Abelluco (portada, apps, serveis, qui sóc, contacte) en català, castellà i anglès, amb les polítiques de
privadesa i les condicions d'ús de les apps Terra. Pàgines estàtiques, sense build. Repositori públic (AGPL-3.0).

## Estructura
- `*.html`: les pàgines; la capçalera i el peu es repeteixen a cada una
- `privacitat/<app>.html`, `condicions/<app>.html`: textos legals de cada app (les URL són a les fitxes de Google Play)
- `css/estils.css`, `js/app.js` (tradueix cada pàgina), `js/i18n/es.js` i `en.js`, `img/`
- `nucli/` és una CÒPIA del repositori nucli: no s'edita mai aquí; s'actualitza amb `./actualitzar-nucli.sh`.

## Normes
- Codi simple, llegible i fàcil de mantenir. Sense dependències noves sense preguntar.
- Textos en català, amb traduccions a castellà i anglès (el text català és la clau).
- El nom oficial s'escriu sempre «L'Abelluco» (A majúscula); el logo manté «l'abelluco».
- No canviïs les adreces de `privacitat/` sense avisar Mario: Google Play les enllaça.
- No toquis fitxers fora dels que demana la tasca.
- Mai escriguis claus, contrasenyes ni tokens en cap fitxer.
- Cap canvi es fusiona a main sense l'OK de Mario.

## Compilar i provar
```
node nucli/eines/servidor.mjs 8070
```

## Delegar i auditar
Segueix les seccions "Delegar a Codex" i "Auditoria creuada" de ../notes-abelluco/normes-comunes.md:
delega per iniciativa pròpia les subtasques aïllables, registra-ho a delegacions.md i demana auditoria
a Codex (només lectura) abans de publicar o en canvis delicats.

## Publicar
Cada push a `main` publica la web a GitHub Pages (https://labelluco.github.io/abelluco/): no facis push sense l'OK de Mario.
