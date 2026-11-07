// Carrusel de les apps de la portada. No passa sol: es mou amb les fletxes,
// els punts, el teclat o lliscant (la pista és un scroll horitzontal amb
// scroll-snap, de manera que sense JS també es pot lliscar).
//
// La fitxa actual es calcula sempre de la posició de la pista (scrollLeft),
// en el moment del clic: no depèn de cap estat que s'actualitzi amb retard,
// i un clic mentre encara llisca avança igualment.
export function inicialitzarCarrusel(arrel) {
  if (!arrel) return;
  const pista = arrel.querySelector('.carrusel__pista');
  const fitxes = [...pista.children];
  const punts = [...arrel.querySelectorAll('.carrusel__punt')];
  let desti = null; // la fitxa on s'està anant, mentre llisca

  const fitxaVisible = () => Math.round(pista.scrollLeft / pista.clientWidth);

  const marcar = (index) => {
    punts.forEach((punt, i) => punt.setAttribute('aria-current', String(i === index)));
    fitxes.forEach((fitxa, i) => fitxa.setAttribute('aria-hidden', String(i !== index)));
  };

  const anarA = (index) => {
    desti = (index + fitxes.length) % fitxes.length;
    pista.scrollTo({ left: desti * pista.clientWidth, behavior: 'smooth' });
    marcar(desti);
  };

  const moure = (pas) => anarA((desti ?? fitxaVisible()) + pas);

  arrel.querySelector('[data-carrusel="anterior"]').addEventListener('click', () => moure(-1));
  arrel.querySelector('[data-carrusel="seguent"]').addEventListener('click', () => moure(1));
  punts.forEach((punt, i) => punt.addEventListener('click', () => anarA(i)));

  // En acabar de lliscar (amb el dit, el ratolí o després d'un clic), la
  // fitxa que es veu és l'actual. "scrollend" no hi és a tots els
  // navegadors: si no, s'espera que el scroll s'aturi una estona.
  let espera;
  const enAcabar = () => {
    desti = null;
    marcar(fitxaVisible());
  };
  if ('onscrollend' in window) {
    pista.addEventListener('scrollend', enAcabar);
  } else {
    pista.addEventListener('scroll', () => {
      clearTimeout(espera);
      espera = setTimeout(enAcabar, 150);
    });
  }

  arrel.addEventListener('keydown', (esdeveniment) => {
    if (esdeveniment.target.closest('input, textarea')) return;
    if (esdeveniment.key === 'ArrowLeft') {
      esdeveniment.preventDefault();
      moure(-1);
    } else if (esdeveniment.key === 'ArrowRight') {
      esdeveniment.preventDefault();
      moure(1);
    }
  });

  marcar(fitxaVisible());
}
