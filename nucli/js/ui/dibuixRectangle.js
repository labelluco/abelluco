// Dibuix d'un rectangle recte a la pantalla (orientat al nord geogràfic)
// sobre un mapa Leaflet: un toc a una cantonada i un altre a l'oposada
// (entre tots dos, amb ratolí, el rectangle segueix el cursor). Després,
// les cantonades s'arrosseguen per canviar-ne la mida i el centre per moure'l.
//
// El rectangle es defineix en lat/lng, és a dir, recte a la pantalla: és
// el que la persona veu i espera. Passat a metres (UTM, el sistema del model
// 3D), continua sent un rectangle (totes dues projeccions conserven els
// angles a aquesta escala), però girat l'angle de convergència de la
// quadrícula UTM respecte al nord geogràfic (de 0° a uns 3-4° a Espanya).
// Aquest gir s'exposa a "rotacio", i el generador de models el desfà
// perquè el bloc imprès quedi recte, amb el nord geogràfic amunt.
//
// Mateixa interfície que DibuixPoligon (activar, desactivar, desfer,
// netejar, punts, onCanvi), perquè l'app les pugui intercanviar; a més,
// exposa crs, exteriorUtm, rotacio i mides.

import { latLngAUtm } from '../geometria/projeccio.js';
import { crsPer } from '../paisos/paisos.js';

/**
 * Les quatre cantonades d'un rectangle recte (en els eixos x, y que es
 * donin: lng/lat o metres) a partir de dues cantonades oposades
 * qualssevol, en sentit antihorari des de la sud-oest.
 * @param {[number, number]} a @param {[number, number]} b  [x, y]
 */
