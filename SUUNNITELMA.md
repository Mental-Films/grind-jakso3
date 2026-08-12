# GRIND — jakso 3, "Pelkääjän paikka"

## Kuvausproppi: Alvinan iPad ja iPhone

Suunnitelma. Ei vielä toteutettu.

Alvinan kohtaus tarvitsee neljä keksittyä sovellusta kahdella laitteella:
tabletilla kryptopörssi, keskustelupalsta ja osamaksupalvelu, puhelimessa
kyytipalvelun kuljettajanäkymä. Ruutu on kohtauksen valonlähde — punainen hohto
kasvoilla alussa ja lopussa, vihreä välissä.

Oma repo, oma osoite, oma graafikkobrief. Tuotannon aiemmasta propista
(`kuvausproppi`, peligraafikon työpöytä) peritään kamerasäännöt, väripohja,
typografia, cue-logiikka ja glitch-moottori. Ne ovat tuotantokohtaisia, eivät
jaksokohtaisia — koodi kopioidaan, sisältö tehdään alusta.

---

## 1. Ratkaisu lyhyesti

**Kaksi itsenäistä HTML-tiedostoa, jotka lisätään iOS:n kotivalikkoon ja ajetaan
lentotilassa.** Ei App Storea, ei TestFlightia, ei Xcodea, ei Apple Developer
-tiliä, ei kaapelia kuvauspaikalla.

```
proppi_tabletti.html   iPad — CANDLR, GRUMBL, TABB
proppi_puhelin.html    iPhone — HOPP Partner
```

Käyttöönotto laitteella kestää noin minuutin:

1. Avaa osoite Safarissa (kerran, verkkoyhteydellä)
2. Jaa → **Lisää Koti-valikkoon**
3. Avaa kotivalikon kuvakkeesta → koko ruutu, ei selainpalkkia
4. Lentotila päälle — proppi toimii offline sen jälkeen

Päivitys: avaa kerran verkossa, uusi versio latautuu itsestään. Versionumero
näkyy ohjauspalkissa, joten kuvauspaikalla voi varmistaa mikä build on koneessa.

### Miksi ei natiivisovellus

Natiivikuori (WKWebView) toisi täsmälleen yhden edun: **tilapalkin saisi
piiloon.** Sitä ei tarvita. Fiktiossa nämä ovat oikeita sovelluksia oikeassa
puhelimessa, joten iOS:n oma tilapalkki on *oikein* — se on osa illuusiota, ei
sitä vastaan. Kello väärennetään laitteen asetuksista ja lentotila poistaa
operaattorin nimen palkista.

Natiivireitti maksaisi Apple Developer -tilin, provisiointiprofiilit ja sen, että
jokainen grafiikkamuutos vaatii uuden asennuksen. Verkkoproppi päivittyy itse.

> **Yksi tunnettu riski:** iOS voi siivota kotivalikkosovelluksen välimuistin,
> jos sovellusta ei avata viikkoihin. Ratkaisu: avaa proppi laitteella kerran
> ennen jokaista kuvauspäivää verkkoyhteydellä. Jos kuvausjakso on pitkä ja
> laitteet seisovat kaapissa, natiivikuori kannattaa harkita — **verkkokoodi on
> silloin sama, vain kuori vaihtuu.** Työtä ei menetetä.

---

## 2. Ohjaus kuvauspaikalla

Työpöytäproppia ajetaan näppäimistöltä. iPadissa ja iPhonessa ei ole
näppäimistöä — mutta **Bluetooth-esitysklikkeri on HID-näppäimistö.** Se
lähettää nuolinäppäimiä tai Page Up/Down. Sama cue-moottori toimii sellaisenaan.

