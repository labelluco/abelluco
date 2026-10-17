// Imatge aèria per texturar un model, en dues versions:
//
//  - urlOrtofoto: PNOA de l'IGN (Espanya, ~25 cm/píxel), via WMS GetMap
//    directament en el sistema de la zona (EPSG:25830, o EPSG:4083 a les
//    Canàries): la imatge coincideix exactament amb el requadre del model.
//
//  - urlSentinel2: Sentinel-2 cloudless 2016 d'EOX (tot el món, 10 m/píxel),
//    en EPSG:4326. Es fa servir la versió 2016 perquè és l'única amb
//    llicència CC BY 4.0, que permet l'ús comercial amb atribució; les
//    dels anys següents són CC BY-NC-SA (no comercial).
//
// Tots dos admeten CORS (comprovat el 2026-10-17) i es poden fer servir
// com a textura WebGL. Aquí només es construeix l'URL: carregar-la és
// cosa de la interfície.

const URL_WMS_PNOA = 'https://www.ign.es/wms-inspire/pnoa-ma';
const URL_WMS_EOX = 'https://tiles.maps.eox.at/wms';

// L'IGN ofereix la PNOA de les Canàries en REGCAN95 (EPSG:4083), que a
// escala de centímetres coincideix amb l'EPSG:32628 que fem servir allà.
const CRS_WMS_PNOA = { 'EPSG:25830': 'EPSG:25830', 'EPSG:32628': 'EPSG:4083' };

// Textos d'atribució oficials de cada font (no es tradueixen).
export const ATRIBUCIO_PNOA = 'PNOA © Instituto Geográfico Nacional (CC BY 4.0)';
export const ATRIBUCIO_SENTINEL2 =
  'Sentinel-2 cloudless 2016 by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016), CC BY 4.0';

function mides(ample, alt, metresPerPixel, maxPixels) {
  const costatMaxim = Math.min(maxPixels, Math.ceil(Math.max(ample, alt) / metresPerPixel));
  const escala = Math.max(costatMaxim, 64) / Math.max(ample, alt);
  return { amplada: Math.max(1, Math.round(ample * escala)), alcada: Math.max(1, Math.round(alt * escala)) };
}

/**
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} requadre En metres, en el sistema crs
 * @param {number} [maxPixels] Costat més llarg de la imatge
 * @param {string} [crs]
 * @returns {{url: string, amplada: number, alcada: number}}
 */
export function urlOrtofoto(requadre, maxPixels = 2048, crs = 'EPSG:25830') {
  // La PNOA té ~25 cm/píxel: no té sentit demanar-ne més.
  const { amplada, alcada } = mides(requadre.maxX - requadre.minX, requadre.maxY - requadre.minY, 0.25, maxPixels);
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    LAYERS: 'OI.OrthoimageCoverage',
    STYLES: '',
    CRS: CRS_WMS_PNOA[crs] ?? crs,
    BBOX: `${requadre.minX},${requadre.minY},${requadre.maxX},${requadre.maxY}`,
    WIDTH: String(amplada),
    HEIGHT: String(alcada),
    FORMAT: 'image/jpeg',
  });
  return { url: `${URL_WMS_PNOA}?${params.toString()}`, amplada, alcada };
}

/**
 * @param {{minLat: number, minLng: number, maxLat: number, maxLng: number}} requadre En graus
 * @param {number} [maxPixels]
 * @returns {{url: string, amplada: number, alcada: number}}
 */
export function urlSentinel2(requadre, maxPixels = 1024) {
  const latMitjana = (requadre.minLat + requadre.maxLat) / 2;
  const ample = (requadre.maxLng - requadre.minLng) * 111320 * Math.cos((latMitjana * Math.PI) / 180);
  const alt = (requadre.maxLat - requadre.minLat) * 110574;
  // 10 m/píxel; es demana una mica més (5 m) perquè el navegador
  // n'interpoli menys i les vores es vegin menys pixelades.
  const { amplada, alcada } = mides(ample, alt, 5, maxPixels);
  // WMS 1.1.1: l'ordre del BBOX en EPSG:4326 és lng,lat (en 1.3.0 seria lat,lng).
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    LAYERS: 's2cloudless',
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `${requadre.minLng},${requadre.minLat},${requadre.maxLng},${requadre.maxLat}`,
    WIDTH: String(amplada),
    HEIGHT: String(alcada),
    FORMAT: 'image/jpeg',
  });
  return { url: `${URL_WMS_EOX}?${params.toString()}`, amplada, alcada };
}
