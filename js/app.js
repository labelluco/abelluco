// Web de L'Abelluco: tradueix la pàgina (català, castellà i anglès) amb el
// sistema d'idiomes del nucli, el mateix de les apps, i mou el carrusel.
// Totes les pàgines (inici, apps, serveis, qui soc) carreguen aquest fitxer.
import { configurarI18n, aplicarTraduccions, inicialitzarSelectorIdioma, t } from '../nucli/js/i18n/i18n.js';
import { ES } from './i18n/es.js';
import { EN } from './i18n/en.js';
import { inicialitzarCarrusel } from './carrusel.js';

configurarI18n({
  clau: 'abelluco-idioma',
  idiomes: ['ca', 'es', 'en'],
  perDefecte: 'en',
  diccionaris: { es: ES, en: EN },
});

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
}

traduirPagina();
inicialitzarSelectorIdioma('selector-idioma', { recarregar: false });
document.addEventListener('canvi-idioma', traduirPagina);
inicialitzarCarrusel(document.querySelector('.carrusel'));
