# Referenssit — tabletin kolme sovellusta

Mitä oikeista sovelluksista otetaan ja mitä ei, kun CANDLR, GRUMBL ja TABB
rakennetaan. Katsottu 12.8.2026.

**Raja on sama kuin HOPP:ssa:** genrekonventiot kyllä, ilme ei. Ammattikäyttäjä
saa tunnistaa sovelluksen *tyypin* sekunnissa, mutta ei tuotetta.
Ks. [BRIEF_GRAAFIKKO.md](BRIEF_GRAAFIKKO.md) kohta 8.

---

## 1. Alusta ratkaisee enemmän kuin sovellusgenre

Applen käyttöliittymäohjeisto on päivitetty **8.6.2026**, ja se on tässä
tärkeämpi lähde kuin yksittäiset sovellukset: se määrää miltä *kaikki*
nykyiset iPad-sovellukset näyttävät.

### Pystyasennossa tulee välilehtipalkki, ei sivupalkkia

Apple sanoo suoraan: sivupalkki vaatii paljon sekä pysty- että
vaakasuuntaista tilaa, ja iOS:ssä ja iPadOS:ssä **kannattaa harkita ensin
välilehtipalkkia**, koska se jättää enemmän tilaa sisällölle. Sivupalkissa
saa näyttää enintään kaksi hierarkiatasoa; syvemmällä siirrytään jaettuun
näkymään.

Meidän tabletti on lukittu **pystyyn 820 pt**. Se ratkaisee asian:

> **Kaikissa kolmessa sovelluksessa on kelluva välilehtipalkki alalaidassa,
> ei sivupalkkia.**

Tämä ei ole yksinkertaistus vaan se, miltä oikea pystyasennossa oleva
iPad-sovellus näyttää. Se myös säästää työtä, koska sivupalkkia ei tarvitse
piirtää eikä sen auki/kiinni-tilaa animoida.

### Liquid Glass — kelluva kerros sisällön päällä

Nykyinen materiaalijärjestelmä. Olennaista propin kannalta:

- Ohjaimet ja navigointi — välilehtipalkit, sivupalkit, työkalupalkit —
  muodostavat **oman kerroksensa, joka kelluu sisällön yllä**
- Sisältö **vierii ja kurkistaa niiden alta**, mikä antaa syvyyden tunnun
- **Liquid Glassia ei käytetä sisältökerroksessa** — taustat ovat tavallista
  materiaalia. Poikkeus: liukusäätimet ja kytkimet saavat lasi-ilmeen sillä
  hetkellä kun niitä kosketaan
- Kaksi muunnelmaa: **regular** sumentaa ja säätää taustan kirkkautta
  luettavuuden vuoksi (käytä siellä missä on paljon tekstiä), **clear** on
  hyvin läpinäkyvä ja tarkoitettu kelluttavaksi kuvan tai videon päälle
- Clear-muunnelma kirkkaan sisällön päällä vaatii **35 % tumman
  himmennyskerroksen**. Riittävän tumman sisällön päällä ei vaadi

HOPP tekee tätä jo: tilapilleri kelluu kartan päällä ja alapaneeli nousee
kartan yli. Sama rakenne siirtyy tabletille.

> **Varaus, joka pitää mitata kameratestissä.** Läpinäkyvyys ja sumennus ovat
> laajoja hienovaraisia liukuvärejä, ja juuri ne tuottavat 8-bittisessä
> videossa raitoja. Meidän eduksi käy se, että kaikki neljä sovellusta ovat
> tummia: tumman sisällön päällä ei tarvita himmennyskerrosta ja raidat ovat
> vähäisempiä. Pidä sumennussäde maltillisena ja katso testikuvasta.
> `backdrop-filter` on myös raskas — jos kaavio animoi sen alla, ruudunpäivitys
> voi notkahtaa.

### Katseluetäisyys