| Ohjaustapa | Käyttö | Huom |
|---|---|---|
| **Bluetooth-klikkeri** (ensisijainen) | Operaattori kuvan ulkopuolella painaa cueta eteenpäin | Yksi klikkeri per laite. Osta sellainen, joka toimii *näppäimistötilassa* — moni halpa lähettää äänenvoimakkuusnäppäimiä, jotka eivät kanna selaimeen. Sivunkääntöpoljin toimii myös |
| **Piilotetut kosketusalueet** (vara) | Ruudun kulmat: oikea ylä = seuraava, vasen ylä = edellinen, pitkä painallus oikea ala = ohjauspalkki | Toimii vain jos laitteeseen ylettyy. Puhelin on telineessä autossa, joten tähän ei voi luottaa |
| **Ajastettu eteneminen** | Cue käynnistää oman animaationsa ja etenee itse | Siellä missä ajoitus on tiukka: hyväksymisajastin, reittiviivan eteneminen |
| **Näyttelijän kosketus** | Alvina painaa itse HYVÄKSY ja START RIDE ja kirjoittaa postauksen | Ruutu vastaa oikeasti. Nämä ovat cue-siirtymiä |

Klikkeri pariutetaan **lentotilan jälkeen**: lentotila katkaisee Bluetoothin
ensimmäisellä kytkennällä, mutta sen saa takaisin päälle lentotilan ollessa
voimassa. Järjestys: lentotila → Bluetooth → klikkeri.

### Näyttelijän kosketus vs. operaattorin kosketus

Kun sovellus on tilassa, jossa Alvinan odotetaan koskevan ruutua (postauksen
kirjoitus, HYVÄKSY, START RIDE), piilotetut kulma-alueet menevät pois päältä ja
ohjauspalkkiin syttyy varoitus. Muuten näyttelijän sormi laukaisisi cuen kesken
oton. Klikkeri toimii silloinkin. Sama ratkaisu kuin työpöytäpropin chatissa.

---

## 3. Jatkuvuus: sama otto joka otossa

Kohtaus kuvataan monesta kuvakulmasta. Käyrän pitää näyttää laajassa ja
lähikuvassa samalta, tai leikkaus ei mene kasaan.

- **Kaikki "satunnainen" on siemennettyä.** Sahalaitakäyrän kohina, kurssin
  heilahtelut ja tilausten sijainnit tulevat kiinteästä siemenluvusta. Cue 0
  piirtää saman käyrän tänään ja huomenna
- **Animaatiokello nollautuu cuesta.** Otto 5 näyttää samalta kuin otto 1
- **Kellonaika on jäädytetty.** Vain sekunnit elävät
- **Lukemat eivät ryömi.** Saldo, työtunnit ja ansiot ovat kiinteitä lukuja,
  eivät kasvavia laskureita — paitsi siellä missä käsikirjoitus vaatii muutosta
- Glitchit ovat tarkoituksellinen poikkeus: ne arvotaan joka kerta, jotta
  räpsähdys ei toistu identtisenä

---

## 4. Sovellukset

Keksittyjä. Tunnistettava *tyyppi*, ei tuote.

| Sovellus | Laite | Tyyppi | Vaihtoehtoiset nimet |
|---|---|---|---|
| **CANDLR** | tabletti | Kryptopörssi ja treidaus | Spindl, Wickr, Bullpen |
| **GRUMBL** | tabletti | Keskustelupalsta, aihealueet ja äänestys | Warren, Threadle |
| **TABB** | tabletti | Osta nyt, maksa myöhemmin | Laterr, Owed |
| **HOPP Partner** | puhelin | Kyytipalvelun kuljettajanäkymä | Vectr, Haul |

Sivuroolit, jotka näkyvät vain TABB:n ostosriveillä: ruokalähetti **NIBBL**,
vaatemerkki **NORDKAP**, puhelin **NOVEX 14 Pro**.

Kryptovaluutta on käsikirjoituksen **Reapercoin**, tunnus **RPR**.

> Nimet on valittu niin, ettei tunnettuja tuotteita tarvitse klaarata. Tuotannon
> pitää silti ajaa niille tavaramerkkihaku ennen lukitsemista — se ei ole propin
> tekijän ratkaistavissa. Sama koskee Reapercoinia, joka tulee käsikirjoituksesta.

