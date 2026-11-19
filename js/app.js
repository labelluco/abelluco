// Web de L'Abelluco: selector d'idioma i carrusel. Totes les pàgines (inici,
// apps, serveis, qui soc, contacte) carreguen aquest fitxer.
//
// Cada idioma té les seves pàgines: el català a l'arrel, el castellà a es/ i
// l'anglès a en/, generades per eines/generar-idiomes.mjs. Aquí no es tradueix
// res: el selector porta a la mateixa pàgina en l'altre idioma (les adreces
// surten dels <link rel="alternate" hreflang> de la capçalera).
import { configurarI18n, idiomaActual, idiomes } from '../nucli/js/i18n/i18n.js';
import { inicialitzarCarrusel } from './carrusel.js';

const CLAU = 'abelluco-idioma';
configurarI18n({ clau: CLAU, idiomes: ['ca', 'es', 'en'], perDefecte: 'en' });

const idiomaPagina = document.documentElement.lang;

// Adreça d'aquesta pàgina en un altre idioma, al mateix servidor (també en local).
function adrecaEn(idioma) {
  const enllac = document.querySelector(`link[rel="alternate"][hreflang="${idioma}"]`);
  return new URL(enllac.href).pathname + window.location.hash;
}

function desarIdioma(idioma) {
  try {
    localStorage.setItem(CLAU, idioma);
  } catch {
    // Sense emmagatzematge (mode privat...): no es recorda per a la propera visita.
  }
}

// On ha d'anar qui arriba a aquesta pàgina:
//  - adreces antigues amb ?idioma=ca|es|en: a la pàgina d'aquell idioma;
//  - a les pàgines catalanes (les de l'arrel, que són les que es comparteixen),
//    qui ja va triar un idioma o té el navegador en castellà o anglès va a la
//    seva versió. Els robots no: han de veure cada pàgina tal com és.
function idiomaDesti() {
  const parametre = new URLSearchParams(window.location.search).get('idioma');
  if (idiomes().includes(parametre)) {
    desarIdioma(parametre);
    return parametre;
  }
  const esRobot = /bot|crawl|spider|slurp|Google-InspectionTool|Lighthouse|facebookexternalhit|WhatsApp/i.test(navigator.userAgent);
  if (idiomaPagina === 'ca' && !esRobot) return idiomaActual();
  return idiomaPagina;
}

const desti = idiomaDesti();
if (desti !== idiomaPagina) {
  window.location.replace(adrecaEn(desti));
} else if (window.location.search) {
  history.replaceState(null, '', window.location.pathname + window.location.hash);
}

// Selector: enllaços normals (els cercadors també els segueixen).
function pintarSelector() {
  const contenidor = document.getElementById('selector-idioma');
  if (!contenidor) return;
  contenidor.innerHTML = idiomes().map((idioma) => {
    const actiu = idioma === idiomaPagina;
    return `<a class="selector-idioma__opcio${actiu ? ' selector-idioma__opcio--actiu' : ''}" href="${adrecaEn(idioma)}" hreflang="${idioma}" lang="${idioma}"${actiu ? ' aria-current="true"' : ''}>${idioma.toUpperCase()}</a>`;
  }).join('');
  contenidor.querySelectorAll('a').forEach((enllac) => {
    enllac.addEventListener('click', () => desarIdioma(enllac.hreflang));
  });
}

pintarSelector();
inicialitzarCarrusel(document.querySelector('.carrusel'));
