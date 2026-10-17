# L'Abelluco

Web de difusió de la família d'apps Terra/Custòdia: una portada amb Terra
Bloc com a app destacada, una fitxa per app (Terra Bloc, Terra Anàlisi,
Terra Visibilitat, Terra Sol, Terra Rutes i Custòdia), com funcionen i el
codi lliure. Pàgina estàtica sense build, en català, castellà i anglès.

Publicada a https://mario_escuder.codeberg.page/abelluco/ (provisional:
el codi sortirà de Codeberg).

## Estructura

```
index.html          La pàgina (els textos en català fan de clau de traducció)
css/estils.css      Disposició; colors, botons i selector d'idioma del nucli
js/app.js           Tradueix la pàgina amb el sistema d'idiomes del nucli
js/i18n/es.js, en.js
img/                Marca i icones de les apps (copiades de cada app)
nucli/              Còpia del nucli (./actualitzar-nucli.sh)
```

## Publicar

```
./publicar.sh "Missatge del commit"
```

Verifica, puja `main` i la porta a la branca `pages`, que és la que serveix
Codeberg Pages (webhook Forgejo, només push, filtre `pages`).

## Provar en local

```
node nucli/eines/servidor.mjs 8070
```

## Pendent

- Confirmar la marca L'Abelluco i registrar-la abans del domini.
- On s'allotja la web (i les apps) en sortir de Codeberg; ara la web i els
  enllaços a les apps són a `mario_escuder.codeberg.page/`.
- Captures reals de les apps, enllaç a Google Play quan hi siguen, i un
  contacte.

Llicència AGPLv3.