### Kaikki neljä tummina

Taiteellinen valinta, jolla on tekninen peruste. Kohtaus on yöllä ja
käsikirjoitus rakentuu sille, että **ruudun hohto värittää Alvinan kasvot** —
ensin punaisena, sitten vihreänä, lopuksi taas punaisena. Vaalea käyttöliittymä
pesisi kasvot valkoiseksi ja tappaisi efektin, ja kaksi vaaleaa sovellusta
kolmesta rikkoisi valon jatkuvuuden leikkauksessa.

Tumma tila on myös uskottava: kukaan ei selaa osamaksusaldojaan vaaleassa
teemassa kello kolmelta yöllä.

---

## 5. Ajolista

### Tabletti — `proppi_tabletti.html`

| Cue | Sovellus | Ruudulla |
|:---:|---|---|
| **0** | CANDLR | **Romahdus.** Reapercoin. Verenpunainen sahalaitakäyrä lävistää asteikon diagonaalisesti ylhäältä alas. Miinusmerkit ja tappioluvut vilkkuvat. Punainen hohto |
| **1** | GRUMBL | **Postaus.** Alvina kirjoittaa otsikon: `My crypto portfolio is tanking!! WTF DO I DO???` |
| **2** | TABB | **Ostosrivit.** NOVEX 14 Pro, NIBBL-tilauksia, NORDKAP-takki. Valtaosa merkitty **ERÄÄNTYNYT** |
| **3** | — | **Lepotila.** Musta ruutu ottojen väliin ja kohtiin, joissa Alvina nukkuu |
| **4** | CANDLR | **Raketti.** Käyrä vaihtuu vihreäksi ja nousee jyrkästi. Banneri: `Your portfolio is rocketing! Buy in before it's too late!` Vihreä hohto |
| **5** | CANDLR | **Saldo.** Tilin kate: **3,31 €** |
| **6** | CANDLR | **Loppukuva.** Hohto kääntyy takaisin punaiseksi |

Cue 4 on tila, ei siirtymä: Alvina *herää* vihreään ruutuun. Siirtymäversio
(`⇧4`) on olemassa siltä varalta, että ohjaaja haluaa värin kääntyvän kuvassa.

### Puhelin — `proppi_puhelin.html`

| Cue | Ruudulla |
|:---:|---|
| **0** | **Vuoroloki.** Työvuoro **18 tuntia**. Ansiot, hyväksymisprosentti |
| **1** | **Räpsy + ajastin.** Ruutu häiriöityy. Hyväksymisajastin sykkii ja laskee sekunteja |
| **2** | **Matkustaja kyydissä.** Navigaattori aukeaa, **START RIDE** -painike. Alvina painaa itse |
| **3** | **Ajossa.** GPS-näkymä, punainen reittiviiva etenee kartalla |
| **4** | **Metsätie.** Näytölle: **KÄÄNNY YMPÄRI** |
| **5** | **Uusi kyytipyyntö.** Lähellä oleva asiakas, hyvä provikkaennuste, laskeva ajastin. Alvina painaa **HYVÄKSY** |

Kartta on graafikon piirtämä vektorikartta, ei karttapalvelu — se toimii
offline, näyttää siltä miltä halutaan eikä vaadi lisenssiä. Punainen reitti on
polku, jota piirretään auki cuen edetessä. Metsätieosuus on osa piirrosta.

> Jakson nimi kannattaa pitää mielessä telineen paikkaa valittaessa. Jos puhelin
> on kiinnitetty kojelaudan oikeaan laitaan, sovellus istuu kirjaimellisesti
> pelkääjän paikalla ja antaa ohjeet sieltä. Se on ilmainen kuva.

---

## 6. Hohtokerros

Ruutu on kohtauksen käytännön valo. Sille on oma ohjaus, erillään sisällöstä:

