/* GRIND jakso 3 "Pelkääjän paikka" — offline-välimuisti.
 *
 * Proppi ajetaan lentotilassa, joten kaiken on oltava laitteessa ennen ottoa.
 * Tämä esilataa koko propin ensimmäisellä avauksella.
 *
 * PÄIVITYS: nosta VERSIO, kun mitä tahansa muuttuu. Vanha välimuisti
 * poistetaan ja uusi ladataan seuraavalla verkkoyhteydellisellä avauksella.
 * Ajossa oleva versionumero näkyy propin ohjauspalkissa.
 */

var VERSIO = 'grind3-v0.2.0';

/* Pakolliset. Jos yksikin puuttuu, asennus epäonnistuu ja se on oikein —
   silloin proppi ei väitä olevansa offline-valmis. */
var PAKOLLISET = [
  './',
  'index.html',
  'proppi_tabletti.html',
  'proppi_puhelin.html',
  'laitetiedot.html',
  'runko.css',
  'moottori.js',
  'kartta.js',
  'hopp.css',
  'teema.json',
  'sisalto.json'
];

/* Vapaaehtoiset: kuvakkeet, kirjasimet ja graafikon assetit. Näiden
   puuttuminen ei saa kaataa asennusta — proppi toimii paikkamerkeillä. */
var VAPAAEHTOISET = [
  'manifest_tabletti.json',
  'manifest_puhelin.json',
  'KAYTTOONOTTO.md',
  'README.md',
  'SUUNNITELMA.md',
  'BRIEF_GRAAFIKKO.md',
  'assets/ikoni_tabletti.png',
  'assets/ikoni_puhelin.png',
  'assets/fontit/IBMPlexSans-Regular.woff2',
  'assets/fontit/IBMPlexSans-SemiBold.woff2',
  'assets/fontit/IBMPlexMono-Regular.woff2',
  'assets/fontit/IBMPlexMono-SemiBold.woff2',
  'assets/hopp_kartta.svg',
  'assets/logo_candlr.svg',
  'assets/logo_grumbl.svg',
  'assets/logo_tabb.svg',
  'assets/logo_hopp.svg',
  'assets/rpr_tunnus.svg'
];

self.addEventListener('install', function (t) {
  t.waitUntil(
    caches.open(VERSIO).then(function (varasto) {
      return varasto.addAll(PAKOLLISET).then(function () {
        return Promise.all(VAPAAEHTOISET.map(function (polku) {
          return varasto.add(polku).catch(function () { /* ei vielä olemassa */ });
        }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (t) {
  t.waitUntil(
    caches.keys().then(function (avaimet) {
      return Promise.all(avaimet.map(function (a) {
        if (a !== VERSIO) return caches.delete(a);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (t) {
  var pyynto = t.request;
  if (pyynto.method !== 'GET') return;

  var osoite = new URL(pyynto.url);
  if (osoite.origin !== location.origin) return;

  /* ?tuore=1 ohittaa välimuistin kokonaan. Graafikko käyttää tätä, kun
     teema.json tai sisalto.json ei näytä päivittyneen. */
  if (osoite.search.indexOf('tuore') !== -1) {
    t.respondWith(fetch(pyynto).catch(function () { return caches.match(pyynto, { ignoreSearch: true }); }));
    return;
  }

  /* Sivupyyntö: välimuisti ensin, jotta lentotila toimii. Verkko päivittää
     taustalla, jotta seuraava avaus on tuore. */
  t.respondWith(
    caches.match(pyynto, { ignoreSearch: true }).then(function (osuma) {
      var verkosta = fetch(pyynto).then(function (vastaus) {
        if (vastaus && vastaus.ok) {
          var kopio = vastaus.clone();
          caches.open(VERSIO).then(function (v) { v.put(pyynto, kopio); });
        }
        return vastaus;
      }).catch(function () { return osuma; });

      return osuma || verkosta;
    })
  );
});
