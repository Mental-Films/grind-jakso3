/* GRIND jakso 3 "Pelkääjän paikka" — offline-välimuisti.
 *
 * Proppi ajetaan lentotilassa, joten kaiken on oltava laitteessa ennen ottoa.
 * Tämä esilataa koko propin ensimmäisellä avauksella.
 *
 * PÄIVITYS: nosta VERSIO, kun mitä tahansa muuttuu. Vanha välimuisti
 * poistetaan ja uusi ladataan seuraavalla verkkoyhteydellisellä avauksella.
 * Ajossa oleva versionumero näkyy propin ohjauspalkissa.
 */

var VERSIO = 'grind3-v0.9.0';

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
  'kaavio.js',
  'nappaimisto.js',
  'grumbl.css',
  'tabb.css',
  'candlr.css',
  'glitch.js',
  'glitch.css',
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
  'REFERENSSIT.md',
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

  /* ?tuore=1 ohittaa välimuistin kokonaan. */
  if (osoite.search.indexOf('tuore') !== -1) {
    t.respondWith(fetch(pyynto).catch(function () {
      return caches.match(pyynto, { ignoreSearch: true });
    }));
    return;
  }

  /* VERKKO ENSIN, välimuisti varana — ei toisin päin.
   *
   * Välimuisti ensin olisi nopeampi, mutta se tarkoittaa että laitteessa voi
   * pyöriä vanha versio ilman että kukaan huomaa. Kuvauspaikalla on
   * tärkeämpää tietää mikä build ajaa kuin säästää millisekunteja.
   *
   * Lentotilassa fetch epäonnistuu heti (ei reittiä verkkoon), joten
   * varaan siirrytään käytännössä viiveettä. Aikakatkaisu on siltä varalta,
   * että laite on kiinni verkossa joka ei vastaa — esimerkiksi kuvauspaikan
   * tukiasema ilman internetiä. Ilman sitä proppi jäisi odottamaan. */
  var AIKAKATKAISU = 2500;

  t.respondWith(
    caches.match(pyynto, { ignoreSearch: true }).then(function (osuma) {
      /* cache: 'no-cache' pakottaa selaimen tarkistamaan palvelimelta.
         Ilman tätä verkko-ensin ei auta mitään: selaimen OMA HTTP-välimuisti
         vastaa fetchiin vanhalla tiedostolla eikä pyyntö koskaan lähde
         verkkoon. Tämä on eri välimuisti kuin service workerin oma. */
      var haettava;
      try {
        haettava = pyynto.mode === 'navigate'
          ? new Request(pyynto.url, { cache: 'no-cache', credentials: 'same-origin' })
          : new Request(pyynto, { cache: 'no-cache' });
      } catch (e) {
        haettava = pyynto;
      }

      var verkosta = new Promise(function (valmis, hylkaa) {
        var ajastin = setTimeout(function () { hylkaa(new Error('aikakatkaisu')); }, AIKAKATKAISU);
        fetch(haettava).then(function (vastaus) {
          clearTimeout(ajastin);
          if (vastaus && vastaus.ok) {
            var kopio = vastaus.clone();
            caches.open(VERSIO).then(function (v) { v.put(pyynto, kopio); });
          }
          valmis(vastaus);
        }).catch(function (e) { clearTimeout(ajastin); hylkaa(e); });
      });

      return verkosta.catch(function () {
        if (osuma) return osuma;
        throw new Error('ei verkkoa eikä välimuistia: ' + osoite.pathname);
      });
    })
  );
});
