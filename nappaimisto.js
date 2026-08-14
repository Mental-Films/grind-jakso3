/* GRIND jakso 3 — haamunäppäimistö.
 *
 * Sovelluksen oma näppäimistö, ei iOS:n. Kaksi syytä:
 *
 * 1. iOS:n näppäimistö tuo ennakoivan tekstipalkin ja automaattikorjauksen.
 *    Yksikin näppäilyvirhe pilaisi oton.
 * 2. Näyttelijän ei tarvitse osua oikeisiin näppäimiin. Mikä tahansa
 *    painallus tuottaa seuraavan merkin käsikirjoituksen tekstistä, joten
 *    Alvina saa naputella luontevasti ja katsoa ylös kesken lauseen —
 *    ruudulle tulee joka otossa täsmälleen oikea teksti.
 *
 * Kirjoitusvirhe ja sen korjaus on tuettu: teksti voi ilmestyä ensin
 * väärin ja korjautua. Se lukee kameralle hermostuneisuutena.
 */
(function (global) {
  'use strict';

  /* iPadin pystynäppäimistö. Leveämpi kuin puhelimessa ja return on
     toisella rivillä. */
  var RIVIT = [
    ['q','w','e','r','t','y','u','i','o','p','⌫'],
    ['a','s','d','f','g','h','j','k','l','return'],
    ['⇧','z','x','c','v','b','n','m',',','.','⇧'],
    ['.?123','😀','väli','.?123','⌨']
  ];
  var LEVEAT = { '⌫': 'leveä', 'return': 'leveä', '⇧': 'leveä', '.?123': 'leveä',
                 'väli': 'vali', '⌨': 'leveä', '😀': 'leveä' };

  /* ── Askelten rakentaminen ───────────────────────────────────────────────
     Teksti puretaan askelsarjaksi: merkki kerrallaan, ja kirjoitusvirheen
     kohdalla väärä sana, poistot ja oikea sana. Yksi painallus = yksi askel. */
  function askeleet(teksti, virhe) {
    var lista = [];
    function kirjoita(jono) {
      for (var i = 0; i < jono.length; i++) lista.push({ tyyppi: 'merkki', arvo: jono[i] });
    }

    if (!virhe || !virhe.oikein || teksti.indexOf(virhe.oikein) === -1) {
      kirjoita(teksti);
      return lista;
    }

    var kohta = teksti.indexOf(virhe.oikein);
    kirjoita(teksti.slice(0, kohta));
    kirjoita(virhe.vaarin);

    /* Poistetaan vain se osa, joka menee väärin — yhteinen alkuosa jää. */
    var yhteinen = 0;
    while (yhteinen < virhe.vaarin.length && yhteinen < virhe.oikein.length &&
           virhe.vaarin[yhteinen] === virhe.oikein[yhteinen]) yhteinen++;
    for (var p = virhe.vaarin.length; p > yhteinen; p--) lista.push({ tyyppi: 'poisto' });

    kirjoita(virhe.oikein.slice(yhteinen));
    kirjoita(teksti.slice(kohta + virhe.oikein.length));
    return lista;
  }

  /* ── Näppäimistö ────────────────────────────────────────────────────────
     onMuutos(teksti, valmis) kutsutaan jokaisen askeleen jälkeen. */
  function Nappaimisto(asetukset) {
    this.a = asetukset || {};
    this.askeleet = askeleet(this.a.teksti || '', this.a.virhe);
    this.indeksi = 0;
    this.teksti = '';
    this.automaatti = null;
    this.el = this.rakenna();
  }

  Nappaimisto.prototype.rakenna = function () {
    var self = this;
    var n = document.createElement('div');
    n.className = 'grumbl-nappaimisto';

    RIVIT.forEach(function (rivi) {
      var r = document.createElement('div');
      r.className = 'grumbl-rivi';
      rivi.forEach(function (merkki) {
        var b = document.createElement('button');
        b.className = 'grumbl-nappain' +
          (LEVEAT[merkki] ? ' ' + LEVEAT[merkki] : '') +
          (merkki.length > 1 && merkki !== 'väli' ? ' toiminto' : '');
        b.textContent = merkki === 'väli' ? '' : merkki;
        b.setAttribute('aria-label', merkki);
        /* Mikä tahansa näppäin vie tekstiä eteenpäin. Näyttelijän ei
           tarvitse osua oikeaan. */
        b.addEventListener('pointerdown', function (t) {
          t.preventDefault();
          self.askel();
        });
        r.appendChild(b);
      });
      n.appendChild(r);
    });
    return n;
  };

  Nappaimisto.prototype.askel = function () {
    if (this.indeksi >= this.askeleet.length) {
      if (this.a.onMuutos) this.a.onMuutos(this.teksti, true);
      return;
    }
    var a = this.askeleet[this.indeksi++];
    if (a.tyyppi === 'poisto') this.teksti = this.teksti.slice(0, -1);
    else this.teksti += a.arvo;
    if (this.a.onMuutos) this.a.onMuutos(this.teksti, this.indeksi >= this.askeleet.length);
  };

  Nappaimisto.prototype.nollaa = function () {
    this.indeksi = 0;
    this.teksti = '';
    this.automaattiPois();
    if (this.a.onMuutos) this.a.onMuutos('', false);
  };

  /* Automaattikirjoitus operaattorille: jos ohjaaja haluaa tekstin
     ilmestyvän ilman näyttelijän kosketusta. Tahti on merkkiä sekunnissa. */
  Nappaimisto.prototype.automaattiPaalle = function (merkkiaSekunnissa) {
    var self = this;
    this.automaattiPois();
    var vali = 1000 / (merkkiaSekunnissa || 6.5);
    this.automaatti = setInterval(function () {
      if (self.indeksi >= self.askeleet.length) { self.automaattiPois(); return; }
      self.askel();
    }, vali);
  };

  Nappaimisto.prototype.automaattiPois = function () {
    clearInterval(this.automaatti);
    this.automaatti = null;
  };

  global.GRIND = global.GRIND || {};
  global.GRIND.Nappaimisto = Nappaimisto;
  global.GRIND.nappaimistoAskeleet = askeleet;
})(window);