export function cantonadesRectangle(a, b) {
  const minX = Math.min(a[0], b[0]);
  const maxX = Math.max(a[0], b[0]);
  const minY = Math.min(a[1], b[1]);
  const maxY = Math.max(a[1], b[1]);
  return [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
}

// [lat, lng] <-> [x = lng, y = lat]
const aXY = ([lat, lng]) => [lng, lat];
const aLatLng = ([lng, lat]) => [lat, lng];

export class DibuixRectangle {
  /**
   * @param {L.Map} mapa
   * @param {{color?: string, onCanvi?: (punts: Array<[number, number]>) => void}} opcions
   */
  constructor(mapa, { color = '#396a49', onCanvi = () => {} } = {}) {
    this._mapa = mapa;
    this._color = color;
    this._onCanvi = onCanvi;
    this._capa = L.layerGroup();
    this._actiu = false;
    this.crs = null;
    this._a = null; // primera cantonada [lat, lng]
    this._b = null; // cantonada oposada [lat, lng], null mentre es dibuixa
    this._cursor = null; // posició provisional de la segona cantonada
    this._gestorClic = (event) => this._clic([event.latlng.lat, event.latlng.lng]);
    this._gestorMoviment = (event) => this._moviment([event.latlng.lat, event.latlng.lng]);
  }

  /** Cantonades [lat, lng] (SO, SE, NE, NO), o la primera mentre es dibuixa. */
  get punts() {
    if (this._a && this._b) return cantonadesRectangle(aXY(this._a), aXY(this._b)).map(aLatLng);
    return this._a ? [this._a] : [];
  }

  /** Cantonades en metres (sistema this.crs), en el mateix ordre que punts. */
  get exteriorUtm() {
    return this._a && this._b ? this.punts.map((p) => latLngAUtm(p, this.crs)) : [];
  }

  /** Gir (radians) del costat sud del rectangle respecte a l'eix x de la quadrícula UTM. */
  get rotacio() {
    const [so, se] = this.exteriorUtm;
    return so ? Math.atan2(se[1] - so[1], se[0] - so[0]) : 0;
  }

  /** Amplada i alçada reals en metres (o null). */
  get mides() {
    const [so, se, , no] = this.exteriorUtm;
    if (!so) return null;
    return { ample: Math.hypot(se[0] - so[0], se[1] - so[1]), alt: Math.hypot(no[0] - so[0], no[1] - so[1]) };
  }

  activar() {
    if (this._actiu) return;
    this._actiu = true;
    this._capa.addTo(this._mapa);
    this._mapa.on('click', this._gestorClic);
    this._mapa.on('mousemove', this._gestorMoviment);
    this._mapa.getContainer().classList.add('mapa--dibuixant');
    this._pintar();
  }

  desactivar() {
    if (!this._actiu) return;
    this._actiu = false;
    this._mapa.off('click', this._gestorClic);
    this._mapa.off('mousemove', this._gestorMoviment);
    this._mapa.getContainer().classList.remove('mapa--dibuixant');
    this._capa.remove();
  }

  /** Desfer: treu la segona cantonada (es torna a dibuixar des de la primera), o la primera. */
  desfer() {
    if (this._b) this._b = null;
    else this._a = null;
    this._cursor = null;
    this._canvi();
  }

  netejar() {
    this._a = null;
    this._b = null;
    this._cursor = null;
    this._canvi();
  }

  /** Cert si dues cantonades fan un rectangle de debò (no dos tocs gairebé al mateix lloc). */
  _valid(a, b) {
    const pa = this._mapa.latLngToContainerPoint(a);
    const pb = this._mapa.latLngToContainerPoint(b);
    return Math.abs(pa.x - pb.x) >= 4 && Math.abs(pa.y - pb.y) >= 4;
  }

  _clic(punt) {
    if (!this._a || this._b) {
      // Primer toc, o un toc nou quan ja n'hi havia un: rectangle nou.
      this.crs = crsPer(punt);
      this._a = punt;
      this._b = null;
    } else if (this._valid(this._a, punt)) {
      this._b = punt;
    }
    this._cursor = null;
    this._canvi();
  }

  _moviment(punt) {
    if (!this._a || this._b) return;
    this._cursor = punt;
    this._pintarForma(cantonadesRectangle(aXY(this._a), aXY(punt)).map(aLatLng), true);
  }

  _canvi() {
    this._pintar();
    this._onCanvi(this.punts);
  }

  _pintarForma(cantonades, provisional) {
    this._forma?.remove();
    this._forma = L.polygon(cantonades, {
      color: this._color,
      weight: 3,
      fillOpacity: 0.2,
      dashArray: provisional ? '6 6' : null,
      interactive: false,
    }).addTo(this._capa);
  }

  _pintar() {
    this._capa.clearLayers();
    this._forma = null;
    if (!this._a) return;

    if (!this._b) {
      // Només la primera cantonada: un punt fix (i, amb ratolí, la forma provisional).
      L.marker(this._a, {
        icon: L.divIcon({ className: 'vertex-dibuix', iconSize: [16, 16] }),
        interactive: false,
        keyboard: false,
      }).addTo(this._capa);
      if (this._cursor) this._pintarForma(cantonadesRectangle(aXY(this._a), aXY(this._cursor)).map(aLatLng), true);
      return;
    }

    const cantonades = this.punts;
    this._pintarForma(cantonades, false);

    // Cantonades: en arrossegar-ne una, l'oposada queda fixa.
    cantonades.forEach((cantonada, i) => {
      const oposada = cantonades[(i + 2) % 4];
      const marcador = L.marker(cantonada, {
        draggable: true,
        icon: L.divIcon({ className: 'vertex-dibuix', iconSize: [16, 16] }),
        keyboard: false,
      });
      marcador.on('drag', (event) => {
        const { lat, lng } = event.target.getLatLng();
        this._pintarForma(cantonadesRectangle(aXY(oposada), [lng, lat]).map(aLatLng), false);
      });
      marcador.on('dragend', (event) => {
        const { lat, lng } = event.target.getLatLng();
        if (this._valid(oposada, [lat, lng])) {
          this._a = oposada;
          this._b = [lat, lng];
        }
        this._canvi();
      });
      marcador.on('click', (event) => L.DomEvent.stop(event));
      marcador.addTo(this._capa);
    });

    // Centre: arrossegar-lo mou tot el rectangle.
    const centre = [(cantonades[0][0] + cantonades[2][0]) / 2, (cantonades[0][1] + cantonades[2][1]) / 2];
    const marcadorCentre = L.marker(centre, {
      draggable: true,
      icon: L.divIcon({ className: 'centre-dibuix', html: '✥', iconSize: [24, 24] }),
      keyboard: false,
    });
    const desplacament = (event) => {
      const { lat, lng } = event.target.getLatLng();
      return [lat - centre[0], lng - centre[1]];
    };
    marcadorCentre.on('drag', (event) => {
      const [dLat, dLng] = desplacament(event);
      this._pintarForma(cantonades.map(([lat, lng]) => [lat + dLat, lng + dLng]), false);
    });
    marcadorCentre.on('dragend', (event) => {
      const [dLat, dLng] = desplacament(event);
      this._a = [this._a[0] + dLat, this._a[1] + dLng];
      this._b = [this._b[0] + dLat, this._b[1] + dLng];
      // Si el rectangle s'ha mogut molt lluny, pot tocar-li un altre sistema.
      this.crs = crsPer(this._a);
      this._canvi();
    });
    marcadorCentre.on('click', (event) => L.DomEvent.stop(event));
    marcadorCentre.addTo(this._capa);
  }
}