| Näppäin | Toiminto |
|---|---|
| `[` `]` | Sovelluksen oma kirkkaus 50–140 % |
| `−` `+` | Hohdon voimakkuus 0–9 |
| `P` / `V` | Hohdon väri punainen / vihreä riippumatta cuesta |
| `O` | Hohto pois |
| `U` | Puhdas hohto: tasainen väri ilman käyttöliittymää |
| `B` | Musta ruutu ottojen väliin |

Jokainen toiminto on omalla näppäimellään eikä yhdenkään takana ole
Shift-yhdistelmää. Kaksi syytä: Bluetooth-klikkeri ei lähetä Shiftiä, ja
operaattori säätää näitä pimeässä yhdellä sormella.

Kirkkautta säädetään **sovelluksesta, ei laitteen omasta kirkkaussäätimestä.**
Laitteen himmennys on pulssitusta, joka lyö kameran sulkijaa vastaan.
**Laitteen kirkkaus 100 %, automaattikirkkaus pois.**

Realistinen odotus: iPad ei ole valaisin. Jos kuvaaja tarvitsee enemmän
spilliä, tavallinen ratkaisu on ruudun väriin sovitettu LED kuvan ulkopuolella,
ja ruutu hoitaa katseen suunnan ja liikkeen. Proppi tekee osansa, ei ihmeitä.

---

## 7. Välkyntä

Käsikirjoituksessa on kolme välkkyvää elementtiä: miinusmerkit, sykkivä ajastin
ja räpsyvä puhelinruutu. Jos jakso menee televisiolevitykseen, koko ruudun
välähdyksiä koskevat rajat.

Proppiin koodataan valmiiksi:

- **Enintään 3 koko ruudun luminanssimuutosta sekunnissa**
- **Kylläistä punaista välkkyä vain rajatulla pinta-alalla**, ei koko ruutu —
  punainen välähdys on erikseen mainittu riskitekijä lähetysstandardeissa
- Räpsyn kesto arvotaan lyhyeksi purskeeksi. Jatkuva tila on saatavilla ⇧:llä,
  mutta se on operaattorin tietoinen valinta

Tämä ei korvaa tuotannon omaa välkyntätarkistusta valmiille leikkaukselle, mutta
estää sen, että proppi tuottaa materiaalia, joka jouduttaisiin hylkäämään.

---

## 8. Laiteasetukset ennen ottoa

| | |
|---|---|
| **Lentotila** | Päälle. Poistaa operaattorin nimen tilapalkista ja estää ilmoitukset |
| **Bluetooth** | Takaisin päälle lentotilan jälkeen, klikkeri pariutettuna |
| **Älä häiritse** | Päälle |
| **Kirkkaus** | 100 %, automaattikirkkaus **pois** |
| **True Tone / Night Shift** | Pois. Muuten värilämpötila vaihtelee ottojen välillä |
| **Automaattilukitus** | Ei koskaan |
| **Kellonaika** | Käsin asetettuna. Yleiset → Päivä ja aika → automaattinen pois |
| **Akku** | Ladattuna. Prosentti näkyy kuvassa, joten se on jatkuvuutta |
| **Ohjattu käyttö** | Päälle. Estää vahingossa poistumisen sovelluksesta |
| **ProMotion-laitteet** | Saavutettavuus → Liike → Rajoita kuvanopeus. Lukitsee 60 Hz:iin |
| **Ruutu** | Puhdistettu. Sormenjäljet näkyvät tummalla ruudulla armottomasti |

Kameratesti ennen kuvauspäivää: sulkijaa säädetään kunnes rullaava palkki
katoaa. Tabletin oma polarisaatio kannattaa tarkistaa, jos kameran edessä on
polarisaatiosuodin — tietyissä kulmissa ruutu menee mustaksi.

---

## 9. Varajärjestelmät

