/* GRIND jakso 3 — kurssikaavio.
 *
 * CANDLR:n kaavio canvakselle. Kolme tilaa: romahdus, raketti ja
 * loppukuvan jyrkkä romahdus.
 *
 * Muoto tulee käsikirjoituksesta: "verenpunainen sahalaitakäyrä lävistää
 * asteikon diagonaalisesti". Käyrä kulkee siis kulmasta kulmaan — se ei ole
 * tyylivalinta vaan sommittelullinen vaatimus, ja siksi trendi on suora ja
 * kohina sen päällä.
 *
 * Rakenne on tarkistettu oikeasta pörssistä (REFERENSSIT.md kohta 2):
 *   · hinta-asteikko OIKEASSA laidassa, koska tuorein hinta on oikealla
 *   · aika alalaidassa
 *   · vaakaviivat, ei pystyviivoja
 *
 * Data on siemennettyä: sama cue piirtää saman käyrän joka otossa.
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

  function Kaavio(canvas, asetukset) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.a = asetukset || {};
    this.varit = this.a.varit || {};
    this.suunta = 'lasku';
    this.pisteet = [];
    this.generoi();
  }

  Kaavio.prototype.vari = function (avain, oletus) {
    return this.varit[avain] || oletus;
  };

  /* ── Data ────────────────────────────────────────────────────────────────
     Kurssi ei heilu tasaisesti. Ensimmäinen versio oli säännöllinen
     sahalaita — joka toinen piste ylös, joka toinen alas — ja se lukee heti
     koristeena eikä markkinana.

     Oikeassa kurssikäyrässä on kolme asiaa, joita säännöllisessä
     sahalaidassa ei ole:

       1. LIIKEMÄÄRÄ. Suunta jatkuu useamman pisteen ajan ennen kääntymistä,
          joten syntyy nousuja ja laskuja eikä pelkkää värinää.
       2. VOLATILITEETTIRYPPÄÄT. Rauhallisia jaksoja ja hurjia jaksoja
          vuorotellen. Amplitudi ei ole vakio.
       3. SHOKIT. Yksittäisiä isoja piikkejä, jotka rikkovat rytmin.

     Satunnaiskulku tuottaa kaikki kolme, mutta se ajautuu minne sattuu.
     Siksi kulku suoristetaan: siitä vähennetään sen oma lineaarinen ajautuma,
     minkä jälkeen päälle lisätään haluttu trendi. Näin käyrä alkaa ja päättyy
     siellä missä kohtaus vaatii, mutta välissä se elää.

     Kaikki on siemennettyä, joten sama cue piirtää saman käyrän joka otossa. */
  Kaavio.prototype.generoi = function () {
    var siirto = this.suunta === 'nousu' ? 7000 : (this.suunta === 'lasku-jyrkka' ? 4400 : 0);
    var r = siemen((this.a.siemen || 331) + siirto);
    var n = this.a.pisteita || 150;

    /* 1. Satunnaiskulku liikemäärällä, vaihtelevalla volatiliteetilla ja
          satunnaisilla shokeilla. */
    var kulku = new Array(n);
    var arvo = 0, vauhti = 0, vola = 0.6;
    for (var i = 0; i < n; i++) {
      var x = i / (n - 1);

      /* Volatiliteetti vaeltaa ja purskahtaa. Loppua kohti hermostuneempi. */
      vola += (r() - 0.5) * 0.34;
      if (r() < 0.05) vola += r() * 1.7;
      vola = Math.max(0.28, Math.min(2.6, vola)) * (0.65 + x * 0.8);

      var isku = (r() - 0.5) * 2 * vola;
      if (r() < 0.035) isku *= 2.6 + r() * 2.2;      // shokki

      /* Liikemäärä: edellinen liike jatkuu osittain. Tästä syntyvät
         useamman pisteen mittaiset nousut ja laskut. */
      vauhti = vauhti * 0.32 + isku * 0.68;
      arvo += vauhti;
      kulku[i] = arvo;
    }

    /* 2. Poistetaan kulun oma ajautuma, jotta trendi määrää suunnan. */
    var alkuArvo = kulku[0], loppuArvo = kulku[n - 1];
    for (var j = 0; j < n; j++) {
      kulku[j] -= alkuArvo + (loppuArvo - alkuArvo) * (j / (n - 1));
    }

    /* 2b. Ylipäästö: vähennetään kulun oma pitkä aalto.
           Pelkkä ajautuman poisto jättää kulun yhdeksi isoksi kaareksi
           trendin toiselle puolelle — kurssi ei heilu trendin YMPÄRILLÄ
           vaan kaartaa sen ali. Liukuvan keskiarvon vähentäminen jättää
           jäljelle sen taajuuden, joka lukee markkinaliikkeenä. */
    var ikkuna = Math.max(9, Math.round(n / 5));
    var tasoitettu = new Array(n);
    for (var t = 0; t < n; t++) {
      var alkuI = Math.max(0, t - (ikkuna >> 1));
      var loppuI = Math.min(n - 1, t + (ikkuna >> 1));
      var sum = 0;
      for (var q = alkuI; q <= loppuI; q++) sum += kulku[q];
      tasoitettu[t] = sum / (loppuI - alkuI + 1);
    }
    for (var u = 0; u < n; u++) kulku[u] -= tasoitettu[u];

    /* Kiinnitetään päätepisteet trendille: viimeinen piste on nykyhinta,
       joka näkyy kaavion lipukkeessa.

       Tämä tehdään kaventamalla eikä vähentämällä päiden kautta vedettyä
       suoraa. Liukuva keskiarvo vääristyy reunoilla — ikkuna on siellä
       katkaistu — joten päätepisteet jäävät poikkeuksellisen korkeiksi, ja
       niiden kautta vedetyn suoran vähentäminen painaisi KOKO käyrän trendin
       alapuolelle. Silloin kurssi ei heilu trendin ympärillä vaan kaartaa
       sen ali, mikä oli juuri se, mikä piti korjata. */
    var kavennus = Math.max(3, Math.round(n / 28));
    for (var w = 0; w < kavennus; w++) {
      var kerta = w / kavennus;
      kulku[w] *= kerta;
      kulku[n - 1 - w] *= kerta;
    }

    /* 3. Skaalataan hajonnan mukaan, EI maksimin. Maksimilla skaalaaminen
          antaa yhden shokin litistää koko muun käyrän, jolloin trendi jyrää
          kohinan yli ja jäljelle jää sileä viiva. Hajonnalla skaalattuna
          tyypillinen heilahtelu pysyy näkyvänä ja shokit saavat jäädä
          isoiksi — ne rajautuvat vasta ruudun reunaan. */
    var summa = 0;
    for (var h = 0; h < n; h++) summa += kulku[h] * kulku[h];
    var hajonta = Math.sqrt(summa / n);
    var kerroin = hajonta > 0 ? (this.a.heilahtelu || 0.115) / hajonta : 0;

    var p = [];
    for (var k = 0; k < n; k++) {
      var xx = k / (n - 1);
      var trendi;
      if (this.suunta === 'nousu') {
        /* Raketti: loiva alku, jyrkkä loppu. */
        trendi = 0.86 - Math.pow(xx, 2.6) * 0.76;
      } else if (this.suunta === 'lasku-jyrkka') {
        /* Kurssi pitää pintansa ja pettää sitten kerralla. */
        trendi = 0.10 + Math.pow(xx, 3.6) * 0.84;
      } else {
        /* Tasainen valuminen kulmasta kulmaan. */
        trendi = 0.14 + xx * 0.72;
      }
      p.push({ x: xx, y: Math.max(0.02, Math.min(0.98, trendi + kulku[k] * kerroin)) });
    }
    this.pisteet = p;
  };

  Kaavio.prototype.asetaSuunta = function (suunta) {
    if (this.suunta === suunta) return;
    this.suunta = suunta;
    this.generoi();
  };

  Kaavio.prototype.mitoita = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var l = this.canvas.clientWidth, k = this.canvas.clientHeight;
    if (!l || !k) return false;
    if (this.canvas.width !== Math.round(l * dpr) || this.canvas.height !== Math.round(k * dpr)) {
      this.canvas.width = Math.round(l * dpr);
      this.canvas.height = Math.round(k * dpr);
    }
    this.dpr = dpr; this.leveys = l; this.korkeus = k;
    return true;
  };

  /* ── Piirto ──────────────────────────────────────────────────────────────
     t = cue-suhteellinen aika sekunteina. Sitä käytetään vain viimeisen
     pisteen elämiseen, jotta kurssi ei näytä pysähtyneeltä kuvalta. */
  Kaavio.prototype.piirra = function (t) {
    if (!this.mitoita()) return;
    var c = this.ctx, L = this.leveys, K = this.korkeus;
    var nousu = this.suunta === 'nousu';

    /* Asteikko oikealla vie tilaa, aika alhaalla. */
    var oikea = 62, ala = 22, yla = 10, vasen = 2;
    var kL = L - oikea - vasen, kK = K - ala - yla;

    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, L, K);

    var paavari = nousu ? this.vari('nousu', '#5E9E6B') : this.vari('lasku', '#C4402F');

    /* Vaakaviivat ja hinta-asteikko oikeaan laitaan. */
    c.font = '500 11px ' + (this.a.fontti || 'ui-monospace, monospace');
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    var rivit = 5;
    for (var i = 0; i <= rivit; i++) {
      var y = yla + (i / rivit) * kK;
      c.strokeStyle = this.vari('ruudukko', '#1C232C');
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(vasen, Math.round(y) + 0.5);
      c.lineTo(vasen + kL, Math.round(y) + 0.5);
      c.stroke();

      if (this.a.asteikko) {
        c.fillStyle = this.vari('asteikko', '#4E5866');
        c.fillText(this.a.asteikko(i / rivit), vasen + kL + 9, y);
      }
    }

    /* Aikaleimat alalaitaan. */
    if (this.a.ajat) {
      c.textAlign = 'center';
      c.fillStyle = this.vari('asteikko', '#4E5866');
      var ajat = this.a.ajat;
      for (var j = 0; j < ajat.length; j++) {
        var ax = vasen + (j / (ajat.length - 1)) * kL;
        c.textAlign = j === 0 ? 'left' : (j === ajat.length - 1 ? 'right' : 'center');
        c.fillText(ajat[j], ax, K - ala / 2 - 1);
      }
    }

    var self = this;
    function px(p) { return { x: vasen + p.x * kL, y: yla + p.y * kK }; }

    /* Viimeinen piste elää, jotta kurssi ei ole pysähtynyt kuva.
       Liike on pientä ja sidottu cue-aikaan, joten se toistuu otosta toiseen. */
    var pisteet = this.pisteet.slice();
    if (t != null && pisteet.length) {
      var v = pisteet[pisteet.length - 1];
      var heilahdus = Math.sin(t * 3.1) * 0.012 + Math.sin(t * 7.7) * 0.006;
      pisteet[pisteet.length - 1] = { x: v.x, y: Math.max(0.03, Math.min(0.97, v.y + heilahdus)) };
    }

    /* Täyttö käyrän alle. Pidetään vaimeana: laaja liukuväri raidoittuu
       8-bittisessä videossa, ks. BRIEF_GRAAFIKKO kohta 3. */
    var tayte = c.createLinearGradient(0, yla, 0, yla + kK);
    tayte.addColorStop(0, nousu ? 'rgba(94,158,107,.20)' : 'rgba(196,64,47,.20)');
    tayte.addColorStop(1, 'rgba(0,0,0,0)');
    c.beginPath();
    var eka = px(pisteet[0]);
    c.moveTo(eka.x, eka.y);
    pisteet.forEach(function (p) { var s = px(p); c.lineTo(s.x, s.y); });
    c.lineTo(vasen + kL, yla + kK);
    c.lineTo(vasen, yla + kK);
    c.closePath();
    c.fillStyle = tayte;
    c.fill();

    /* Käyrä. Terävät kulmat, ei pyöristystä — sahalaita on koko pointti. */
    c.beginPath();
    c.moveTo(eka.x, eka.y);
    pisteet.forEach(function (p) { var s = px(p); c.lineTo(s.x, s.y); });
    c.strokeStyle = paavari;
    c.lineWidth = 2.6;
    c.lineJoin = 'miter';
    c.lineCap = 'butt';
    c.stroke();

    /* Viimeisen pisteen merkki ja vaakaviiva nykyhintaan. */
    var vika = px(pisteet[pisteet.length - 1]);
    c.setLineDash([4, 4]);
    c.strokeStyle = paavari;
    c.globalAlpha = 0.45;
    c.beginPath();
    c.moveTo(vasen, Math.round(vika.y) + 0.5);
    c.lineTo(vasen + kL, Math.round(vika.y) + 0.5);
    c.stroke();
    c.globalAlpha = 1;
    c.setLineDash([]);

    c.beginPath();
    c.arc(vika.x, vika.y, 4.5, 0, Math.PI * 2);
    c.fillStyle = paavari;
    c.fill();

    /* Nykyhinnan lipuke oikeaan laitaan, kuten pörsseissä. */
    if (this.a.nykyhinta) {
      var teksti = this.a.nykyhinta();
      c.font = '600 11px ' + (this.a.fontti || 'ui-monospace, monospace');
      var lev = c.measureText(teksti).width + 12;
      var ly = Math.max(yla + 9, Math.min(yla + kK - 9, vika.y));
      c.fillStyle = paavari;
      c.beginPath();
      if (c.roundRect) c.roundRect(vasen + kL + 4, ly - 9, lev, 18, 3);
      else c.rect(vasen + kL + 4, ly - 9, lev, 18);
      c.fill();
      c.fillStyle = this.vari('pohja', '#0E1116');
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(teksti, vasen + kL + 10, ly);
    }
  };

  global.GRIND = global.GRIND || {};
  global.GRIND.Kaavio = Kaavio;
})(window);