Apple mainitsee, että iPadia käytetään noin **90 cm:n etäisyydeltä**, ja että
etäisyyden pitäisi ohjata sisällön kokoa ja tiheyttä. Meillä tulee lisäksi
kameran etäisyys päälle — siksi briefin luettavuusportaat ovat olemassa.

---

## 2. CANDLR — kryptopörssi

Katsottu suoraan yhden ison pörssin julkiselta kurssisivulta 820 pt:n
leveydellä. Rakenne ylhäältä alas:

| Osa | Mitä siinä on |
|---|---|
| **Yläpalkki** | Kolikon tunnus (pyöreä kuvake) + nimi + tunnus suluissa, tähti (seurantalista), jako, valuutanvalitsin |
| **Kurssi** | Iso luku. Alla muutos: **nuoli + absoluuttinen summa + (prosentti)**, väri suunnan mukaan |
| **Aikavälit** | Pilleririvi `1H 1D 1W 1M 1Y ALL`, valittu täytettynä pillerinä. Sijaitsee kurssin oikealla puolella, samalla rivillä |
| **Kaavio** | Viivakaavio, ei kynttilöitä. **Hinta-asteikko oikeassa laidassa**, aika alalaidassa |
| **Tunnusluvut** | Ruudukko, 820 pt:llä **kolme saraketta**: markkina-arvo, kierrossa oleva määrä, volyymit 24 h / 7 pv / 30 pv, kaikkien aikojen huippu, kurssimuutos (1 v) |

### Kolme yksityiskohtaa, jotka kannattaa varastaa

1. **Aikavälipillerit ovat se, mikä lukee treidaussovelluksena laajassakin
   kuvassa.** Ne ovat tunnistettavampi merkki kuin itse kaavio. Tee ne isoina
2. **Hinta-asteikko on oikeassa laidassa**, koska tuorein hinta on kaavion
   oikeassa reunassa. Vasemmalle sijoitettu asteikko lukee heti vääränä
3. **Muutos näytetään kolmena osana**: nuoli, euromäärä ja prosentti
   suluissa. Pelkkä prosentti näyttää köyhältä

Vieritettäessä yläpalkki kutistuu **tiiviiksi otsikoksi**, jossa kolikon nimi
ja kurssi ovat pienenä allekkain. Hyvä yksityiskohta, jos kohtauksessa
vieritetään.

### Mitä EI oteta

Tunnistettavaa sinistä ympyrälogoa, pörssien omaa sanamerkkiasettelua,
eikä "Pro/Advanced"-tilan kynttilänäkymää — se on eri sovellus eikä sitä
Alvinan kaltainen käyttäjä avaa.

**Reapercoinille tarvitaan oma kolikkotunnus** (`assets/rpr_tunnus.svg`).
Se on ainoa kohta, jossa CANDLR tarvitsee piirrettyä grafiikkaa.

---

## 3. GRUMBL — keskustelupalsta

Katsottu suoraan yhdeltä isolta avoimen lähdekoodin foorumialustalta
tummassa teemassa. Rakenne:

| Osa | Mitä siinä on |
|---|---|
| **Sivunavigointi** | Koti · Aiheet · Lisää, sitten **KATEGORIAT** värillisin neliömerkein ja **TUNNISTEET**. Meillä tämä menee välilehtipalkkiin, ks. kohta 1 |
| **Suodatinrivi** | `kategoriat ▾  tunnisteet ▾ | Uusimmat · Kuumat · Ylin · Kategoriat` |
| **Listan sarakeotsikot** | Aihe · Osallistujat · Vastaukset · Aktiivisuus — järjestettäviä |
| **Rivi** | Otsikko, sen alla kategoria pienellä, valinnaiset tunnisteet, osallistujien kuvakkeet, vastausmäärä, **suhteellinen aika** (18 min, 1 h, 2 t, 3 t) |

Reddit-tyyliset elementit, jotka tulevat päälle: **äänestysnuolet ja pistemäärä
rivin vasemmassa laidassa**, `u/`-alkuiset käyttäjänimet, `c/`-alkuinen
aihealue (ei `r/` — se on suora lainaus).

