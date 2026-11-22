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
- `terra-<app>.html`: pàgina de cada app disponible (text de la seva fitxa de Google Play, JSON-LD `SoftwareApplication`);
  quan una app nova estigui disponible, fes-ne una com aquestes i enllaça-la des d'`apps.html` i del carrusel de la portada
  Captures a `img/captures/<app>/<idioma>/N.webp` (360×640, de les captures de Play de cada app): a la pàgina catalana
  s'enllacen les de `ca/` i l'script d'idiomes posa les de `es/` i `en/`
- `privacitat/<app>.html`, `condicions/<app>.html`: textos legals de cada app (les URL són a les fitxes de Google Play)
- Idiomes: el català a l'arrel (s'edita a mà); `es/` i `en/` els GENERA `node eines/generar-idiomes.mjs` amb els
  diccionaris `js/i18n/es.js` i `en.js` (el text català és la clau). No s'editen mai a mà: després de canviar una pàgina
  o un diccionari, torna a executar l'script i fes commit de tot. L'script també escriu la canònica, els hreflang,
  `og:url`/`og:locale` (bloc «idiomes» de la capçalera) i `sitemap.xml`; s'atura si falta una traducció.
  Pàgina traduïda nova: afegeix-la a `PAGINES` de l'script
- `css/estils.css` (les pàgines l'enllacen amb `?v=AAAA-MM-DD`: quan el canviïs, posa-hi la data nova a totes les pàgines catalanes
  i torna a generar els idiomes, perquè els navegadors no facin servir la versió antiga), `js/app.js` (selector d'idioma amb enllaços, redirecció de les adreces antigues `?idioma=` i del
  primer accés a les pàgines catalanes segons l'idioma desat o del navegador; carrusel), `img/`
  Cada pàgina porta etiquetes Open Graph (imatge `img/compartir.jpg`)
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
Cada push a `main` publica la web a GitHub Pages amb el domini propi (https://labelluco.net/, fitxer `CNAME`): no facis push sense l'OK de Mario.
