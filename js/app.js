// Web de L'Abelluco: només tradueix la pàgina (català, castellà i anglès)
// amb el sistema d'idiomes del nucli, el mateix que fan servir les apps.
import { configurarI18n, aplicarTraduccions, inicialitzarSelectorIdioma, t } from '../nucli/js/i18n/i18n.js';
import { ES } from './i18n/es.js';
import { EN } from './i18n/en.js';

const TITOL = "L'Abelluco · Apps lliures per conèixer el terreny";
const DESCRIPCIO = 'Apps lliures per veure, mesurar i entendre el relleu de qualsevol lloc del món: models 3D per imprimir, pendents, visibilitat, hores de sol i rutes.';

configurarI18n({
  clau: 'abelluco-idioma',
  idiomes: ['ca', 'es', 'en'],
  perDefecte: 'en',
  diccionaris: { es: ES, en: EN },
});

function traduirPagina() {
  aplicarTraduccions();
  document.title = t(TITOL);
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(DESCRIPCIO));
}

traduirPagina();
inicialitzarSelectorIdioma('selector-idioma', { recarregar: false });
document.addEventListener('canvi-idioma', traduirPagina);