| Vika | Vara |
|---|---|
| Proppi ei aukea | Toinen laite, identtinen asennus, mukana kuvauspaikalla |
| Klikkeri ei vastaa | Piilotetut kulma-alueet |
| Välimuisti tyhjentynyt | Puhelimen jakama verkkoyhteys, avaa kerran |
| Kaikki pettää | Jokaisesta cuesta täysruutu-PNG laitteen kuvissa. Ei animaatiota, mutta kuva on olemassa |

Kuvakaappaukset kannattaa ottaa prep-päivänä joka tapauksessa: ne ovat samalla
jatkuvuuskuvat kuvaussihteerille.

---

## 10. Työvaiheet

| # | Vaihe | Arvio |
|:--:|---|---|
| 1 | Runko: cue-moottori, hohtokerros, kirkkaus, kulma-alueet, kotivalikkoasennus, offline. Cue- ja glitch-moottori siirretään työpöytäpropista | 1 pv |
| 2 | **Laiteasennus ja kameratesti paikkamerkeillä.** Ennen kuin yhtään sovellusta viimeistellään | 0,5 pv |
| 3 | CANDLR — käyrä, romahdus, raketti, saldo | 1 pv |
| 4 | GRUMBL — palsta, postauksen kirjoitus, haamunäppäimistö | 1 pv |
| 5 | TABB — ostosrivit | 0,5 pv |
| 6 | HOPP Partner — vuoroloki, tilaus, kartta, reitti, varoitus | 1,5 pv |
| 7 | Graafikon assetit sisään, tekstit lukkoon | 0,5 pv |
| 8 | Ajoitukset ohjaajan makuun, varakuvat, ajolista tulostettuna | 1 pv |
| | **Yhteensä** | **≈ 7 pv** |

Vaihe 2 on tarkoituksella aikaisin. Jos laitteessa tai kameran kanssa on
ongelma, se selviää päivässä eikä viikossa.

### Haamukirjoitus

Cue 1 vaatii, että Alvina kirjoittaa postauksen otsikon. iOS:n oma näppäimistö
tuo mukanaan ennakoivan tekstipalkin ja automaattikorjauksen, ja yksikin
näppäilyvirhe pilaa oton.

Ratkaisu: **sovelluksen oma näppäimistö**, joka näyttää oikealta mutta ei ole
oikea. Jokainen painallus tuottaa seuraavat merkit käsikirjoituksen tekstistä
riippumatta siitä, mihin näyttelijä osuu. Alvina saa naputella luontevasti ja
katsoa ylös kesken lauseen — ruudulle tulee joka otossa täsmälleen oikea teksti
oikeassa tahdissa.

Sama tekniikka mahdollistaa halutut kirjoitusvirheet ja korjaukset: `tanking!!`
voi ilmestyä ensin muodossa `tankinh` ja korjautua. Se lukee kameralle
hermostuneisuutena.

---

## 11. Tiedostot

```
proppi_tabletti.html    iPad — CANDLR, GRUMBL, TABB. Ajolista ja cue-määrittelyt
proppi_puhelin.html     iPhone — HOPP Partner. Ajolista ja cue-määrittelyt
moottori.js             Cue-moottori, hohto, kirkkaus, kulmat, laitetiedot, esikatselu
runko.css               Rakenteen tyylit (värit tulevat teema.json:ista)
teema.json              Värit ja kirjasimet          ← graafikko muokkaa
sisalto.json            Kaikki teksti ja numerot     ← graafikko ja ohjaaja muokkaavat
assets/                 Grafiikka — pudota tänne     ← graafikko täyttää
laitetiedot.html        Laitteen mitat graafikolle
sw.js                   Offline-välimuisti
manifest_tabletti.json  Kotivalikon nimi ja kuvake
manifest_puhelin.json   "
index.html              Aloitussivu, molemmat propit ja työkalut
robots.txt              noindex
SUUNNITELMA.md · BRIEF_GRAAFIKKO.md · README.md
```