### Kaksi asiaa, jotka ratkaisevat uskottavuuden

1. **Suhteellinen aika, ei kellonaika.** "3 t" lukee foorumina, "03:31" ei
2. **Pistemäärät ovat epätasaisia.** 1 331 · 892 · 447 · 3 310 lukee
   oikealta; tasaluvut eivät

### Mitä EI oteta

Oranssia tunnusväriä, pyöreää maskottia, `r/`-etuliitettä eikä nuolen muotoa,
joka on tunnistettavasti jonkun oma. GRUMBL on roosa (`#C25A7A`), ks. brief
kohta 3.

---

## 4. TABB — osta nyt, maksa myöhemmin

Julkista kuvamateriaalia näistä on niukasti — alan sovellukset eivät näytä
maksunäkymiään ulospäin. Se on itse asiassa hyvä uutinen: **erääntymisilmeen
saa keksiä vapaasti**, eikä tavaramerkkiriskiä juuri ole.

Mitä alan omista kuvauksista saa varmennettua:

- Päänäkymä on **"Maksut"**: tilaukset, mitä on maksettu ja mitä on tulossa
- Maksusuunnitelmat ovat nimettyjä tuotteita: **"maksa neljässä erässä"**,
  **"maksa 30 päivässä"**, kuukausirahoitus
- Tilauskohtaisesti voi **maksaa etuajassa tai vaihtaa maksutapaa**
- Erillinen **lompakko** maksutavoille
- Muistutukset ja ilmoitukset ovat iso osa tuotetta

### Mitä siitä seuraa TABB:iin

Ostosrivi ei ole pelkkä summa vaan **maksusuunnitelma**. Rivillä pitää näkyä:

```
kauppias · tuote
1 / 4 erää maksettu          erä 274,75 €        eräpäivä 12.3.
[merkintä: ERÄÄNTYNYT]
```

Erien laskuri (`1/4`, `3/4`) on se yksityiskohta, joka tekee rivistä
osamaksun eikä laskun. `sisalto.json`:issa on jo `tabbErat: 4` — se otetaan
käyttöön.

Ylhäälle **kokonaissumma ja myöhästymismaksut** omana korttinaan, alas
maksupainike. Kohtauksen kannalta luetaan **erääntymismerkinnät**, ei
summat — ks. brief kohta 6.

---

## 5. Yhteenveto: mitä tästä seuraa koodiin

| Päätös | Peruste |
|---|---|
| Kelluva **välilehtipalkki alalaidassa**, ei sivupalkkia | Apple: pystyasennossa harkitse ensin välilehtipalkkia; sivupalkki vaatii vaakatilaa |
| Navigointi ja ohjaimet **kelluvat sisällön päällä**, sisältö vierii alta | Liquid Glass -kerrosjako |
| Taustat **tavallista materiaalia**, ei lasia | Apple: älä käytä Liquid Glassia sisältökerroksessa |
| Sumennus maltillisena, ei himmennyskerrosta | Sovellukset ovat tummia; 8-bit-raidat ja `backdrop-filter`:n hinta |
| CANDLR: aikavälipillerit isoina, asteikko oikealle | Genren tunnistettavin merkki |
| GRUMBL: suhteellinen aika, epätasaiset pisteet | Uskottavuus |
| TABB: erälaskuri joka rivillä | Erottaa osamaksun laskusta |

---

## Lähteet

- [Sidebars — Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Materials (Liquid Glass) — Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Designing for iPadOS — Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados)
- [Coinbase, julkinen kurssisivu](https://www.coinbase.com/price/bitcoin) — kryptopörssin rakenne 820 pt:n leveydellä
- [Discourse Meta](https://meta.discourse.org/latest) — foorumin rakenne tummassa teemassa
- [Klarna-sovelluksen tuotesivu](https://www.klarna.com/us/klarna-app/) — osamaksusovelluksen näkymät ja tuotenimet
