// Web de L'Abelluco: tradueix la pàgina (català, castellà i anglès) amb el
// sistema d'idiomes del nucli, el mateix de les apps, i mou el carrusel.
// Totes les pàgines (inici, apps, serveis, qui soc) carreguen aquest fitxer.
import { configurarI18n, aplicarTraduccions, inicialitzarSelectorIdioma, establirIdioma, idiomaActual, idiomes, t } from '../nucli/js/i18n/i18n.js';
import { ES } from './i18n/es.js';
import { EN } from './i18n/en.js';
import { inicialitzarCarrusel } from './carrusel.js';

configurarI18n({
  clau: 'abelluco-idioma',
  idiomes: ['ca', 'es', 'en'],
  perDefecte: 'en',
  diccionaris: { es: ES, en: EN },
});

// Cada idioma té la seva adreça (?idioma=ca|es|en) perquè els cercadors
// trobin les tres versions; el sitemap les enllaça amb hreflang. Sense el
// paràmetre, l'idioma es tria com sempre (preferència desada o navegador).
const parametres = new URLSearchParams(window.location.search);
const idiomaUrl = parametres.get('idioma');
if (idiomes().includes(idiomaUrl)) establirIdioma(idiomaUrl, { recarregar: false });

// Adreça canònica: sense «index.html» i amb l'idioma si la pàgina el porta.
function posarCanonica() {
  let enllac = document.querySelector('link[rel="canonical"]');
  if (!enllac) {
    enllac = document.createElement('link');
    enllac.rel = 'canonical';
    document.head.append(enllac);
  }
  const ruta = window.location.pathname.replace(/index\.html$/, '');
  const idioma = parametres.get('idioma');
  enllac.href = 'https://labelluco.net' + ruta + (idioma ? '?idioma=' + idioma : '');
}

// Si la persona canvia d'idioma en una adreça amb ?idioma=, l'adreça el segueix.
function actualitzarAdreca() {
  if (!parametres.has('idioma')) return;
  parametres.set('idioma', idiomaActual());
  history.replaceState(null, '', '?' + parametres.toString() + window.location.hash);
  posarCanonica();
}

function traduirPagina() {
  aplicarTraduccions();
  // El títol (<title data-i18n>) ja el tradueix el nucli; la descripció i
  // el text alternatiu dels logotips van en atributs que el nucli no coneix.
  document.querySelectorAll('[data-i18n-content]').forEach((el) => {
    el.setAttribute('content', t(el.dataset.i18nContent));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  // Botons de WhatsApp: el missatge preescrit, en l'idioma de la pàgina.
  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    // encodeURIComponent i no URLSearchParams: WhatsApp no entén «+» com a espai.
    el.href = el.href.split('?')[0] + '?text=' + encodeURIComponent(t(el.dataset.whatsapp));
  });
}

traduirPagina();
posarCanonica();
inicialitzarSelectorIdioma('selector-idioma', { recarregar: false });
document.addEventListener('canvi-idioma', () => {
  traduirPagina();
  actualitzarAdreca();
});
inicialitzarCarrusel(document.querySelector('.carrusel'));
