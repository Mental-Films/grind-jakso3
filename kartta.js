/* GRIND jakso 3 — karttamoottori.
 *
 * Piirtää navigaattorikartan canvakselle: tiestö, metsä, vesi, reitti ja
 * ajoneuvon merkki. Kartta liikkuu, kääntyy ajosuunnan mukaan ja on
 * siirrettävissä mihin tahansa.
 *
 * Tiestö EI ole kuvatiedosto vaan generoidaan siemenluvusta. Kolme syytä:
 *   1. Sijaintia voi vaihtaa — uusi siemen, uusi kaupunki, sama tyyli
 *   2. Toimii lentotilassa ilman karttapalvelua ja ilman lisenssiä
 *   3. Sama siemen piirtää saman kartan joka otossa (jatkuvuus)
 *
 * Koordinaatisto on metrejä, origo kaupungin keskustassa. Reitti syntyy
 * ensin ja tiestö sen ympärille, jolloin reitti on aina tiellä.
 *
 * Oikean maantieteen käyttö (PMTiles-vektorikartta) on mahdollinen
 * myöhemmin: kamera, reitti ja ajologiikka eivät muutu, vain
 * piirraMaasto()-kerros vaihtuu. Ks. SUUNNITELMA.md kohta 13.
 */
(function (global) {
  'use strict';

  function siemen(luku) {
    var a = luku >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Geometrian apuja ─────────────────────────────────────────────────── */

  function pituus(pisteet) {
    var s = 0;
    for (var i = 1; i < pisteet.length; i++) {
      s += Math.hypot(pisteet[i][0] - pisteet[i - 1][0], pisteet[i][1] - pisteet[i - 1][1]);
    }
    return s;
  }

  /* Piste ja suunta annetulla matkalla polkua pitkin. Tällä ajoneuvo
     kulkee reittiä eikä leijaile sen vieressä. */
  function kohdassa(pisteet, matka) {
    var kuljettu = 0;
    for (var i = 1; i < pisteet.length; i++) {
      var a = pisteet[i - 1], b = pisteet[i];
      var d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (kuljettu + d >= matka || i === pisteet.length - 1) {
        var t = d === 0 ? 0 : Math.max(0, Math.min(1, (matka - kuljettu) / d));
        return {
          x: a[0] + (b[0] - a[0]) * t,
          y: a[1] + (b[1] - a[1]) * t,
          suunta: Math.atan2(b[1] - a[1], b[0] - a[0])
        };
      }
      kuljettu += d;
    }
    var v = pisteet[pisteet.length - 1];
    return { x: v[0], y: v[1], suunta: 0 };
  }

  /* Pyöristää murtoviivan kaarevaksi. Suora ruudukko näyttää piirretyltä,
     pehmennetty näyttää tieltä. */
  function pehmenna(pisteet, kierrokset) {
    var ulos = pisteet;
    for (var k = 0; k < (kierrokset || 1); k++) {
      var uusi = [ulos[0]];
      for (var i = 0; i < ulos.length - 1; i++) {
        var a = ulos[i], b = ulos[i + 1];
        uusi.push([a[0] + (b[0] - a[0]) * 0.25, a[1] + (b[1] - a[1]) * 0.25]);
        uusi.push([a[0] + (b[0] - a[0]) * 0.75, a[1] + (b[1] - a[1]) * 0.75]);
      }
      uusi.push(ulos[ulos.length - 1]);
      ulos = uusi;
    }
    return ulos;
  }

  /* ══ Maaston generointi ═════════════════════════════════════════════════
     Järjestys on tärkeä: reitti ensin, tiestö sen ympärille. */

  function generoi(asetukset) {
    var r = siemen(asetukset.siemen);
    var maasto = { tiet: [], metsat: [], vedet: [], korttelit: [] };

    /* 1. Selkäranka = ajettava reitti. Kaupungista ulos, maaseudun halki,
          lopuksi metsätielle joka päättyy umpeen. */
    var selka = [[0, 0]];
    var x = 0, y = 0, kulma = -Math.PI / 2;   // kohti pohjoista
    var jaksot = [
      { askelia: 7,  pituus: 200, heitto: 0.38, luokka: 'valtavayla' },
      { askelia: 9,  pituus: 260, heitto: 0.30, luokka: 'maantie' },
      { askelia: 10, pituus: 150, heitto: 0.62, luokka: 'metsatie' }
    ];
    var rajat = [];
    jaksot.forEach(function (j) {
      for (var i = 0; i < j.askelia; i++) {
        kulma += (r() - 0.5) * j.heitto;
        x += Math.cos(kulma) * j.pituus;
        y += Math.sin(kulma) * j.pituus;
        selka.push([x, y]);
      }
      rajat.push({ luokka: j.luokka, indeksi: selka.length - 1 });
    });

    var reitti = pehmenna(selka, 2);

    /* Selkäranka tiestöön kolmena eri luokan pätkänä, jotta metsätie
       ohenee kartalla — se on kohtauksen käännekohta. */
    var alku = 0;
    rajat.forEach(function (raja) {
      var pala = selka.slice(Math.max(0, alku - 1), raja.indeksi + 1);
      if (pala.length > 1) maasto.tiet.push({ luokka: raja.luokka, pisteet: pehmenna(pala, 2) });
      alku = raja.indeksi;
    });

    /* 2. Kaupungin ruudukko origon ympärille. Kierretty ja rei'itetty,
          jotta se ei lue ruutupaperina. */
    var kierto = (r() - 0.5) * 0.5;
    var koko = 190, ruutuja = 9;
    function kierra(px, py) {
      return [px * Math.cos(kierto) - py * Math.sin(kierto),
              px * Math.sin(kierto) + py * Math.cos(kierto)];
    }
    for (var i = -ruutuja; i <= ruutuja; i++) {
      if (r() < 0.22) continue;
      var vaaka = [], pysty = [];
      for (var j = -ruutuja; j <= ruutuja; j++) {
        vaaka.push(kierra(j * koko + (r() - 0.5) * 26, i * koko + (r() - 0.5) * 26));
        pysty.push(kierra(i * koko + (r() - 0.5) * 26, j * koko + (r() - 0.5) * 26));
      }
      var paa = Math.abs(i % 4) === 0;
      maasto.tiet.push({ luokka: paa ? 'paakatu' : 'katu', pisteet: pehmenna(vaaka, 1) });
      if (r() > 0.18) {
        maasto.tiet.push({ luokka: paa ? 'paakatu' : 'katu', pisteet: pehmenna(pysty, 1) });
      }
    }

    /* 2b. Taksitolppa ja noutoreitti.
          Alvina seisoo vuoron alussa tolpalla, ei reitillä. Kun kyyti
          hyväksytään, hän ajaa tolpalta noutopaikkaan — ja noutopaikka on
          pääreitin alku. Reitti asetetaan ruudukon linjoille, jotta se kulkee
          katuja pitkin eikä leikkaa kortteleiden läpi. */
    var gi = (2 + Math.floor(r() * 3)) * (r() < 0.5 ? 1 : -1);
    var gj = (2 + Math.floor(r() * 3)) * (r() < 0.5 ? 1 : -1);
    var tolppa = kierra(gi * koko, gj * koko);
    maasto.taksitolppa = { x: tolppa[0], y: tolppa[1] };

    var kulma = kierra(0, gj * koko);
    var noutoreitti = pehmenna([
      [tolppa[0], tolppa[1]],
      [kulma[0], kulma[1]],
      [0, 0]
    ], 2);

    /* 3. Korttelit — tummat laatikot katujen väliin. Ilman näitä kaupunki
          näyttää viivapiirrokselta, näiden kanssa rakennetulta. */
    for (var i2 = -ruutuja; i2 < ruutuja; i2++) {
      for (var j2 = -ruutuja; j2 < ruutuja; j2++) {
        if (r() < 0.34) continue;
        var reuna = 26 + r() * 20;
        maasto.korttelit.push([
          kierra(i2 * koko + reuna, j2 * koko + reuna),
          kierra((i2 + 1) * koko - reuna, j2 * koko + reuna),
          kierra((i2 + 1) * koko - reuna, (j2 + 1) * koko - reuna),
          kierra(i2 * koko + reuna, (j2 + 1) * koko - reuna)
        ]);
      }
    }

    /* 4. Sivutiet maaseutuosuudelta. Nämä tekevät metsätiestä valinnan
          eivätkä ainoan vaihtoehdon. */
    for (var s = 0; s < 9; s++) {
      var kohta = kohdassa(reitti, 1500 + r() * 3200);
      var suunta = kohta.suunta + (r() < 0.5 ? Math.PI / 2 : -Math.PI / 2) + (r() - 0.5) * 0.7;
      var haara = [[kohta.x, kohta.y]];
      var hx = kohta.x, hy = kohta.y;
      for (var h = 0; h < 4 + Math.floor(r() * 4); h++) {
        suunta += (r() - 0.5) * 0.5;
        hx += Math.cos(suunta) * (130 + r() * 120);
        hy += Math.sin(suunta) * (130 + r() * 120);
        haara.push([hx, hy]);
      }
      maasto.tiet.push({ luokka: r() < 0.4 ? 'metsatie' : 'katu', pisteet: pehmenna(haara, 2) });
    }

    /* 5. Metsäalueet reitin loppupään ympärille ja vesistö. */
    for (var m = 0; m < 7; m++) {
      var keski = kohdassa(reitti, 2200 + r() * 3600);
      var sade = 320 + r() * 620;
      var monikulmio = [];
      for (var a = 0; a < 11; a++) {
        var kk = (a / 11) * Math.PI * 2;
        var rr = sade * (0.55 + r() * 0.7);
        monikulmio.push([
          keski.x + Math.cos(kk) * rr + (r() - 0.5) * 320,
          keski.y + Math.sin(kk) * rr + (r() - 0.5) * 320
        ]);
      }
      maasto.metsat.push(monikulmio);
    }

    var vkeski = kohdassa(reitti, 1300 + r() * 1500);
    var vesi = [];
    var vsuunta = r() < 0.5 ? 1 : -1;
    for (var v = 0; v < 13; v++) {
      var vk = (v / 13) * Math.PI * 2;
      var vr = 240 + r() * 420;
      vesi.push([
        vkeski.x + Math.cos(vk) * vr * 1.5 + vsuunta * 900,
        vkeski.y + Math.sin(vk) * vr
      ]);
    }
    maasto.vedet.push(vesi);

    return {
      maasto: maasto,
      reitit: { matka: reitti, nouto: noutoreitti },
      tolppaSuunta: Math.atan2(kulma[1] - tolppa[1], kulma[0] - tolppa[0])
    };
  }

  /* ══ Kartta ═════════════════════════════════════════════════════════════ */

  var LUOKAT = {
    valtavayla: { leveys: 15, vari: 'tie-paa',  kuori: 'tie-kuori' },
    paakatu:    { leveys: 12, vari: 'tie-paa',  kuori: 'tie-kuori' },
    maantie:    { leveys: 10, vari: 'tie',      kuori: 'tie-kuori' },
    katu:       { leveys: 6.5, vari: 'tie',     kuori: 'tie-kuori' },
    metsatie:   { leveys: 3.2, vari: 'tie-pieni', kuori: null }
  };

  function Kartta(canvas, asetukset) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.asetukset = asetukset || {};
    this.varit = this.asetukset.varit || {};

    var luotu = generoi({ siemen: this.asetukset.siemen || 3310 });
    this.maasto = luotu.maasto;
    this.reitit = luotu.reitit;
    this.tolppaSuunta = luotu.tolppaSuunta;

    /* Kaksi reittiä: 'nouto' = taksitolpalta noutopaikkaan, 'matka' = itse
       kyyti. Kuljettaja ei näe reittiä ennen kuin kyyti on hyväksytty, joten
       reitin piirto on erikseen kytkettävissä. */
    this.reitti = this.reitit.matka;
    this.reitinPituus = pituus(this.reitti);
    this.naytaReitti = true;
    this.pysakoity = false;

    /* Signaali kadonnut (purku 6b): kartta himmenee lähes tyhjäksi, reitti
       ja auto katoavat, jäljelle jää sykkivä sijaintipiste. Pulssin vaihe
       tulee cue-suhteellisesta ajasta (signaaliAika), joten se toistuu
       otosta toiseen. */
    this.signaaliKadonnut = false;
    this.signaaliAika = 0;

    this.matka = 0;                                   // metriä reitin alusta
    this.nopeus = (this.asetukset.nopeusKmh || 42) / 3.6;
    this.zoom = this.asetukset.zoom || 0.7;           // pikseliä per metri
                                                  // 0,7 → ruudulla ~560 m, tavallinen ajozoom
                                                  // 0,15 → ~2,6 km, yleiskuva
    this.kaanny = true;                               // kartta kääntyy ajosuuntaan
    this.liikkuu = false;
    this.gps = null;
    this.kadut = this.asetukset.kadut || [];

    /* Vapaa siirto: kun operaattori haluaa katsoa muualle kuin auton kohdalle. */
    this.vapaa = null;

    /* Auton pystysijainti ruudulla, 0–1. Navigaattoreissa se on noin 2/3
       korkeudelta: tuleva reitti näkyy, ajettu ei vie tilaa. Propissa
       paneelit peittävät ruudun alaosan, joten sovitaAuto() laskee tämän
       näkyvän kaistan mukaan — muuten nuoli jäisi paneelin alle. */
    this.autoY = 0.68;

    this.paivitaSijainti();
  }

  /* Vaihtaa aktiivisen reitin. Matka nollautuu, koska uusi reitti alkaa
     alusta — kuljettaja on sen alkupäässä. */
  Kartta.prototype.asetaReitti = function (nimi) {
    var uusi = this.reitit[nimi];
    if (!uusi) return;
    this.reittiNimi = nimi;
    this.reitti = uusi;
    this.reitinPituus = pituus(uusi);
    this.matka = 0;
    this.paivitaSijainti();
  };

  Kartta.prototype.vari = function (avain, oletus) {
    return this.varit[avain] || oletus;
  };

  Kartta.prototype.paivitaSijainti = function () {
    if (this.pysakoity && this.maasto.taksitolppa) {
      /* Auto seisoo tolpan VIERESSÄ, ei sen päällä: hieman taaempana
         kadun suunnassa ja reunaan päin. Muuten nuoli peittäisi merkin ja
         sen nimen. */
      var t = this.maasto.taksitolppa, k = this.tolppaSuunta;
      this.auto = {
        x: t.x - Math.cos(k) * 48 - Math.sin(k) * 9,
        y: t.y - Math.sin(k) * 48 + Math.cos(k) * 9,
        suunta: k
      };
      this.keskus = this.vapaa || { x: this.auto.x, y: this.auto.y };
      this.suunta = this.auto.suunta;
      return;
    }
    var k = kohdassa(this.reitti, this.matka);
    this.auto = k;
    this.keskus = this.vapaa || { x: k.x, y: k.y };
    this.suunta = k.suunta;
  };

  /* ── Ajo ────────────────────────────────────────────────────────────────
     Reitti etenee cue-suhteellisen ajan mukaan, ei kellonajan — jolloin
     otto 5 näyttää samalta kuin otto 1. */
  Kartta.prototype.etene = function (dt) {
    if (!this.liikkuu) return;
    this.matka = Math.min(this.reitinPituus - 1, this.matka + this.nopeus * dt);
    this.paivitaSijainti();
  };

  Kartta.prototype.asetaMatka = function (metria) {
    this.matka = Math.max(0, Math.min(this.reitinPituus - 1, metria));
    this.paivitaSijainti();
  };

  /* Osuus 0–1 reitistä. Cue asettaa tällä auton oikeaan kohtaan:
     0,55 = maaseutu, 0,92 = metsätie. */
  Kartta.prototype.asetaOsuus = function (osuus) {
    this.asetaMatka(this.reitinPituus * osuus);
  };

  Kartta.prototype.siirra = function (dx, dy) {
    var p = this.vapaa || { x: this.keskus.x, y: this.keskus.y };
    var k = this.kaanny ? this.suunta + Math.PI / 2 : 0;
    this.vapaa = {
      x: p.x + (dx * Math.cos(-k) - dy * Math.sin(-k)) / this.zoom,
      y: p.y + (dx * Math.sin(-k) + dy * Math.cos(-k)) / this.zoom
    };
    this.paivitaSijainti();
  };

  Kartta.prototype.keskitaAutoon = function () {
    this.vapaa = null;
    this.paivitaSijainti();
  };

  /* ── Laitteen paikannin ─────────────────────────────────────────────────
     Aiemmin tämä yritti seurata absoluuttista sijaintia. Se oli väärä idea:
     kartan tiestö on fiktiivinen, joten ei ole paikkaa johon paikantaa —
     auto olisi ajanut kadulla jota ei ole olemassa.

     Paikantimesta otetaan siksi vain se, mikä on merkityksellistä
     fiktiivisellä kartalla: NOPEUS. Kartta liikkuu silloin samaa vauhtia
     kuin auto ikkunan takana, mutta kulkee omaa reittiään.

     GPS toimii lentotilassa — se on vastaanotin eikä tarvitse verkkoa.
     Ensimmäinen paikannus vain kestää kauemmin ilman verkkoapua, ja
     paikannuslupa on annettava kerran laitteen asetuksista. */
  Kartta.prototype.seuraaNopeus = function (paalla, ilmoita) {
    var self = this;

    if (!paalla) {
      if (this.gpsVahti != null) navigator.geolocation.clearWatch(this.gpsVahti);
      this.gpsVahti = null;
      this.gps = null;
      this.nopeus = (this.asetukset.nopeusKmh || 42) / 3.6;
      if (ilmoita) ilmoita('paikannin pois · nopeus ' + Math.round(this.nopeus * 3.6) + ' km/h');
      return;
    }

    if (!navigator.geolocation) {
      if (ilmoita) ilmoita('paikannin ei käytettävissä tällä laitteella');
      return;
    }
    if (!window.isSecureContext) {
      if (ilmoita) ilmoita('paikannin vaatii HTTPS-osoitteen');
      return;
    }

    if (ilmoita) ilmoita('paikannin: odotetaan ensimmäistä lukemaa…');
    var edellinen = null;

    this.gpsVahti = navigator.geolocation.watchPosition(function (sij) {
      var c = sij.coords, nopeus = c.speed;

      /* coords.speed on usein null paikallaan tai heikolla signaalilla.
         Lasketaan silloin peräkkäisistä lukemista. */
      if (nopeus == null || isNaN(nopeus)) {
        if (edellinen) {
          var dt = (sij.timestamp - edellinen.aika) / 1000;
          if (dt > 0.4) {
            var mLat = 111320, mLon = 111320 * Math.cos(c.latitude * Math.PI / 180);
            var dx = (c.longitude - edellinen.lon) * mLon;
            var dy = (c.latitude - edellinen.lat) * mLat;
            nopeus = Math.hypot(dx, dy) / dt;
          }
        }
      }
      edellinen = { lat: c.latitude, lon: c.longitude, aika: sij.timestamp };

      if (nopeus != null && !isNaN(nopeus)) {
        self.nopeus = Math.max(0, Math.min(60, nopeus));   // katto 216 km/h
        self.gps = { nopeus: self.nopeus, tarkkuus: c.accuracy };
        if (ilmoita) ilmoita('paikannin · ' + Math.round(self.nopeus * 3.6) + ' km/h · ±' +
          Math.round(c.accuracy) + ' m');
      }
    }, function (virhe) {
      var syyt = { 1: 'paikannuslupa evätty — anna se Asetukset → Safari → Sijainti',
                   2: 'sijaintia ei saatavilla', 3: 'paikannus aikakatkaistiin' };
      if (ilmoita) ilmoita('paikannin: ' + (syyt[virhe.code] || virhe.message));
      self.gpsVahti = null;
    }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 25000 });
  };

  /* ── Piirto ─────────────────────────────────────────────────────────── */

  Kartta.prototype.mitoita = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var l = this.canvas.clientWidth, k = this.canvas.clientHeight;
    if (this.canvas.width !== Math.round(l * dpr) || this.canvas.height !== Math.round(k * dpr)) {
      this.canvas.width = Math.round(l * dpr);
      this.canvas.height = Math.round(k * dpr);
    }
    this.dpr = dpr; this.leveys = l; this.korkeus = k;
  };

  Kartta.prototype.polku = function (c, pisteet) {
    c.beginPath();
    c.moveTo(pisteet[0][0], pisteet[0][1]);
    for (var i = 1; i < pisteet.length; i++) c.lineTo(pisteet[i][0], pisteet[i][1]);
  };

  Kartta.prototype.piirra = function () {
    this.mitoita();
    var c = this.ctx, L = this.leveys, K = this.korkeus;

    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.fillStyle = this.vari('maa', '#12161C');
    c.fillRect(0, 0, L, K);

    /* Signaali kadonnut: maasto piirretään himmeänä, reitti ja auto eivät
       lainkaan. Lopuksi vain sykkivä piste. */
    if (this.signaaliKadonnut) {
      c.globalAlpha = Number(this.vari('signaali-himmennys', 0.1)) || 0.1;
    }

    /* Ajoneuvon paikka ruudulla, ks. autoY. */
    var ax = L / 2, ay = K * this.autoY;
    c.save();
    c.translate(ax, ay);
    if (this.kaanny) c.rotate(-this.suunta - Math.PI / 2);
    c.scale(this.zoom, this.zoom);
    c.translate(-this.keskus.x, -this.keskus.y);

    var m = this.maasto;

    c.fillStyle = this.vari('metsa', '#131A18');
    m.metsat.forEach(function (p) { this.polku(c, p); c.closePath(); c.fill(); }, this);

    c.fillStyle = this.vari('vesi', '#16202B');
    m.vedet.forEach(function (p) { this.polku(c, p); c.closePath(); c.fill(); }, this);

    c.fillStyle = this.vari('kortteli', '#171C24');
    m.korttelit.forEach(function (p) { this.polku(c, p); c.closePath(); c.fill(); }, this);

    /* Tiet kahdessa kerroksessa: kuori ensin, täyttö päälle. Tämä on se,
       mikä saa tiestön lukemaan karttana eikä viivapiirroksena. */
    c.lineCap = 'round'; c.lineJoin = 'round';
    var kerrokset = [
      { kuori: true,  vari: this.vari('tie-kuori', '#0D1116') },
      { kuori: false, vari: null }
    ];
    /* Viivanleveydet ovat metrejä — katu on oikeasti 6,5 m leveä. Alaraja
       pitää tiet näkyvissä myös uloszoomatessa: kartalla ohuinkin tie on
       vähintään 1,4 px, muuten tiestö katoaa ja jäljelle jää tyhjä ruutu. */
    var self = this;
    function leveys(metria) { return Math.max(metria, 1.4 / self.zoom); }

    kerrokset.forEach(function (kerros) {
      m.tiet.forEach(function (tie) {
        var L2 = LUOKAT[tie.luokka] || LUOKAT.katu;
        if (kerros.kuori && !L2.kuori) return;
        c.strokeStyle = kerros.kuori ? kerros.vari : this.vari(L2.vari, '#2A323D');
        c.lineWidth = kerros.kuori ? leveys(L2.leveys) + 4.5 : leveys(L2.leveys);
        this.polku(c, tie.pisteet);
        c.stroke();
      }, this);
    }, this);

    /* Reitti: ajettu osuus himmeänä, edessä oleva kirkkaana. */
    if (this.naytaReitti && !this.pysakoity && !this.signaaliKadonnut && this.reitti.length > 1) {
      var jaettu = this.jaaReitti();
      var reittiLev = Math.max(Number(this.vari('reitti-leveys', 10)) || 10, 5 / this.zoom);
      c.strokeStyle = this.vari('reitti-ajettu', '#5A2A22');
      c.lineWidth = reittiLev;
      if (jaettu.takana.length > 1) { this.polku(c, jaettu.takana); c.stroke(); }

      c.strokeStyle = this.vari('reitti-kuori', '#7A1E14');
      c.lineWidth = reittiLev + Math.max(6, reittiLev * 0.55);
      if (jaettu.edessa.length > 1) { this.polku(c, jaettu.edessa); c.stroke(); }
      c.strokeStyle = this.vari('reitti', '#C4402F');
      c.lineWidth = reittiLev;
      if (jaettu.edessa.length > 1) { this.polku(c, jaettu.edessa); c.stroke(); }
    }

    c.restore();

    if (this.signaaliKadonnut) {
      c.globalAlpha = 1;
      this.piirraSignaalipiste(c, L / 2, K * 0.5);
      return;
    }

    this.piirraTolppa(c, ax, ay);
    this.piirraKadunnimet(c, ax, ay);
    this.piirraAuto(c, ax, ay);
  };

  /* Yksinäinen sijaintipiste, kun signaali on kadonnut. Sykkivä rengas
     kertoo että laite etsii — kuten karttasovelluksissa. */
  Kartta.prototype.piirraSignaalipiste = function (c, x, y) {
    var vari = this.vari('signaali-piste', '#4A8FD8');
    var vaihe = (this.signaaliAika % 2.2) / 2.2;

    c.save();
    c.globalAlpha = Math.max(0, 0.4 * (1 - vaihe));
    c.beginPath();
    c.arc(x, y, 14 + vaihe * 34, 0, Math.PI * 2);
    c.fillStyle = vari;
    c.fill();
    c.globalAlpha = 1;

    c.beginPath();
    c.arc(x, y, 10, 0, Math.PI * 2);
    c.fillStyle = vari;
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = 'rgba(255,255,255,.85)';
    c.stroke();
    c.restore();
  };

  Kartta.prototype.jaaReitti = function () {
    var takana = [], edessa = [], kuljettu = 0, lisatty = false;
    for (var i = 1; i < this.reitti.length; i++) {
      var a = this.reitti[i - 1], b = this.reitti[i];
      var d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (kuljettu + d < this.matka) {
        takana.push(a);
      } else if (!lisatty) {
        takana.push(a);
        takana.push([this.auto.x, this.auto.y]);
        edessa.push([this.auto.x, this.auto.y]);
        edessa.push(b);
        lisatty = true;
      } else {
        edessa.push(b);
      }
      kuljettu += d;
    }
    if (!lisatty) takana.push(this.reitti[this.reitti.length - 1]);
    return { takana: takana, edessa: edessa };
  };

  /* Taksitolppa. Piirretään ruutukoordinaatistossa, jotta merkki pysyy
     pystyssä kartan kääntyessä — kuten navigaattorien pysäkkimerkit. */
  Kartta.prototype.piirraTolppa = function (c, ax, ay) {
    var t = this.maasto.taksitolppa;
    if (!t) return;
    var s = this.ruudulle(t.x, t.y, ax, ay);
    if (s.x < -40 || s.x > this.leveys + 40 || s.y < -40 || s.y > this.korkeus + 40) return;

    c.save();
    c.translate(s.x, s.y);

    /* Pisara: ympyrä ja kärki alaspäin. */
    c.beginPath();
    c.arc(0, -13, 9.5, Math.PI, 0);
    c.lineTo(0, 2);
    c.closePath();
    c.fillStyle = this.vari('tolppa', '#C79A3A');
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = this.vari('maa', '#12161C');
    c.stroke();

    c.beginPath();
    c.arc(0, -13, 3.6, 0, Math.PI * 2);
    c.fillStyle = this.vari('maa', '#12161C');
    c.fill();

    if (this.tolpanNimi) {
      c.font = '600 10.5px ' + (this.asetukset.fontti || 'system-ui, sans-serif');
      c.textAlign = 'center';
      c.textBaseline = 'top';
      c.lineWidth = 3.5;
      c.strokeStyle = this.vari('maa', '#12161C');
      c.strokeText(this.tolpanNimi, 0, 6);
      c.fillStyle = this.vari('tolppa', '#C79A3A');
      c.fillText(this.tolpanNimi, 0, 6);
    }
    c.restore();
  };

  /* Kadunnimet piirretään ruutukoordinaatistossa eikä kartan mukana, jotta
     ne pysyvät vaakasuorassa kartan kääntyessä — kuten navigaattoreissa. */
  Kartta.prototype.piirraKadunnimet = function (c, ax, ay) {
    if (!this.kadut.length) return;
    var self = this;
    c.save();
    c.font = '600 11px ' + (this.asetukset.fontti || 'system-ui, sans-serif');
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    /* Sama nimi ei saa esiintyä ruudulla kahdesti eivätkä nimet päällekkäin.
       Kummatkin lukisivat heti virheenä kartalla. */
    var kaytetyt = {}, paikat = [], naytetyt = 0;
    this.maasto.tiet.forEach(function (tie, i) {
      if (naytetyt >= 4) return;
      var L2 = LUOKAT[tie.luokka] || LUOKAT.katu;
      if (L2.leveys < 6) return;
      var nimi = self.kadut[i % self.kadut.length];
      if (kaytetyt[nimi]) return;

      var keskikohta = tie.pisteet[Math.floor(tie.pisteet.length / 2)];
      var s = self.ruudulle(keskikohta[0], keskikohta[1], ax, ay);
      if (s.x < 52 || s.x > self.leveys - 52 || s.y < 96 || s.y > self.korkeus - 150) return;
      for (var p = 0; p < paikat.length; p++) {
        if (Math.hypot(paikat[p][0] - s.x, paikat[p][1] - s.y) < 92) return;
      }

      kaytetyt[nimi] = true;
      paikat.push([s.x, s.y]);
      naytetyt++;
      c.lineWidth = 3.5;
      c.strokeStyle = self.vari('maa', '#12161C');
      c.strokeText(nimi, s.x, s.y);
      c.fillStyle = self.vari('kadunnimi', '#7A8694');
      c.fillText(nimi, s.x, s.y);
    });
    c.restore();
  };

  Kartta.prototype.ruudulle = function (x, y, ax, ay) {
    var dx = x - this.keskus.x, dy = y - this.keskus.y;
    var k = this.kaanny ? -this.suunta - Math.PI / 2 : 0;
    return {
      x: ax + (dx * Math.cos(k) - dy * Math.sin(k)) * this.zoom,
      y: ay + (dx * Math.sin(k) + dy * Math.cos(k)) * this.zoom
    };
  };

  Kartta.prototype.piirraAuto = function (c, ax, ay) {
    var s = this.vapaa ? this.ruudulle(this.auto.x, this.auto.y, ax, ay) : { x: ax, y: ay };
    c.save();
    c.translate(s.x, s.y);
    if (!this.kaanny) c.rotate(this.suunta + Math.PI / 2);

    /* Autosprite graafikon liikevideosta: oranssi kori ylhäältä, mustat
       ikkunat, kevyt hehku alla. Nokka osoittaa ylös (ajosuuntaan, koska
       kartta kääntyy ajosuunnan mukaan). Mitat pisteinä ruudulla — sprite
       ei skaalaudu zoomin mukana, kuten ei navigaattoreissakaan. */
    var hehku = c.createRadialGradient(0, 0, 4, 0, 0, 34);
    hehku.addColorStop(0, this.vari('auto-hehku', 'rgba(255,84,0,.35)'));
    hehku.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = hehku;
    c.beginPath(); c.arc(0, 0, 34, 0, Math.PI * 2); c.fill();

    var runko = this.vari('auto', '#FF5000');
    var lasi = '#1A1A1A';

    /* Kori */
    c.beginPath();
    if (c.roundRect) c.roundRect(-9, -19, 18, 38, 7);
    else c.rect(-9, -19, 18, 38);
    c.fillStyle = runko;
    c.fill();
    c.lineWidth = 1.5;
    c.strokeStyle = 'rgba(0,0,0,.45)';
    c.stroke();

    /* Tuulilasi (edessä, ylhäällä) ja takalasi */
    c.fillStyle = lasi;
    c.beginPath();
    if (c.roundRect) c.roundRect(-6.5, -12, 13, 7, 2.5);
    else c.rect(-6.5, -12, 13, 7);
    c.fill();
    c.beginPath();
    if (c.roundRect) c.roundRect(-6.5, 7, 13, 6, 2.5);
    else c.rect(-6.5, 7, 13, 6);
    c.fill();

    /* Katto */
    c.fillStyle = runko;
    c.beginPath();
    if (c.roundRect) c.roundRect(-6.5, -4, 13, 10, 2);
    else c.rect(-6.5, -4, 13, 10);
    c.fill();

    c.restore();
  };

  global.GRIND = global.GRIND || {};
  global.GRIND.Kartta = Kartta;
  global.GRIND.karttaApu = { siemen: siemen, kohdassa: kohdassa, pituus: pituus };
})(window);
