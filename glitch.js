/* Glitch — siirretty tuotannon aiemmasta propista (peligraafikon työpöytä).
 *
 * Neljä tyyppiä, kukin omalla näppäimellään. Painallus = purske, ⇧ + sama
 * näppäin = jää päälle kunnes painat uudestaan. Toisen tyypin näppäin vaihtaa
 * tyyppiä lennossa.
 *
 *   G  repeytyminen    vaakakaistat irtoavat paikaltaan
 *   X  blokkiintuminen pakkaus hajoaa, osa lohkoista tippuu mustaksi
 *   Y  kuva väärinpäin signaali kääntyy ylösalaisin ja peilikuvaksi
 *   Z  sahalaita       lomituksen kampa, tekstin reunat hajoavat
 *
 * Purskeen kesto arvotaan 0,36–0,66 s ja lohkojen paikat joka kerta, joten
 * kahta samanlaista ottoa ei tule. Tämä on tarkoituksellinen poikkeus propin
 * jatkuvuussääntöön: räpsähdyksen kuuluu olla eri joka kerta.
 *
 * KAKSI MUUTOSTA ALKUPERÄISEEN:
 *
 * 1. Kloonit kopioivat myös canvaksen. cloneNode() ei kopioi canvaksen
 *    bittikarttaa, joten HOPP:n kartta olisi klooneissa tyhjä — eli suurin osa
 *    ruudusta olisi mustaa juuri glitchin aikana. Piirretään se käsin.
 *
 * 2. Ääni on oletuksena pois. Puhelin on telineessä autossa keskellä
 *    dialogia; propin rahina menisi ääniraidalle. `M` kytkee sen päälle,
 *    jos ääni nauhoitetaan erikseen.
 */
