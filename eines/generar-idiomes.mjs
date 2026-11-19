// Genera les versions castellana (es/) i anglesa (en/) de la web a partir de
// les pàgines catalanes de l'arrel i dels diccionaris js/i18n/es.js i en.js.
// Ús, des de l'arrel del repositori:   node eines/generar-idiomes.mjs
//
// Per què: amb una sola pàgina traduïda per JS (?idioma=), Google rebia el
// mateix HTML per a totes les llengües i les tractava com a duplicats. Ara
// cada llengua té el seu fitxer, amb el text, la canònica i els hreflang ja
// escrits a l'HTML.
//
// Què fa:
//  - tradueix data-i18n (text), data-i18n-content, -alt i -aria-label, els
//    og:title i og:description, la descripció del JSON-LD i el missatge del
//    WhatsApp (data-whatsapp); si falta una traducció, s'atura i la diu;
//  - a es/ i en/, afegeix «../» a les adreces dels recursos (css, img, js...)
//    i deixa igual els enllaços a les altres pàgines traduïdes;
//  - a totes les pàgines (també les catalanes) escriu el bloc «idiomes» de la
//    capçalera: canònica, hreflang, og:url i og:locale;
//  - torna a escriure sitemap.xml.
//
// Les pàgines de es/ i en/ no s'editen mai a mà: s'edita la catalana i el
// diccionari, i es torna a executar aquest script abans del commit.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { ES } from '../js/i18n/es.js';
import { EN } from '../js/i18n/en.js';
import { ES as ES_NUCLI } from '../nucli/js/i18n/es.js';
import { EN as EN_NUCLI } from '../nucli/js/i18n/en.js';

const DOMINI = 'https://labelluco.net';
// Pàgines traduïdes. Si n'afegeixes una, posa-la aquí.
const PAGINES = ['index.html', 'apps.html', 'serveis.html', 'qui-soc.html', 'contacte.html'];
// Pàgines només en català (textos legals), que també van al sitemap.
const CARPETES_SENSE_TRADUIR = ['privacitat', 'condicions'];

const IDIOMES = {
  ca: { locale: 'ca_ES', carpeta: '' },
  es: { locale: 'es_ES', carpeta: 'es/', diccionari: { ...ES_NUCLI, ...ES } },
  en: { locale: 'en_GB', carpeta: 'en/', diccionari: { ...EN_NUCLI, ...EN } },
};

const falten = new Set();

