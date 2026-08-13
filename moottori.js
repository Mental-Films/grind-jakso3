/* GRIND jakso 3 "Pelkääjän paikka" — propin moottori.
 *
 * Cue-moottori, hohtokerros, kirkkaus, piilotetut kulmat, offline-asennus,
 * laitetiedot ja esikatselu. Sovellukset (CANDLR, GRUMBL, TABB, HOPP)
 * määritellään omissa proppi_*.html-tiedostoissaan ja annetaan tälle.
 *
 * Kaikki teksti tulee sisalto.json:ista, kaikki värit teema.json:ista.
 * Kumpaakaan ei tarvitse kääntää — tallennus riittää.
 */
(function (global) {
  'use strict';

  var VERSIO = '0.8.0';

  /* ══ Siemennetty satunnaisluku ══════════════════════════════════════════
     Jatkuvuus vaatii, että sama cue piirtää saman kuvan joka otossa.
     Mikään propissa ei saa käyttää Math.randomia paitsi glitch. */
  function siemen(luku) {
    var a = luku >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ══ JSON, jossa saa olla kommentteja ═══════════════════════════════════
     teema.json ja sisalto.json ovat graafikon ja ohjaajan käsissä, joten
     niissä pitää voida selittää mikä luku on mikä. Riisutaan //-kommentit
     ja perässä roikkuvat pilkut ennen jäsennystä. Merkkijonojen sisällä
     olevaan // ei kosketa. */
  function jasennaJson(teksti) {
    var ulos = '', jonossa = false, pako = false;
    for (var i = 0; i < teksti.length; i++) {
      var m = teksti[i], seuraava = teksti[i + 1];
      if (jonossa) {
        ulos += m;
        if (pako) pako = false;
        else if (m === '\\') pako = true;
        else if (m === '"') jonossa = false;
        continue;
      }
      if (m === '"') { jonossa = true; ulos += m; continue; }
      if (m === '/' && seuraava === '/') { while (i < teksti.length && teksti[i] !== '\n') i++; ulos += '\n'; continue; }
      if (m === '/' && seuraava === '*') { i += 2; while (i < teksti.length && !(teksti[i] === '*' && teksti[i + 1] === '/')) i++; i++; continue; }
      ulos += m;
    }
    ulos = ulos.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(ulos);
  }

  function hae(polku) {
    return fetch(polku, { cache: 'no-cache' })
      .then(function (v) { if (!v.ok) throw new Error(polku + ' ' + v.status); return v.text(); })
      .then(jasennaJson);
  }

  /* ══ Muotoilu ═══════════════════════════════════════════════════════════
     Suomalainen tuhaterotin ja desimaalipilkku. Kapea sitova välilyönti,
     jotta luku ei katkea riville kahtia lähikuvassa. */
  function e0(n) { return Math.round(n).toLocaleString('fi-FI').replace(/ /g, ' '); }
  function e1(n) {
    return Number(n).toLocaleString('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      .replace(/ /g, '\u00a0');
  }
  function e2(n) {
    return Number(n).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replace(/ /g, ' ');
  }
  /* Kryptokurssit tarvitsevat neljä desimaalia, eurot kaksi. */
  function eD(n, desimaalit) {
    return Number(n).toLocaleString('fi-FI',
      { minimumFractionDigits: desimaalit, maximumFractionDigits: desimaalit })
      .replace(/ /g, '\u00a0');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ══ Moottori ═══════════════════════════════════════════════════════════ */

  var M = {
    versio: VERSIO,
    laite: null,        // 'tabletti' | 'puhelin'
    cuet: [],
    cue: -1,
    T: null,            // teema
    S: null,            // sisältö
    hohto: { vari: null, voima: 0, puhdas: false },
    kirkkaus: 1,
    musta: false,
    palkkiEsilla: true,
    kosketustila: false, // näyttelijä koskee ruutua → operaattorin kulmat pois
    offlineTila: 'asentuu', // valmis | asentuu | purettu | ei-suojattu | ei-tuettu | pois
    alkuAika: 0,
    _el: {},
    _sidokset: []
  };

  /* ── Teeman soveltaminen ─────────────────────────────────────────────── */
  function sovellaTeema(T) {
    var juuri = document.documentElement;
    Object.keys(T.varit || {}).forEach(function (avain) {
      juuri.style.setProperty('--' + avain, T.varit[avain]);
    });

    /* Mitat, typografia ja varjot menevät CSS-muuttujiksi samalla tavalla
       kuin värit. Näin koko ulkoasun voi vaihtaa teema.json:ista — myös
       silloin kun graafikon ohjeistus tulee vasta myöhemmin. */
    Object.keys(T.mitat || {}).forEach(function (avain) {
      juuri.style.setProperty('--' + avain, T.mitat[avain]);
    });
    Object.keys(T.typografia || {}).forEach(function (avain) {
      juuri.style.setProperty('--teksti-' + avain, T.typografia[avain]);
    });
    Object.keys(T.varjot || {}).forEach(function (avain) {
      juuri.style.setProperty('--varjo-' + avain, T.varjot[avain]);
    });
    if (T.fontit) {
      if (T.fontit.teksti) juuri.style.setProperty('--fontti', T.fontit.teksti);
      if (T.fontit.numero) juuri.style.setProperty('--fontti-mono', T.fontit.numero);
    }
  }

  /* ── Nimet ja tavaramerkit ───────────────────────────────────────────────
     Jokainen sovelluksen, kauppiaan ja kryptovaluutan nimi haetaan tästä.
     Nimen vaihtaminen = yksi rivi sisalto.json:issa, ei koodimuutosta. */
  M.nimi = function (avain) {
    var n = (M.S && M.S.nimet && M.S.nimet[avain]) || null;
    return n ? n.nimi : String(avain).toUpperCase();
  };
  M.tunnusvari = function (avain) {
    var n = (M.S && M.S.nimet && M.S.nimet[avain]) || null;
    return (n && n.tunnusvari) || 'var(--teksti)';
  };
  /* Sanamerkki: jos graafikko on toimittanut assets/logo_<avain>.svg, se
     käytetään. Muuten nimi ladotaan tekstinä. Kumpikin päivittyy, kun
     sisalto.json:in nimi vaihtuu. */
  M.sanamerkki = function (avain) {
    var el = document.createElement('span');
    el.className = 'ko-sanamerkki';
    el.style.color = M.tunnusvari(avain);
    el.style.fontWeight = '600';
    el.style.letterSpacing = '.1em';
    el.textContent = M.nimi(avain);
    var kuva = new Image();
    kuva.onload = function () {
      el.textContent = '';
      kuva.alt = M.nimi(avain);
      kuva.style.height = '1em';
      kuva.style.display = 'block';
      el.appendChild(kuva);
    };
    kuva.src = 'assets/logo_' + avain + '.svg';
    return el;
  };

  /* ── Jäädytetty kello ────────────────────────────────────────────────────
     Vain sekunnit elävät. Tunnit ja minuutit ovat sisalto.json:issa, joten
     sama lukema tulee joka otossa eikä jatkuvuus rikkoudu. */
  M.kello = function () {
    var k = (M.S && M.S.luvut && M.S.luvut.kello) || '03:31';
    var osat = k.split(':');
    var s = Math.floor(Date.now() / 1000) % 60;
    return { teksti: osat[0] + ':' + osat[1], tunnit: osat[0], minuutit: osat[1], sekunnit: pad(s) };
  };

  /* ── Hohto ───────────────────────────────────────────────────────────────
     Kohtauksen käytännön valo. Väri, voimakkuus 0–9 ja puhdas tila, jossa
     käyttöliittymä katoaa ja jäljelle jää pelkkä valo kasvoille. */
  M.asetaHohto = function (vari, voima, puhdas) {
    if (vari !== undefined) M.hohto.vari = vari;
    if (voima !== undefined) M.hohto.voima = Math.max(0, Math.min(9, voima));
    if (puhdas !== undefined) M.hohto.puhdas = !!puhdas;

    var el = M._el.hohto;
    if (!el) return;
    var sarja = (M.T && M.T.hohto) || {};
    var v = sarja[M.hohto.vari] || null;

    if (!v || M.hohto.voima === 0) { el.style.opacity = '0'; el.classList.remove('ko-puhdas'); paivitaPalkki(); return; }

    el.classList.toggle('ko-puhdas', M.hohto.puhdas);
    if (M.hohto.puhdas) {
      el.style.background = v.taysi;
      el.style.opacity = String(0.35 + 0.65 * (M.hohto.voima / 9));
    } else {
      el.style.background =
        'radial-gradient(120% 85% at 50% 42%, ' + v.keskus + ' 0%, ' + v.reuna + ' 62%, rgba(0,0,0,0) 100%)';
      el.style.opacity = String((M.hohto.voima / 9) * (v.katto || 0.85));
    }
    paivitaPalkki();
  };

  M.asetaKirkkaus = function (arvo) {
    M.kirkkaus = Math.max(0.5, Math.min(1.4, arvo));
    document.documentElement.style.setProperty('--kirkkaus', M.kirkkaus.toFixed(2));
    paivitaPalkki();
  };

  M.asetaMusta = function (paalla) {
    M.musta = paalla === undefined ? !M.musta : !!paalla;
    if (M._el.musta) M._el.musta.classList.toggle('ko-paalla', M.musta);
    paivitaPalkki();
  };

  /* ── Cuet ────────────────────────────────────────────────────────────────
     Cue on nimetty tila, ei animaatio. Se piirretään alusta joka kerta ja
     cue-suhteellinen kello nollataan, jotta otto 5 näyttää samalta kuin
     otto 1. */
  M.aja = function (numero, hiljaa) {
    if (!M.cuet.length) return;
    numero = Math.max(0, Math.min(M.cuet.length - 1, numero));
    var c = M.cuet[numero];
    M.cue = numero;
    M.alkuAika = performance.now();

    var juuri = M._el.sovellus;
    juuri.innerHTML = '';
    juuri.style.setProperty('--tunnus', c.sovellus ? M.tunnusvari(c.sovellus) : 'var(--teksti)');

    var ctx = {
      rnd: siemen((c.siemen !== undefined ? c.siemen : 331) + numero * 1009),
      t: 0,
      S: M.S, T: M.T,
      laite: M.laite,
      nimi: M.nimi, tunnusvari: M.tunnusvari, sanamerkki: M.sanamerkki,
      e0: e0, e1: e1, e2: e2, eD: eD, kello: M.kello
    };
    M._ctx = ctx;

    /* Räpsy nollataan ENNEN piirtoa: cue voi käynnistää oman automaattinsa
       piirra-funktiossaan, ja nollaus jälkikäteen sammuttaisi sen heti. */
    if (global.GRIND && global.GRIND.glitch) {
      global.GRIND.glitch.automaattiPois();
      global.GRIND.glitch.jatkuva = false;
      global.GRIND.glitch.pois();
    }

    if (typeof c.piirra === 'function') c.piirra(juuri, ctx);

    /* Kosketustila: kun näyttelijä koskee ruutua, operaattorin piilotetut
       kulmat menevät pois päältä, jottei sormi laukaise cueta kesken oton. */
    M.kosketustila = !!c.kosketus;
    document.body.classList.toggle('ko-kulmat-pois', M.kosketustila);

    if (c.hohto) M.asetaHohto(c.hohto.vari || null, c.hohto.voima, c.hohto.puhdas || false);
    else M.asetaHohto(null, 0, false);

    if (M.musta && !hiljaa) M.asetaMusta(false);

    paivitaPalkki();
    if (!hiljaa) ilmoita(numero + ' · ' + c.nimi);
  };

  M.seuraava = function () { M.aja(M.cue + 1); };
  M.edellinen = function () { M.aja(M.cue - 1); };
  M.alkuun = function () {
    M.asetaKirkkaus(1);
    M.asetaMusta(false);
    M.aja(0);
  };

  /* Kuvanpäivitys. Cue voi määritellä tick(el, ctx) jatkuvaan liikkeeseen. */
  function silmukka(nyt) {
    var c = M.cuet[M.cue];
    if (c && typeof c.tick === 'function' && M._ctx) {
      M._ctx.t = (nyt - M.alkuAika) / 1000;
      c.tick(M._el.sovellus, M._ctx);
    }
    requestAnimationFrame(silmukka);
  }

  /* ── Ohjauspalkki ja ilmoitukset ─────────────────────────────────────── */
  function paivitaPalkki() {
    var p = M._el.palkki;
    if (!p) return;
    var c = M.cuet[M.cue];
    var osat = [];
    osat.push('<b>CUE ' + (M.cue < 0 ? '–' : M.cue) + '</b> ' + (c ? c.nimi : ''));
    osat.push('<span class="ko-erotin">·</span> kirkkaus <b>' + Math.round(M.kirkkaus * 100) + '%</b>');
    osat.push('<span class="ko-erotin">·</span> hohto <b>' +
      (M.hohto.voima && M.hohto.vari ? (M.hohto.puhdas ? 'puhdas ' : '') + M.hohto.vari + ' ' + M.hohto.voima : 'pois') + '</b>');
    if (M.musta) osat.push('<span class="ko-varoitus">MUSTA</span>');
    if (M.kosketustila) osat.push('<span class="ko-varoitus">NÄYTTELIJÄ KOSKEE — kulmat pois</span>');

    /* Offline-tila on kuvauspaikalla tärkein yksittäinen tieto: lentotilassa
       proppi joko toimii tai ei toimi, eikä sitä ehdi selvittää otossa. */
    var offline = {
      valmis:        ['ok',       'offline ✓'],
      asentuu:       ['varoitus', 'offline asentuu — avaa uudelleen'],
      purettu:       ['varoitus', 'OFFLINE PURETTU (?tuore) — avaa ilman sitä'],
      'ei-suojattu': ['virhe',    'EI OFFLINE — avattu ilman HTTPS:ää'],
      'ei-tuettu':   ['virhe',    'EI OFFLINE'],
      pois:          ['himmea',   'offline pois']
    }[M.offlineTila];
    if (offline) {
      osat.push('<span style="color:var(--' + offline[0] + ')">' + offline[1] + '</span>');
    }
    osat.push('<span class="ko-versio">' + M.laite + ' · v' + VERSIO + '</span>');
    p.innerHTML = osat.join(' ');
    paivitaPalkkiTila();
  }

  var ilmoitusAjastin = null;
  function ilmoita(teksti) {
    var el = M._el.ilmoitus;
    if (!el) return;
    el.textContent = teksti;
    el.classList.add('ko-nakyy');
    clearTimeout(ilmoitusAjastin);
    ilmoitusAjastin = setTimeout(function () { el.classList.remove('ko-nakyy'); }, 1100);
  }

  M.ilmoita = ilmoita;

  M.palkki = function (esilla) {
    M.palkkiEsilla = esilla === undefined ? !M.palkkiEsilla : !!esilla;
    document.body.classList.toggle('ko-palkki-esilla', M.palkkiEsilla);
    paivitaPalkkiTila();
  };

  /* Ohjauspalkki vie tilaa sisällöltä, ja kapealla ruudulla se rivittyy
     kahdelle riville. Mitataan todellinen korkeus sen sijaan että
     arvattaisiin — otossa palkki on piilossa ja tila on 0, jolloin
     sommittelu on se, jonka graafikko on suunnitellut. */
  function paivitaPalkkiTila() {
    var korkeus = (M.palkkiEsilla && M._el.palkki) ? M._el.palkki.offsetHeight : 0;
    document.body.style.setProperty('--palkki-tila', korkeus + 'px');
  }

  /* ── Näppäimet ═══════════════════════════════════════════════════════════
     Bluetooth-esitysklikkeri on HID-näppäimistö: se lähettää nuolia tai
     Page Up/Down. Siksi sama kartta toimii sekä klikkerillä että
     näppäimistöllä valmistelussa. */
  function nappain(t) {
    if (t.metaKey || t.ctrlKey || t.altKey) return;

    /* Glitch-näppäimet G X Y Z ovat samat kuin tuotannon aiemmassa propissa,
       jotta operaattorin lihasmuisti kantaa jaksosta toiseen. */
    if (global.GRIND && global.GRIND.glitch && global.GRIND.glitch.nappain(t)) {
      t.preventDefault();
      return;
    }

    var n = t.key;

    if (n === ' ' || n === 'ArrowRight' || n === 'ArrowDown' || n === 'PageDown') { t.preventDefault(); M.seuraava(); return; }
    if (n === 'ArrowLeft' || n === 'ArrowUp' || n === 'PageUp') { t.preventDefault(); M.edellinen(); return; }
    if (n >= '0' && n <= '9') { t.preventDefault(); M.aja(parseInt(n, 10)); return; }

    switch (n.toLowerCase()) {
      case 'h': M.palkki(); break;
      case 'r': M.alkuun(); break;
      case 'b': case '.': M.asetaMusta(); break;
      case '[': M.asetaKirkkaus(M.kirkkaus - 0.05); ilmoita('kirkkaus ' + Math.round(M.kirkkaus * 100) + ' %'); break;
      case ']': M.asetaKirkkaus(M.kirkkaus + 0.05); ilmoita('kirkkaus ' + Math.round(M.kirkkaus * 100) + ' %'); break;
      case '-': M.asetaHohto(undefined, M.hohto.voima - 1); ilmoita('hohto ' + M.hohto.voima); break;
      case '+': case '=': M.asetaHohto(undefined, M.hohto.voima + 1); ilmoita('hohto ' + M.hohto.voima); break;
      /* Hohdon väri ja puhdas tila ovat erillisillä näppäimillä, eivät
         Shift-yhdistelmillä: Bluetooth-klikkeri ei lähetä Shiftiä, ja
         operaattori säätää näitä pimeässä yhdellä sormella. */
      case 'p':
        M.asetaHohto('punainen', M.hohto.voima || 6);
        ilmoita('punainen hohto'); break;
      case 'v':
        M.asetaHohto('vihrea', M.hohto.voima || 6);
        ilmoita('vihreä hohto'); break;
      case 'u':
        M.asetaHohto(M.hohto.vari || 'punainen', M.hohto.voima || 6, !M.hohto.puhdas);
        ilmoita(M.hohto.puhdas ? 'puhdas hohto — pelkkä valo' : 'hohto sisällön päälle'); break;
      case 'o': M.asetaHohto(null, 0, false); ilmoita('hohto pois'); break;
      case 't': M.aja(M.cuet.length - 1); break;   // testikortti on viimeinen cue
      default: return;
    }
    t.preventDefault();
  }

  /* ── Piilotetut kulmat ═══════════════════════════════════════════════════
     Varajärjestelmä, jos klikkeri pettää. Puhelin on autotelineessä, joten
     näihin ei voi luottaa — mutta ne ovat ilmaiset. */
  function teeKulmat() {
    var kartta = [
      ['ko-kulma-oy', function () { M.seuraava(); }],
      ['ko-kulma-vy', function () { M.edellinen(); }],
      ['ko-kulma-va', function () { M.asetaMusta(); }]
    ];
    kartta.forEach(function (k) {
      var el = document.createElement('div');
      el.className = 'ko-kulma ' + k[0];
      el.addEventListener('pointerdown', function (t) { t.preventDefault(); k[1](); });
      document.body.appendChild(el);
    });
    /* Oikea alakulma: pitkä painallus tuo ohjauspalkin takaisin ilman
       näppäimistöä. Lyhyt painallus ei tee mitään, jottei se laukea vahingossa. */
    var oa = document.createElement('div');
    oa.className = 'ko-kulma ko-kulma-oa';
    var ajastin = null;
    oa.addEventListener('pointerdown', function (t) {
      t.preventDefault();
      ajastin = setTimeout(function () { M.palkki(true); ilmoita('ohjauspalkki esiin'); }, 1500);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (tapahtuma) {
      oa.addEventListener(tapahtuma, function () { clearTimeout(ajastin); });
    });
    document.body.appendChild(oa);
  }

  /* ── Asento ══════════════════════════════════════════════════════════════
     Molemmat propit ovat pystyssä. Selain ei voi lukita asentoa iOS:ssä,
     joten laitteen oma kiertolukko pitää olla päällä. Tämä on muistutus. */
  function tarkistaAsento() {
    var vaaka = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('ko-vaara-asento', vaaka);
  }

  /* ── Ruudun sammumisen esto ══════════════════════════════════════════════ */
  var lukko = null;
  function pidaHereilla() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (l) {
      lukko = l;
      l.addEventListener('release', function () { lukko = null; });
    }).catch(function () { /* Laitteen automaattilukitus = Ei koskaan hoitaa saman. */ });
  }

  /* ══ Käynnistys ═════════════════════════════════════════════════════════ */

  M.kaynnista = function (asetukset) {
    M.laite = asetukset.laite;

    var nakyma = new URLSearchParams(location.search);
    var tuore = nakyma.has('tuore');

    var lataukset = [
      hae('teema.json' + (tuore ? '?t=' + Date.now() : '')).catch(function () { return VARA_TEEMA; }),
      hae('sisalto.json' + (tuore ? '?t=' + Date.now() : '')).catch(function () { return VARA_SISALTO; })
    ];

    return Promise.all(lataukset).then(function (data) {
      M.T = data[0];
      M.S = data[1];
      sovellaTeema(M.T);

      if (nakyma.has('laitetiedot') || asetukset.laitetiedot) {
        M.piirraLaitetiedot(document.body);
        asennaOffline();
        return M;
      }

      M.cuet = asetukset.cuet(M);

      if (nakyma.has('esikatselu')) { M.piirraEsikatselu(); return M; }

      document.body.classList.add('ko-proppi');
      document.body.innerHTML =
        '<div id="ko-kuori">' +
          '<div id="ko-sovellus"></div>' +
          '<div id="ko-blokit"></div>' +
          '<div id="ko-glitch">' +
            '<div class="ko-slice a"></div><div class="ko-slice b"></div>' +
            '<div class="ko-glitch-lohkot"></div>' +
            '<div class="ko-juova"></div>' +
            '<div class="ko-rahina"></div>' +
          '</div>' +
        '</div>' +
        '<div id="ko-hohto"></div>' +
        '<div id="ko-musta"></div>' +
        '<div id="ko-palkki"></div>' +
        '<div id="ko-ilmoitus"></div>' +
        '<div id="ko-asento">Käännä laite pystyyn.<br>Tämä proppi on suunniteltu pystyasentoon.</div>';

      M._el.sovellus = document.getElementById('ko-sovellus');
      M._el.hohto = document.getElementById('ko-hohto');
      M._el.musta = document.getElementById('ko-musta');
      M._el.palkki = document.getElementById('ko-palkki');
      M._el.ilmoitus = document.getElementById('ko-ilmoitus');

      if (global.GRIND && global.GRIND.glitch) global.GRIND.glitch.ilmoita = ilmoita;

      teeKulmat();
      M.palkki(true);
      window.addEventListener('keydown', nappain);
      window.addEventListener('resize', function () { tarkistaAsento(); paivitaPalkkiTila(); });
      window.addEventListener('orientationchange', tarkistaAsento);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) pidaHereilla(); });
      document.addEventListener('gesturestart', function (t) { t.preventDefault(); });
      tarkistaAsento();
      pidaHereilla();

      var aloitus = parseInt(nakyma.get('cue'), 10);
      M.aja(isNaN(aloitus) ? 0 : aloitus, true);
      requestAnimationFrame(silmukka);

      asennaOffline();
      return M;
    });
  };

  /* ── Offline ═════════════════════════════════════════════════════════════
     Service worker esilataa kaiken, jotta proppi toimii lentotilassa.
     Rekisteröinti vaatii https:n tai localhostin — se on tiedossa ja
     dokumentoitu README:ssä. */
  function asennaOffline() {
    /* Offline-tuki vaatii suojatun yhteyden: https tai localhost. Läppärin
       http://192.168.x.x EI kelpaa — silloin selain ei anna service workeria
       lainkaan ja proppi kuolisi lentotilassa. Tämä näytetään ohjauspalkissa
       ja laitetiedoissa, jotta sitä ei tarvitse arvata kuvauspaikalla. */
    if (location.protocol === 'file:') { M.offlineTila = 'pois'; return; }
    if (!('serviceWorker' in navigator)) {
      M.offlineTila = window.isSecureContext ? 'ei-tuettu' : 'ei-suojattu';
      paivitaPalkki();
      return;
    }

    /* ?tuore=1 purkaa välimuistin kokonaan. Graafikko ja koodari käyttävät
       tätä, kun muutos ei näy. Offline-tuki asentuu uudelleen seuraavalla
       tavallisella avauksella — muista siis avata proppi kerran ilman
       tuore-lisäystä ennen kuvauspäivää. */
    if (new URLSearchParams(location.search).has('tuore')) {
      M.offlineTila = 'purettu';
      paivitaPalkki();

      /* Purku ei riitä: tämän latauksen on jo ehtinyt tarjoilla vanha
         service worker, joten ruudulla olisi yhä vanha versio. Puretaan
         ensin ja ladataan sitten kerran uudelleen. sessionStorage estää
         silmukan. */
      Promise.all([
        navigator.serviceWorker.getRegistrations().then(function (rekisterit) {
          return Promise.all(rekisterit.map(function (r) { return r.unregister(); }));
        }),
        global.caches
          ? caches.keys().then(function (avaimet) {
              return Promise.all(avaimet.map(function (a) { return caches.delete(a); }));
            })
          : Promise.resolve()
      ]).then(function () {
        var jo = false;
        try { jo = sessionStorage.getItem('grind3-tuore') === '1'; } catch (e) {}
        if (jo || !navigator.serviceWorker.controller) return;
        try { sessionStorage.setItem('grind3-tuore', '1'); } catch (e) {}
        location.reload();
      });
      return;
    }
    try { sessionStorage.removeItem('grind3-tuore'); } catch (e) {}

    M.offlineTila = navigator.serviceWorker.controller ? 'valmis' : 'asentuu';
    paivitaPalkki();

    navigator.serviceWorker.register('sw.js').then(function (rek) {
      return rek.update().catch(function () {}).then(function () { return rek; });
    }).then(function () {
      /* Ensiasennuksella sivua ei vielä ohjata, vaan vasta seuraavalla
         avauksella. Odotetaan sitä, jottei palkki lupaa liikoja. */
      if (navigator.serviceWorker.controller) M.offlineTila = 'valmis';
      paivitaPalkki();
    }).catch(function () {
      M.offlineTila = 'ei-tuettu';
      paivitaPalkki();
    });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      M.offlineTila = 'valmis';
      paivitaPalkki();
    });
  }

  /* ══ Laitetiedot ════════════════════════════════════════════════════════
     Tämä sivu on graafikkoa varten: se lukee oikean laitteen mitat siitä
     laitteesta, jolla se avataan, jotta artboardia ei tarvitse arvata. */

  var TUNNETUT = [
    { pt: '820×1180', nimi: 'iPad Air 11" (M2/M3) tai iPad Air 10,9" (4./5. sukupolvi)' },
    { pt: '834×1194', nimi: 'iPad Pro 11" (1.–4. sukupolvi)' },
    { pt: '834×1210', nimi: 'iPad Pro 11" (M4)' },
    { pt: '1024×1366', nimi: 'iPad Pro 12,9"' },
    { pt: '1032×1376', nimi: 'iPad Pro 13" (M4)' },
    { pt: '820×1180', nimi: 'iPad 10,9" (10. sukupolvi)' },
    { pt: '393×852', nimi: 'iPhone 14 Pro / 15 / 15 Pro / 16' },
    { pt: '402×874', nimi: 'iPhone 16 Pro' },
    { pt: '430×932', nimi: 'iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus' },
    { pt: '440×956', nimi: 'iPhone 16 Pro Max' },
    { pt: '375×812', nimi: 'iPhone X / XS / 11 Pro / 12 mini / 13 mini' },
    { pt: '390×844', nimi: 'iPhone 12 / 12 Pro / 13 / 13 Pro / 14' }
  ];

  function mittaaTurva() {
    var koe = document.createElement('div');
    koe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
      'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);' +
      'padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)';
    document.body.appendChild(koe);
    var t = getComputedStyle(koe);
    var ulos = {
      yla: parseFloat(t.paddingTop) || 0,
      ala: parseFloat(t.paddingBottom) || 0,
      vasen: parseFloat(t.paddingLeft) || 0,
      oikea: parseFloat(t.paddingRight) || 0
    };
    koe.remove();
    return ulos;
  }

  /* Virkistystaajuus lasketaan ruuduista sekunnissa. Jos sivu ei ole
     edessä, selain jarruttaa requestAnimationFramea eikä tulos kelpaa —
     silloin pyydetään mittaamaan uudelleen sen sijaan että näytettäisiin
     väärä luku. */
  function mittaaVirkistys(valmis) {
    if (document.hidden) { valmis(null); return; }
    var ruudut = 0, alku = performance.now();
    function askel(nyt) {
      ruudut++;
      if (nyt - alku < 1000) requestAnimationFrame(askel);
      else {
        var hz = Math.round((ruudut * 1000) / (nyt - alku));
        valmis(hz < 20 ? null : hz);
      }
    }
    requestAnimationFrame(askel);
  }

  M.piirraLaitetiedot = function (juuri) {
    document.body.className = 'ko-tiedot';
    var t = mittaaTurva();
    var lev = window.screen.width, kor = window.screen.height;
    var dpr = window.devicePixelRatio || 1;
    var pt = Math.min(lev, kor) + '×' + Math.max(lev, kor);
    var osumat = TUNNETUT.filter(function (m) { return m.pt === pt; }).map(function (m) { return m.nimi; });

    var rivit = function (otsikko, parit) {
      return '<div class="ko-ryhma"><h2>' + otsikko + '</h2>' +
        parit.map(function (p) {
          return '<div class="ko-rivi' + (p[2] ? ' ko-iso' : '') + '"><span>' + p[0] + '</span><span>' + p[1] + '</span></div>';
        }).join('') + '</div>';
    };

    juuri.innerHTML =
      '<div class="ko-tiedot-otsikko">Laitetiedot</div>' +
      '<div class="ko-tiedot-alaotsikko">GRIND jakso 3 · Pelkääjän paikka. Avaa tämä sivu sillä ' +
      'laitteella, jolla kuvataan, ja lukitse artboard näiden lukujen mukaan. ' +
      'Kopioi luvut alta ja lähetä graafikolle.</div>' +

      '<div class="ko-arvaus">' +
      (osumat.length
        ? 'Ruutukoko vastaa laitetta:<br><b>' + osumat.join('</b><br><b>') + '</b>'
        : '<b>Tuntematon ruutukoko.</b> Käytä alla olevia lukuja sellaisenaan — ne ovat oikeat riippumatta mallista.') +
      '</div>' +

      rivit('Artboard graafikolle', [
        ['Leveys × korkeus (pt)', lev + ' × ' + kor, true],
        ['Kuvatiheys', '@' + dpr + 'x', true],
        ['Vientikoko (px)', Math.round(lev * dpr) + ' × ' + Math.round(kor * dpr), true]
      ]) +

      rivit('Turva-alueet (pt)', [
        ['Ylä — tilapalkki / Dynamic Island', t.yla],
        ['Ala — kotipalkki', t.ala],
        ['Vasen', t.vasen],
        ['Oikea', t.oikea]
      ]) +

      rivit('Selainikkuna', [
        ['innerWidth × innerHeight', window.innerWidth + ' × ' + window.innerHeight],
        ['visualViewport', window.visualViewport
          ? Math.round(window.visualViewport.width) + ' × ' + Math.round(window.visualViewport.height) : '–'],
        ['Asento', window.innerWidth > window.innerHeight ? 'VAAKA — käännä pystyyn' : 'pysty']
      ]) +

      rivit('Kuvaustekniikka', [
        ['Virkistystaajuus', '<span id="ko-hz">mitataan…</span>'],
        ['Väriavaruus', window.matchMedia('(color-gamut: p3)').matches ? 'Display P3' : 'sRGB'],
        ['Järjestelmän teema', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'tumma' : 'vaalea']
      ]) +

      rivit('Asennus', [
        ['Kotivalikkosovellus', (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)
          ? '<span style="color:var(--ok)">kyllä</span>'
          : '<span style="color:var(--varoitus)">ei — avattu selaimessa</span>'],
        ['Offline-tuki', ('serviceWorker' in navigator)
          ? '<span style="color:var(--ok)">käytettävissä</span>'
          : (window.isSecureContext
              ? '<span style="color:var(--virhe)">ei tuettu</span>'
              : '<span style="color:var(--virhe)">EI — sivu avattu ilman HTTPS:ää</span>')],
        ['Yhteys', location.protocol.replace(':', '') +
          (window.isSecureContext ? ' · suojattu' : ' · EI suojattu')],
        ['Propin versio', 'v' + VERSIO]
      ]) +

      '<button class="ko-nappi" id="ko-kopio">Kopioi kaikki leikepöydälle</button>' +
      '<div id="ko-kopio-tulos"></div>';

    var mitattuHz = null;
    function naytaHz(hz) {
      mitattuHz = hz;
      var el = document.getElementById('ko-hz');
      if (!el) return;
      if (hz === null) {
        el.innerHTML = '<span style="color:var(--varoitus);text-decoration:underline">' +
          'napauta ja odota sekunti</span>';
        el.style.cursor = 'pointer';
        el.onclick = function () { el.textContent = 'mitataan…'; el.onclick = null; mittaaVirkistys(naytaHz); };
      } else if (hz > 70) {
        el.innerHTML = hz + ' Hz <span style="color:var(--varoitus)">— rajoita 60:een: ' +
          'Saavutettavuus → Liike → Rajoita kuvanopeus</span>';
      } else {
        el.textContent = hz + ' Hz';
      }
    }
    mittaaVirkistys(naytaHz);

    document.getElementById('ko-kopio').addEventListener('click', function () {
      var teksti =
        'GRIND jakso 3 — laitetiedot\n' +
        (osumat.length ? 'Laite: ' + osumat.join(' / ') + '\n' : '') +
        'Artboard: ' + lev + ' × ' + kor + ' pt @' + dpr + 'x\n' +
        'Vienti:   ' + Math.round(lev * dpr) + ' × ' + Math.round(kor * dpr) + ' px\n' +
        'Turva-alueet: ylä ' + t.yla + ' · ala ' + t.ala + ' · vasen ' + t.vasen + ' · oikea ' + t.oikea + ' pt\n' +
        'Asento: ' + (window.innerWidth > window.innerHeight ? 'vaaka' : 'pysty') + '\n' +
        'Väriavaruus: ' + (window.matchMedia('(color-gamut: p3)').matches ? 'Display P3' : 'sRGB') + '\n' +
        'Virkistystaajuus: ' + (mitattuHz === null ? 'ei mitattu' : mitattuHz + ' Hz') + '\n' +
        'Propin versio: v' + VERSIO;
      var tulos = document.getElementById('ko-kopio-tulos');
      (navigator.clipboard
        ? navigator.clipboard.writeText(teksti)
        : Promise.reject()
      ).then(function () { tulos.textContent = 'Kopioitu.'; })
        .catch(function () { tulos.textContent = 'Kopiointi ei onnistunut — ota kuvakaappaus.'; });
    });
  };

  /* ══ Esikatselu ═════════════════════════════════════════════════════════
     ?esikatselu — kaikki cuet allekkain laitteen oikeassa koossa. Graafikko
     näkee yhdellä silmäyksellä, mitä teema.json ja assets tekivät. */
  M.piirraEsikatselu = function () {
    document.body.className = 'ko-esikatselu';
    var mitat = M.laite === 'tabletti' ? [820, 1180] : [393, 852];
    var skaala = Math.min(1, (Math.min(window.innerWidth - 40, 420)) / mitat[0]);

    var otsikko = document.createElement('div');
    otsikko.className = 'ko-esikatselu-otsikko';
    otsikko.innerHTML =
      '<h1>Esikatselu · ' + M.laite + '</h1>' +
      '<p>Kaikki cuet ' + mitat[0] + ' × ' + mitat[1] + ' pt -kehyksessä, skaalattuna ' +
      Math.round(skaala * 100) + ' %. Hohtokerros ei ole mukana — se on operaattorin säädettävä. ' +
      'Jos muutos ei näy, lisää osoitteeseen <code>&amp;tuore=1</code>.</p>';
    document.body.appendChild(otsikko);

    M.cuet.forEach(function (c, i) {
      var nimi = document.createElement('div');
      nimi.className = 'ko-kehys-nimi';
      nimi.textContent = 'CUE ' + i + ' · ' + c.nimi + (c.sovellus ? ' · ' + M.nimi(c.sovellus) : '');

      var kehys = document.createElement('div');
      kehys.className = 'ko-kehys';
      kehys.style.width = (mitat[0] * skaala) + 'px';
      kehys.style.height = (mitat[1] * skaala) + 'px';

      var sisus = document.createElement('div');
      sisus.className = 'ko-sisus';
      sisus.style.width = mitat[0] + 'px';
      sisus.style.height = mitat[1] + 'px';
      sisus.style.transform = 'scale(' + skaala + ')';
      sisus.style.setProperty('--tunnus', c.sovellus ? M.tunnusvari(c.sovellus) : 'var(--teksti)');
      sisus.style.setProperty('--turva-yla', '59px');
      sisus.style.setProperty('--turva-ala', '34px');

      if (typeof c.piirra === 'function') {
        c.piirra(sisus, {
          rnd: siemen((c.siemen !== undefined ? c.siemen : 331) + i * 1009),
          t: 0, S: M.S, T: M.T, laite: M.laite,
          nimi: M.nimi, tunnusvari: M.tunnusvari, sanamerkki: M.sanamerkki,
          e0: e0, e1: e1, e2: e2, eD: eD, kello: M.kello
        });
      }
      kehys.appendChild(sisus);

      var kotelo = document.createElement('div');
      kotelo.appendChild(nimi);
      kotelo.appendChild(kehys);
      document.body.appendChild(kotelo);
    });
  };

  /* ══ Paikkamerkki ja kameratestikortti ══════════════════════════════════
     Vaiheen 1 sisältö. Paikkamerkki kertoo mikä cue on menossa; testikortti
     on kameratestin työkalu eikä poistu, vaikka sovellukset valmistuvat. */

  /* Kenttä saa olla joko valmis arvo tai funktio, joka saa ctx:n — näin
     paikkamerkki voi näyttää sisalto.json:in lukuja sellaisenaan. */
  function arvo(x, ctx) { return typeof x === 'function' ? x(ctx) : x; }

  M.paikkamerkki = function (asetukset) {
    return function (juuri, ctx) {
      var d = document.createElement('div');
      d.className = 'ko-paikka';

      var yla = document.createElement('div');
      yla.className = 'ko-paikka-yla';
      if (asetukset.sovellus) {
        var s = document.createElement('span');
        s.className = 'ko-sovellusnimi';
        s.textContent = ctx.nimi(asetukset.sovellus);
        yla.appendChild(s);
      }
      var aika = document.createElement('span');
      aika.textContent = ctx.kello().teksti;
      yla.appendChild(aika);
      d.appendChild(yla);

      var nimi = document.createElement('div');
      nimi.className = 'ko-paikka-nimi';
      nimi.textContent = arvo(asetukset.otsikko, ctx);
      d.appendChild(nimi);

      if (asetukset.kuvaus) {
        var k = document.createElement('div');
        k.className = 'ko-paikka-kuvaus';
        k.textContent = arvo(asetukset.kuvaus, ctx);
        d.appendChild(k);
      }

      if (asetukset.luku) {
        var l = document.createElement('div');
        l.className = 'ko-paikka-luku';
        l.style.color = asetukset.lukuvari || 'var(--teksti)';
        l.textContent = arvo(asetukset.luku, ctx);
        d.appendChild(l);
      }

      var tayte = document.createElement('div');
      tayte.className = 'ko-paikka-tayte';
      d.appendChild(tayte);

      var ala = document.createElement('div');
      ala.className = 'ko-paikka-yla';
      ala.innerHTML = '<span>PAIKKAMERKKI · vaihe 1</span><span>' + (asetukset.sovellus || '—') + '</span>';
      d.appendChild(ala);

      juuri.appendChild(d);
    };
  };

  M.testikortti = function () {
    return function (juuri, ctx) {
      var V = ctx.T.varit;
      var d = document.createElement('div');
      d.className = 'ko-paikka';

      function ryhma(otsikko, sisus) {
        return '<div class="ko-testi"><h3>' + otsikko + '</h3>' + sisus + '</div>';
      }

      var paletti = ['pohja', 'paneeli', 'paneeli-2', 'paneeli-3', 'viiva', 'viiva-2',
        'himmea-2', 'himmea', 'teksti', 'virhe', 'varoitus', 'ok']
        .map(function (avain) {
          return '<div class="ko-ruutu" style="background:' + V[avain] + '">' + avain + '</div>';
        }).join('');

      var rampi = [];
      for (var i = 0; i <= 10; i++) {
        var arvo = Math.round((i / 10) * 200 + 14);
        rampi.push('<span style="background:rgb(' + arvo + ',' + arvo + ',' + arvo + ')"></span>');
      }

      d.innerHTML =
        '<div class="ko-paikka-yla"><span class="ko-sovellusnimi">KAMERATESTI</span>' +
        '<span>' + ctx.laite + '</span><span>' + ctx.kello().teksti + '</span></div>' +

        ryhma('Paletti', '<div class="ko-ruudut">' + paletti + '</div>') +

        ryhma('Punainen: täyskylläinen vs. käytössä oleva', '<div class="ko-ruudut">' +
          '<div class="ko-ruutu" style="background:#FF0000;width:110px">#FF0000 ei</div>' +
          '<div class="ko-ruutu" style="background:' + V.virhe + ';width:110px">' + V.virhe + '</div>' +
          '</div>') +

        ryhma('Harmaaportaat — tarkista clippaus', '<div class="ko-rampi">' + rampi.join('') + '</div>') +

        ryhma('Viivanpaksuus 1 / 2 / 3 / 4 pt', '<div class="ko-viivat">' +
          '<div style="height:1px"></div><div style="height:2px"></div>' +
          '<div style="height:3px"></div><div style="height:4px"></div></div>') +

        ryhma('Tekstikoot 13 / 22 / 40 pt', '<div class="ko-portaat">' +
          '<div style="font-size:13px">13 pt — lähikuva ruudusta</div>' +
          '<div style="font-size:22px">22 pt — puolikuva</div>' +
          '<div style="font-size:40px;font-weight:600">40 pt — laaja</div></div>') +

        ryhma('Numerot, tabulaariset', '<div style="font-family:var(--fontti-mono);' +
          'font-variant-numeric:tabular-nums;font-size:34px;font-weight:600">' +
          ctx.e2(ctx.S.luvut.kate) + ' €&nbsp;&nbsp;' + ctx.S.luvut.vuoroTunnit + ' h&nbsp;&nbsp;0123456789</div>') +

        '<div class="ko-paikka-tayte"></div>' +
        '<div class="ko-paikka-yla"><span>[ ] kirkkaus · − + hohto · P/V väri · ⇧ puhdas · B musta</span></div>';

      juuri.appendChild(d);
    };
  };

  /* ══ Varapuu ════════════════════════════════════════════════════════════
     Käytetään vain jos teema.json / sisalto.json eivät lataudu — esimerkiksi
     kun tiedosto avataan suoraan file://-osoitteesta ilman palvelinta.
     Näiden arvojen pitää vastata JSON-tiedostoja. */
  var VARA_TEEMA = {
    varit: {
      'pohja': '#0E1116', 'paneeli': '#151A21', 'paneeli-2': '#1A2029', 'paneeli-3': '#202834',
      'viiva': '#232B36', 'viiva-2': '#2E3846', 'teksti': '#C8D0D8', 'himmea': '#6C7885',
      'himmea-2': '#4E5866', 'virhe': '#C4402F', 'varoitus': '#C79A3A', 'ok': '#5E9E6B'
    },
    hohto: {
      punainen: { keskus: 'rgba(196,64,47,.95)', reuna: 'rgba(120,26,20,.55)', taysi: '#B8382A', katto: 0.85 },
      vihrea: { keskus: 'rgba(94,158,107,.95)', reuna: 'rgba(30,84,46,.55)', taysi: '#4E9463', katto: 0.85 }
    }
  };

  var VARA_SISALTO = {
    nimet: {
      candlr: { nimi: 'CANDLR', tunnusvari: '#C9A227' },
      grumbl: { nimi: 'GRUMBL', tunnusvari: '#C25A7A' },
      tabb: { nimi: 'TABB', tunnusvari: '#A8746A' },
      hopp: { nimi: 'HOPP', tunnusvari: '#3E9E92' },
      reapercoin: { nimi: 'Reapercoin', tunnusvari: '#C4402F' }
    },
    luvut: { kello: '03:31', kate: 3.31, vuoroTunnit: 18 }
  };

  /* kartta.js voi olla ladattu ensin ja rekisteröinyt oman osansa
     GRIND-nimiavaruuteen. Yhdistetään sen sijaan että korvattaisiin —
     muuten latausjärjestys ratkaisisi, kumpi katoaa. */
  var aiempi = global.GRIND;
  if (aiempi) {
    Object.keys(aiempi).forEach(function (avain) {
      if (!(avain in M)) M[avain] = aiempi[avain];
    });
  }
  global.GRIND = M;
})(window);