(function (global) {
  'use strict';

  var TYYPIT = {
    tear:  { luokka: 't-tear',  nimi: 'repeä',      kloonit: true },
    block: { luokka: 't-block', nimi: 'blokki',     kloonit: false },
    flip:  { luokka: 't-flip',  nimi: 'väärinpäin', kloonit: true },
    comb:  { luokka: 't-comb',  nimi: 'sahalaita',  kloonit: true }
  };
  var NAPIT = { g: 'tear', x: 'block', y: 'flip', z: 'comb' };

  var G = {
    tyyppi: 'tear',
    jatkuva: false,
    aani: false,          // ks. tiedoston alku — oletuksena pois
    _ajastin: null,
    _automaatti: null,
    NAPIT: NAPIT,
    TYYPIT: TYYPIT
  };

  function el(id) { return document.getElementById(id); }

  /* ── Kloonit ────────────────────────────────────────────────────────────
     Kaksi pysäytyskuvaa sovelluksesta. Id:t riisutaan, ettei
     getElementById osu vahingossa klooniin. */
  function teeKloonit() {
    var lahde = el('ko-sovellus');
    if (!lahde) return;
    var kankaat = lahde.querySelectorAll('canvas');

    [].forEach.call(document.querySelectorAll('#ko-glitch .ko-slice'), function (s) {
      s.textContent = '';
      var k = lahde.cloneNode(true);
      k.removeAttribute('id');
      [].forEach.call(k.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); });
      k.style.transform = 'none';
      k.style.filter = 'none';

      /* cloneNode ei kopioi canvaksen sisältöä. Ilman tätä kartta olisi
         klooneissa tyhjä. */
      [].forEach.call(k.querySelectorAll('canvas'), function (kohde, i) {
        var alkup = kankaat[i];
        if (!alkup || !alkup.width || !alkup.height) return;
        kohde.width = alkup.width;
        kohde.height = alkup.height;
        try { kohde.getContext('2d').drawImage(alkup, 0, 0); } catch (e) {}
      });

      s.appendChild(k);
    });
  }

  function tyhjennaKloonit() {
    [].forEach.call(document.querySelectorAll('#ko-glitch .ko-slice'), function (s) {
      s.textContent = '';
    });
  }

  /* Makrolohkot arvotaan ruudukkoon joka purskeella. Ruutu on puhelimessa
     pieni, joten ruudukko on 24 px eikä alkuperäinen 40 px. */
  function teeLohkot() {
    var b = el('ko-blokit');
    if (!b) return;
    var R = 24, L = window.innerWidth, K = window.innerHeight, h = '';
    for (var i = 0; i < 16; i++) {
      var w  = (2 + Math.floor(Math.random() * 6)) * R;
      var kk = (1 + Math.floor(Math.random() * 4)) * R;
      var x  = Math.floor(Math.random() * Math.max(1, (L - w) / R)) * R;
      var y  = Math.floor(Math.random() * Math.max(1, (K - kk) / R)) * R;
      h += '<i style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + kk + 'px;' +
           'animation-delay:' + (Math.random() * 0.34).toFixed(2) + 's"></i>';
    }
    b.innerHTML = h;
  }

  function tyhjennaLohkot() {
    var b = el('ko-blokit');
    if (!b) return;
    b.classList.remove('ko-paalla');
    b.textContent = '';
  }

  /* ── Ääni ───────────────────────────────────────────────────────────── */
  var actx = null;
  function rahina(kesto) {
    if (!G.aani) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var kest = (kesto || 400) / 1000, n = Math.floor(actx.sampleRate * kest);
      var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (i % 97 < 48 ? 1 : 0.25);
      var src = actx.createBufferSource(); src.buffer = buf;
      var bp = actx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 1800; bp.Q.value = 0.7;
      var g = actx.createGain(); var t = actx.currentTime;
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + kest);
      src.connect(bp).connect(g).connect(actx.destination); src.start(t);
    } catch (e) {}
  }

  /* ── Päälle ja pois ─────────────────────────────────────────────────── */
  G.paalle = function (tyyppi) {
    G.tyyppi = tyyppi || G.tyyppi;
    var def = TYYPIT[G.tyyppi];
    var g = el('ko-glitch'), kuori = el('ko-kuori');
    if (!g || !kuori) return;

    if (def.kloonit) teeKloonit(); else tyhjennaKloonit();
    if (G.tyyppi === 'block') { teeLohkot(); el('ko-blokit').classList.add('ko-paalla'); }
    else tyhjennaLohkot();

    g.className = '';                    // pudota edellisen tyypin luokka
    g.classList.add(def.luokka, 'ko-paalla');
    kuori.classList.add('ko-tarise');
    kuori.classList.toggle('ko-kevyt', G.tyyppi === 'block');
    if (G.ilmoita) G.ilmoita('glitch: ' + def.nimi + (G.jatkuva ? ' JATKUVA' : ''));
  };

  G.pois = function () {
    var g = el('ko-glitch'), kuori = el('ko-kuori');
    if (g) g.className = '';
    if (kuori) kuori.classList.remove('ko-tarise', 'ko-kevyt');
    tyhjennaKloonit();
    tyhjennaLohkot();
  };

  G.purske = function (tyyppi) {
    if (G.jatkuva) return;
    clearTimeout(G._ajastin);
    var kesto = 360 + Math.round(Math.random() * 300);   // 0,36–0,66 s
    G.paalle(tyyppi);
    rahina(kesto);
    G._ajastin = setTimeout(G.pois, kesto);
  };

  /* Sama näppäin uudestaan sammuttaa, eri näppäin vaihtaa tyyppiä lennossa. */
  G.vaihda = function (tyyppi) {
    clearTimeout(G._ajastin);
    if (G.jatkuva && G.tyyppi === tyyppi) {
      G.jatkuva = false;
      G.pois();
      if (G.ilmoita) G.ilmoita('glitch pois');
      return;
    }
    G.jatkuva = true;
    G.paalle(tyyppi);
    rahina(700);
  };

  /* ── Automaatti ─────────────────────────────────────────────────────────
     Cue voi käynnistää räpsähtelyn itsestään. Kuvauspaikalla operaattorilla
     on vain klikkeri, joten "ruutu räpsyy" ei voi olla käsin painettava. */
  G.automaatti = function (asetukset) {
    G.automaattiPois();
    if (!asetukset) return;
    var tyypit = asetukset.tyypit || ['tear', 'comb', 'block'];
    var min = asetukset.valiMin || 1400, max = asetukset.valiMax || 4200;

    function seuraava() {
      var vali = min + Math.random() * (max - min);
      G._automaatti = setTimeout(function () {
        G.purske(tyypit[Math.floor(Math.random() * tyypit.length)]);
        seuraava();
      }, vali);
    }
    /* Ensimmäinen purske heti, jotta cue lähtee käyntiin näkyvästi. */
    G.purske(tyypit[0]);
    seuraava();
  };

  G.automaattiPois = function () {
    clearTimeout(G._automaatti);
    G._automaatti = null;
  };

  /* ── Näppäimet ──────────────────────────────────────────────────────────
     Nämä ovat samat kuin tuotannon aiemmassa propissa, jotta operaattorin
     lihasmuisti kantaa jaksosta toiseen. */
  G.nappain = function (t) {
    if (t.metaKey || t.ctrlKey || t.altKey) return false;
    var tyyppi = NAPIT[t.key.toLowerCase()];
    if (!tyyppi) return false;
    if (t.shiftKey) G.vaihda(tyyppi); else G.purske(tyyppi);
    return true;
  };

  global.GRIND = global.GRIND || {};
  global.GRIND.glitch = G;
})(window);