// --- Petites eines d'HTML ---
const desescapar = (text) => text
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escaparText = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escaparAtribut = (text) => escaparText(text).replace(/"/g, '&quot;');

function atribut(etiqueta, nom) {
  const trobat = etiqueta.match(new RegExp(`\\s${nom}="([^"]*)"`));
  return trobat ? desescapar(trobat[1]) : null;
}

function canviarAtribut(etiqueta, nom, valor) {
  return etiqueta.replace(new RegExp(`(\\s${nom}=")[^"]*"`), (tot, inici) => inici + escaparAtribut(valor) + '"');
}

// --- Adreces ---
// Adreça pública d'una pàgina en un idioma: index.html és la carpeta.
function adreca(pagina, idioma) {
  return `${DOMINI}/${IDIOMES[idioma].carpeta}${pagina === 'index.html' ? '' : pagina}`;
}

// A es/ i en/, els recursos són una carpeta amunt; les pàgines traduïdes, al costat.
function ajustarAdreca(valor) {
  if (/^([a-z]+:|#|\/)/i.test(valor)) return valor;
  const fitxer = valor.split(/[?#]/)[0];
  return PAGINES.includes(fitxer) ? valor : '../' + valor;
}

// --- Traducció ---
function traduir(pagina, html, idioma) {
  const diccionari = IDIOMES[idioma].diccionari;
  const t = (text) => {
    const traduccio = diccionari[text];
    if (traduccio === undefined) {
      falten.add(`${idioma} · ${pagina} · ${text}`);
      return text;
    }
    return traduccio;
  };

  // Cada etiqueta d'obertura, amb el text que la segueix fins a la propera etiqueta.
  html = html.replace(/<([a-zA-Z][\w-]*)(\s[^>]*)?>([^<]*)/g, (tot, nom, atributs = '', text) => {
    let etiqueta = `<${nom}${atributs}>`;

    const clau = atribut(etiqueta, 'data-i18n');
    if (clau !== null) text = escaparText(t(clau));

    for (const [origen, desti] of [['data-i18n-content', 'content'], ['data-i18n-alt', 'alt'], ['data-i18n-aria-label', 'aria-label']]) {
      const clauAtribut = atribut(etiqueta, origen);
      if (clauAtribut !== null) etiqueta = canviarAtribut(etiqueta, desti, t(clauAtribut));
    }

    const propietat = atribut(etiqueta, 'property');
    if (nom === 'meta' && (propietat === 'og:title' || propietat === 'og:description')) {
      etiqueta = canviarAtribut(etiqueta, 'content', t(atribut(etiqueta, 'content')));
    }

    // encodeURIComponent i no URLSearchParams: WhatsApp no entén «+» com a espai.
    const missatge = atribut(etiqueta, 'data-whatsapp');
    if (missatge !== null) {
      const base = atribut(etiqueta, 'href').split('?')[0];
      etiqueta = canviarAtribut(etiqueta, 'href', base + '?text=' + encodeURIComponent(t(missatge)).replace(/'/g, '%27'));
    }

    for (const nomAtribut of ['href', 'src']) {
      const valor = atribut(etiqueta, nomAtribut);
      if (valor !== null) etiqueta = canviarAtribut(etiqueta, nomAtribut, ajustarAdreca(valor));
    }
    return etiqueta + text;
  });

  // La descripció de les dades estructurades (JSON-LD) és la mateixa que la de la pàgina.
  html = html.replace(/("description": )("(?:[^"\\]|\\.)*")/g, (tot, inici, valor) => inici + JSON.stringify(t(JSON.parse(valor))));

  return html.replace(/<html lang="ca">/, `<html lang="${idioma}">`);
}

// --- Bloc «idiomes» de la capçalera ---
function blocIdiomes(pagina, idioma) {
  const linies = [
    '<!-- idiomes: generat per eines/generar-idiomes.mjs -->',
    `<link rel="canonical" href="${adreca(pagina, idioma)}">`,
    ...Object.keys(IDIOMES).map((altre) => `<link rel="alternate" hreflang="${altre}" href="${adreca(pagina, altre)}">`),
    `<link rel="alternate" hreflang="x-default" href="${adreca(pagina, 'ca')}">`,
    `<meta property="og:url" content="${adreca(pagina, idioma)}">`,
    `<meta property="og:locale" content="${IDIOMES[idioma].locale}">`,
    ...Object.keys(IDIOMES).filter((altre) => altre !== idioma)
      .map((altre) => `<meta property="og:locale:alternate" content="${IDIOMES[altre].locale}">`),
    '<!-- /idiomes -->',
  ];
  return linies.map((linia) => '  ' + linia).join('\n');
}

function posarBlocIdiomes(pagina, html, idioma) {
  html = html
    .replace(/\n\s*<!-- idiomes:[\s\S]*?<!-- \/idiomes -->/, '')
    .replace(/\n\s*<meta property="og:(url|locale|locale:alternate)"[^>]*>/g, '');
  const ancora = html.match(/\n[^\n]*<meta property="og:description"[^>]*>/);
  if (!ancora) throw new Error(`${pagina}: no té <meta property="og:description">`);
  const posicio = ancora.index + ancora[0].length;
  return html.slice(0, posicio) + '\n' + blocIdiomes(pagina, idioma) + html.slice(posicio);
}

// --- Sitemap ---
async function escriureSitemap() {
  const entrades = [];
  for (const pagina of PAGINES) {
    const alternatives = [
      ...Object.keys(IDIOMES).map((idioma) => `    <xhtml:link rel="alternate" hreflang="${idioma}" href="${adreca(pagina, idioma)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${adreca(pagina, 'ca')}"/>`,
    ].join('\n');
    for (const idioma of Object.keys(IDIOMES)) {
      entrades.push(`  <url><loc>${adreca(pagina, idioma)}</loc>\n${alternatives}\n  </url>`);
    }
  }
  for (const carpeta of CARPETES_SENSE_TRADUIR) {
    for (const fitxer of (await readdir(carpeta)).filter((nom) => nom.endsWith('.html')).sort()) {
      entrades.push(`  <url><loc>${DOMINI}/${carpeta}/${fitxer}</loc></url>`);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generat per eines/generar-idiomes.mjs: no l'editis a mà.
     Cada pàgina traduïda hi és tres vegades (català a l'arrel, es/ i en/), enllaçades amb hreflang. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entrades.join('\n')}
</urlset>
`;
  await writeFile('sitemap.xml', sitemap);
}

// --- Principal ---
for (const pagina of PAGINES) {
  // Sempre amb salts de línia LF (git els converteix si cal).
  const original = (await readFile(pagina, 'utf8')).replace(/\r\n?/g, '\n');
  const catala = posarBlocIdiomes(pagina, original, 'ca');
  await writeFile(pagina, catala);
  for (const idioma of ['es', 'en']) {
    const html = posarBlocIdiomes(pagina, traduir(pagina, catala, idioma), idioma)
      .replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- Generat per eines/generar-idiomes.mjs a partir de ../${pagina}: no l'editis a mà. -->`);
    await mkdir(IDIOMES[idioma].carpeta, { recursive: true });
    await writeFile(IDIOMES[idioma].carpeta + pagina, html);
  }
}
await escriureSitemap();

if (falten.size) {
  console.error(`Falten ${falten.size} traduccions (afegeix-les a js/i18n/ i torna-ho a executar):`);
  for (const linia of falten) console.error('  ' + linia);
  process.exit(1);
}
console.log(`Fet: ${PAGINES.length} pàgines × 3 idiomes i sitemap.xml.`);