Kaksi proppia jakavat saman moottorin. Tuotannon aiempi proppi oli yksi tiedosto,
mutta täällä kaksi laitetta ajaa samaa cue-logiikkaa, hohtoa ja kirkkaussäätöä —
kahtena kopiona ne eroaisivat toisistaan ensimmäisen korjauksen jälkeen.
Sovelluskohtainen sisältö pysyy omissa `proppi_*.html`-tiedostoissaan.

Repo pidetään indeksoimattomana (`robots.txt`, `noindex`) kuten aiemmassa.

### Tila 12.8.2026

Vaihe 1 on tehty ja testattu selaimessa: cue-moottori, hohtokerros, kirkkaus,
piilotetut kulmat, näyttelijän kosketustila, offline-asennus, `laitetiedot.html`,
`?esikatselu` ja kameratestikortti. Molemmat ajolistat ovat ajettavissa
paikkamerkeillä — ohjaaja voi harjoitella cue-rytmin jo tällä versiolla.

Seuraavaksi vaihe 2: asennus oikeille laitteille ja kameratesti. Vasta sen
jälkeen kannattaa viimeistellä yhtäkään sovellusta.

---

## 12. Päätökset

Ratkaistu 12.8.2026. Nämä on viety koodiin ja graafikon briefiin.

| # | Kysymys | Päätös | Mitä siitä seurasi |
|:--:|---|---|---|
| 1 | Laitemallit | **iPad Air.** iPhone ei vielä tiedossa | Tabletin artboard 820 × 1180 pt @2x. Puhelin on koodissa mallista riippumaton, ja `laitetiedot.html` antaa tarkat mitat heti kun laite on kädessä |
| 2 | Asento | **Molemmat pystyyn** | Vaaka-asennot jäävät kokonaan pois. Proppi näyttää muistutuksen, jos laite käännetään |
| 3 | Missä tablettikohtaukset ovat | **Autossa** | Ohi vilistävät katuvalot ja tuulilasin heijastukset elävät kuvassa, joten kirkkaus ja hohto säädetään otto kerrallaan. Kumpaankaan laitteeseen ei ylety kesken oton → **klikkeri on ainoa ohjaustapa**, kulmat vain varalla |
| 4 | Kieli | **CANDLR, GRUMBL ja TABB englanniksi, HOPP suomeksi** | Kirjoitettu `sisalto.json`:iin sellaisenaan. Ei käännöskerrosta — kukin sovellus on omalla kielellään |
| 5 | Näkyykö kotivalikko | **Ei — vain sovellukset näkyvät** | Kotivalikon kuvakkeet ja taustakuvat putosivat graafikon työlistalta. Propissa on paikkamerkkikuvakkeet, jotta operaattori löytää oikean propin |
| 6 | Puhelin liikkuvassa autossa | **Kyllä** | Kartta liikkuu ja reitti etenee ajon mukana (vaihe 6). Teline ja tärinä otetaan huomioon kameratestissä |
| 7 | Onko 3,31 € tarkka | **Kyllä** | Luvut on vedetty samaan sarjaan: 331 · 33,1 · 3 310 · 83,1. Koko sarja on `sisalto.json`:in `luvut`-lohkossa yhtenä ryhmänä, joten sen näkee ja muuttaa kerralla |
| 8 | Tavaramerkit | **Tehdään helposti vaihdettaviksi** | Jokainen nimi on `sisalto.json`:in `nimet`-lohkossa. Yhden rivin muutos vaihtaa nimen kaikkialle — otsikoihin, sanamerkkeihin ja ostosriveille. Jos graafikko toimittaa `assets/logo_<nimi>.svg`, sitä käytetään, muuten nimi ladotaan tekstinä. Kummassakin tapauksessa lähde on sama rivi |

Yksi asia jäi auki eikä se estä mitään: **iPhonen malli.** Kun laite on
tiedossa, ajetaan `laitetiedot.html` sillä ja lukitaan puhelimen artboard.
