# L'Abelluco

Web de L'Abelluco: tecnologia al servei del territori. Cinc pàgines
estàtiques, sense build, en català, castellà i anglès:

- `index.html`: portada amb foto de fons (la vall del Millars, de Mario), què faig, carrusel de les apps (Terra
  Bloc, Terra Rutes i Terra Parcel·les) i clients;
- `apps.html`: la família d'apps (Terra Bloc, Terra Anàlisi, Terra
  Visibilitat, Terra Sol, Terra Rutes i Custòdia), com funcionen i el codi;
- `serveis.html`: desenvolupament, Arduino, territori i educació ambiental,
  valors de l'ESS i clients;
- `qui-soc.html`: presentació, visió i decàleg sobre l'ús de la IA;
- `contacte.html`: correu i què cal explicar.

Imatges de tercers: logotips dels clients a `img/clients/` (el del CITA, de
la seva pàgina d'identitat corporativa) i `img/vall-olba.jpg`, de Juan Emilio
Prades Bel, CC BY-SA 4.0 (Wikimedia Commons), amb el crèdit al peu de foto.

Les pàgines de privacitat de les apps són al repositori de cada app.

Publicada a https://labelluco.github.io/abelluco/.

## Estructura

```
*.html              Les pàgines; la capçalera i el peu es repeteixen a cada una
                    (els textos en català fan de clau de traducció)
css/estils.css      Disposició; colors, botons i selector d'idioma del nucli
js/app.js           Tradueix cada pàgina amb el sistema d'idiomes del nucli
js/i18n/es.js, en.js
img/                Marca i icones de les apps (copiades de cada app)
nucli/              Còpia del nucli (./actualitzar-nucli.sh)
```

## Publicar

El codi és a https://github.com/labelluco/abelluco (públic). Cada push a
`main` el publica GitHub Pages a **https://labelluco.github.io/abelluco/**.

## Provar en local

```
node nucli/eines/servidor.mjs 8070
```

## Pendent

- Confirmar la marca L'Abelluco i registrar-la abans del domini.
- Captures reals de les apps, enllaç a Google Play quan hi siguen, i un
  contacte.

Llicència AGPLv3.
