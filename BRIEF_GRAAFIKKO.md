# GRIND, jakso 3 "Pelkääjän paikka" — brief graafikolle

**Kohtaus:** Alvina, yö. Kryptosalkku romahtaa tabletilla, osamaksut ovat
erääntyneet, ja puhelin telineessä vaatii lisää työvuoroa 18 tunnin jälkeen.
Ruutu on kohtauksen valonlähde: **punainen hohto kasvoilla alussa, vihreä
keskellä, punainen lopussa.**

Kaksi laitetta, neljä keksittyä sovellusta:

| Laite | Sovellus | Tyyppi |
|---|---|---|
| **iPad** | **CANDLR** | kryptopörssi |
| | **GRUMBL** | keskustelupalsta |
| | **TABB** | osta nyt, maksa myöhemmin |
| **iPhone** | **HOPP Partner** | kyytipalvelun kuljettajanäkymä |

Propit ovat toiminnassa: ne ajetaan oikeilla laitteilla, ja näyttelijä koskee
ruutua oikeasti — kirjoittaa postauksen, painaa START RIDE ja HYVÄKSY.

Jos teit tuotannon aiemman propin (peligraafikon työpöytä), **kohdat 3 ja 8 ovat
tuttuja** — peruspaletti, kamerasäännöt ja typografia ovat tuotantokohtaisia ja
periytyvät sellaisenaan. Loput on uutta.

---

## 1. Miten muutat grafiikkaa ilman että kukaan kääntää mitään

Kolme mekanismia. Kaikki toimivat pelkällä tiedoston tallennuksella.

| Mitä muutat | Miten |
|---|---|
| **Kuvat, logot, ikonit** | Pudota tiedosto `assets/`-kansioon oikealla nimellä. Se korvaa paikkamerkin automaattisesti |
| **Värit, kirjasimet, pyöristykset, välit, tekstikoot, varjot** | Muokkaa `teema.json`-tiedostoa tekstieditorissa. Yksi arvo, tallenna, päivitä sivu |
| **Kaikki teksti ja numerot** — postauksen otsikko, ostosrivit, kadunnimet, painikkeiden tekstit | Muokkaa `sisalto.json`-tiedostoa |

### Jos toimitat valmiin ilmeen

**Koko ulkoasu vaihdetaan `teema.json`:ista, ei CSS-tiedostoja muokkaamalla.**
Tämä on rakennettu sitä varten, että ohjeistus voi tulla vasta myöhemmin —
esimerkiksi valmiina Figma-sivuna. Tiedostossa on neljä lohkoa:

| Lohko | Mitä siinä on |
|---|---|
| `varit` | Koko paletti |
| `mitat` | Pyöristykset (`kaarre-s` … `kaarre-xl`), välit (`vali-xs` … `vali-xl`), viivanpaksuudet, pienin kosketusalue |
| `typografia` | Tekstikokoportaat `jatti` · `iso` · `suuri` · `otsikko` · `vali` · `leipa` · `pieni` · `mikro` |
| `varjot` | Kelluvien kerrosten varjot |

Sovellukset eivät sisällä yhtään pistekokoa tai pyöristystä suoraan — ne
käyttävät vain näitä nimiä. Käytännössä: kun annat uuden ilmeen, kerro se
näiden kahdeksan tekstikoon ja viiden pyöristyksen kautta, niin kaikki neljä
sovellusta muuttuvat kerralla eikä mitään jää vanhaan.

Jos ilmeessä on jotain, mikä ei taivu näihin nimiin, sano — lisätään lohkoon
uusi nimi. Se on aina parempi kuin luvun kirjoittaminen CSS:ään.

Kumpaakaan JSON-tiedostoa ei tarvitse osata koodata. Ne ovat listoja muotoa
`"nimi": "arvo"`, ja jokaisella rivillä on kommentti siitä mikä se on.

**Esikatselu:** avaa proppi selaimessa lisäämällä osoitteen perään
`?esikatselu`. Saat yhden sivun, jolla on **kaikki cue-tilat vierekkäin** laitteen
oikeassa koossa. Näet yhdellä silmäyksellä miltä muutoksesi näyttävät.

Jos muutos ei näy, lisää perään `&tuore=1`. Se purkaa offline-välimuistin ja
hakee kaiken uudelleen. Muista avata proppi kerran **ilman** tuore-lisäystä
ennen kuvauspäivää, jotta offline-tuki asentuu takaisin.

Molemmat JSON-tiedostot ovat kommentoituja, ja kommentit saa jättää paikalleen —
proppi lukee ne kommentteineen. Tiedostojen katsominen kannattaa aloittaa
`teema.json`:in `varit`-lohkosta ja `sisalto.json`:in `nimet`-lohkosta.

---

## 2. Laitteet ja artboardit

Käyttöliittymät ovat vektoria ja skaalautuvia, joten artboard on suunnittelun
apuväline, ei sitova ruudukko. Suunnittele silti oikeassa koossa.

| Laite | Pisteet (pt) | Kerroin | Vientikoko (px) | Tila |
|---|---|---|---|---|
| **iPad Air** | **820 × 1180** | @2x | 1640 × 2360 | lukittu |
| iPhone | tarkistetaan | @3x | — | **malli auki** |

Tablettikohtaukset voi aloittaa heti. **Puhelimen mallia ei ole vielä
lukittu**, joten aloita puhelimesta vasta kun saat mitat — tai suunnittele
rakenne suhteellisena ja lukitse pikselit myöhemmin.

> **Mitat luetaan laitteesta, ei taulukosta.** Avaa `laitetiedot.html`
> kuvauslaitteella. Se tulostaa ruutukoon, kuvatiheyden, turva-alueet ja
> virkistystaajuuden **siitä laitteesta, jolla se avataan**, ja lopussa on
> Kopioi-nappi. Tee tämä sen jälkeen kun sivu on lisätty Koti-valikkoon ja
> avattu sieltä — selaimessa luvut ovat lähellä mutta eivät samat.

**Turva-alueet** (varmista samalta sivulta):

- Ylhäällä tilapalkki ja Dynamic Island — noin **59 pt** puhelimessa, **24 pt** tabletissa
- Alhaalla kotipalkki — **34 pt** puhelimessa, **20 pt** tabletissa

Tilapalkkia **ei piiloteta.** Se on tarkoituksellista: fiktiossa nämä ovat
oikeita sovelluksia oikeassa laitteessa, joten iOS:n kello ja akku kuuluvat
kuvaan. Suunnittele ylin turva-alue tummaksi, jotta valkoinen kello erottuu.

### Asento — molemmat pystyyn, lukittu

Vaaka-asentoja ei tehdä lainkaan. Tabletti on Alvinan sylissä, puhelin
autotelineessä.

### Molemmat laitteet ovat autossa

Tämä muuttaa suunnittelun reunaehtoja enemmän kuin miltä kuulostaa. Ohi
vilistävät katuvalot ja tuulilasin heijastukset kulkevat ruudun yli kesken oton,
ja hohtokerroksen voimakkuus vaihtelee otosta toiseen. Käytännössä:

- **Kontrastin pitää kestää vaihtelua.** Kaksi lähekkäistä tummaa sävyä eroaa
  toisistaan pöydällä mutta ei liikkuvassa autossa
- **Vältä hentoja yksityiskohtia reunoilla.** Heijastus osuu useimmiten ruudun
  ylä- tai alalaitaan
- **Yksi asia kerrallaan.** Ruutua ei ehditä lukea kuin yhden ajatuksen verran

---

## 3. Väri

### Peruspohja — sama kuin tuotannon aiemmassa propissa

| Käyttö | Hex |
|---|---|
| Taustan pohja | `#0E1116` |
| Paneeli | `#151A21` |
| Paneeli, korostettu | `#1A2029` |
| Paneeli, kohotettu | `#202834` |
| Viivat | `#232B36` / `#2E3846` |
| Teksti | `#C8D0D8` |
| Himmeä teksti | `#6C7885` / `#4E5866` |
| Virhe / erääntynyt | `#C4402F` |
| Varoitus | `#C79A3A` |
| OK / nousu | `#5E9E6B` |

### Sovellusten tunnusvärit

| Sovellus | Hex | |
|---|---|---|
| CANDLR | `#C9A227` | kulta |
| GRUMBL | `#C25A7A` | roosa |
| TABB | `#A8746A` | terrakotta |
| HOPP | `#3E9E92` | verdigris |

**CANDLR:n tunnusväri ei saa olla punainen eikä vihreä.** Ne kaksi kertovat
kohtauksessa markkinan suunnan — ne ovat sisältöä, eivät brändiä. Jos sovelluksen
oma ilme on punainen, romahduksen punainen ei erotu mistään. Siksi kulta.

**GRUMBL ei ole oranssi ja TABB ei ole vaaleanpunainen.** Molemmat genret
tunnistetaan juuri niistä väreistä, ja se on ilmeen jäljittelyä. Ks. kohta 8.

### Kaikki neljä ovat tummia

Ei valinnainen. Käsikirjoitus rakentuu sille, että ruudun hohto värjää Alvinan
kasvot. Vaalea käyttöliittymä pesisi kasvot valkoisiksi, ja jos kaksi sovellusta
kolmesta on vaaleita, valo hyppii leikkauksessa.

Se on myös uskottava: kukaan ei katso osamaksusaldojaan vaaleassa teemassa
kolmelta yöllä.

### Säännöt, jotka eivät ole makuasioita

- **Ei puhdasta valkoista.** Kirkkain sallittu `#C8D0D8`. `#FFFFFF` palaa puhki
- **Ei puhdasta mustaa.** Tummin `#0E1116`. Täysmusta ei valaise kasvoja
- **Ohuin viiva 2 pt.** 1 pt katoaa tai kihelmöi
- **Pienin teksti 13 pt**
- **Vältä laajoja hienovaraisia liukuvärejä** — 8-bit ja videopakkaus tuottavat raitoja
- **Vältä täyskylläisiä värejä.** Ne clippaavat värikanavassa ennen kirkkausrajaa.
  Erityisesti punainen: `#FF0000` leviää ja menettää muotonsa. Verenpunainen
  käyrä tehdään arvolla `#C4402F` ja hohtokerros hoitaa kylläisyyden

### Luettavuusportaat

| Missä nähdään | Pienin koko |
|---|---|
| Lähikuva ruudusta (insert) | 13 pt |
| Puolikuva, ruutu näkyy kokonaan | 22 pt |
| Laaja, ruutu pieni kuvassa | 40 pt, ja vain yksi asia kerrallaan |

Kolme lukua on kuvattu lähellä ja ne pitää lukea kerralla:
**18 tuntia** (puhelin), **3,31 €** (tabletti) ja **ERÄÄNTYNYT**-merkinnät.
Nämä kolme suunnitellaan ensin, muu asettuu niiden ympärille.

### Typografia

IBM Plex Sans käyttöliittymälle, **IBM Plex Mono kaikille numeroille** — kurssit,
saldot, kellonajat, matkat, euromäärät. Tabulaariset numerot, jotta ne eivät
hyppi päivittyessään.

Sama kuin tuotannon aiemmassa propissa, ja lisenssi on kunnossa (SIL OFL). Jos
vaihdat kirjasimen, **mono numeroille on pakollinen** ja lisenssi on
tarkistettava — jakso menee levitykseen.

---

## 4. Kuvatiedostot

Kaikki `assets/`-kansioon. SVG ensisijainen, PNG siellä missä mainittu.
sRGB, 8-bit.

| Tiedosto | Muoto / koko | Sisältö | Prio |
|---|---|---|---|
| `logo_candlr.svg` | SVG | Sanamerkki ja pikkumerkki | 2 |
| `logo_grumbl.svg` | SVG | " | 2 |
| `logo_tabb.svg` | SVG | " | 2 |
| `logo_hopp.svg` | SVG | " | 2 |
| `rpr_tunnus.svg` | SVG, neliö | Reapercoinin kolikkotunnus. **CANDLR:n ainoa kuvatiedosto** — kaikki muu on ladottua. Ilman sitä paikalla on kirjain R | **2** |
| `kauppias_novex.svg` | SVG | Puhelinvalmistaja, TABB-rivillä | 3 |
| `kauppias_nibbl.svg` | SVG | Ruokalähetti, TABB-riveillä (useita tilauksia) | 3 |
| `kauppias_nordkap.svg` | SVG | Vaatemerkki, TABB-rivillä | 3 |
| `avatar_01.png` … `avatar_06.png` | PNG 96 × 96 | GRUMBL-käyttäjien kuvakkeet. Abstrakteja, ei kasvoja | 3 |

**Kotivalikon kuvakkeita ja taustakuvia ei tarvita.** Kotivalikko ei näy
missään otossa — vain sovellukset. Propissa on yksinkertaiset
paikkamerkkikuvakkeet, jotta operaattori löytää oikean propin laitteen
ruudulta, eikä niitä katsota kameralla.

Ilman tiedostoa jokainen kohta näkyy värillisenä paikkamerkkinä, joka on oikean
kokoinen ja oikeassa paikassa. **Proppi toimii täysin ilman yhtään assettia**,
joten mikään näistä ei ole pullonkaula muulle työlle.

---

## 5. Kartta — ei enää sinun työtäsi

**Muutos aiempaan briefiin.** Kartta oli tässä aiemmin merkitty suurimmaksi
yksittäiseksi urakaksi. Se on nyt tehty koodilla, eikä `hopp_kartta.svg`-tiedostoa
tarvita. Älä piirrä sitä.

Syy on käytännöllinen: kartan sijaintia pitää pystyä vaihtamaan vielä kuvausten
lähellä, ja piirretty kartta olisi lukinnut yhden maantieteen. Nyt tiestö,
korttelit, metsät, vesistö ja reitti syntyvät siemenluvusta — uusi luku antaa
uuden kaupungin samalla tyylillä, ja sama luku antaa aina saman kartan, joten
jatkuvuus säilyy ottojen välillä.

### Mitä sinä ratkaiset kartasta

Värit. Ne ovat `teema.json`:in `kartta`-lohkossa ja menevät suoraan
piirtoon:

| Avain | Mikä |
|---|---|
| `maa` | pohja, kaupungin ulkopuoli |
| `kortteli` | rakennuskorttelit |
| `metsa` · `vesi` | maastoalueet |
| `tie-kuori` | tumma reunus tien alla |
| `tie-paa` · `tie` · `tie-pieni` | tiehierarkia: valtaväylä, katu, metsätie |
| `kadunnimi` | tekstin väri |
| `tolppa` | taksitolpan merkki — Alvina on vuoron alussa parkissa tolpalla |
| `reitti` · `reitti-kuori` · `reitti-ajettu` | punainen reittiviiva, ajettu osuus himmeänä |
| `auto` · `auto-hehku` | ajoneuvon merkki |

Tiet piirretään kahdessa kerroksessa — tumma kuori ensin, vaaleampi täyttö
päälle. Se on se yksi asia, joka saa tiestön lukemaan karttana eikä
viivapiirroksena. Jos säädät `tie-kuori`-arvoa liian lähelle `tie`-arvoa,
kartta latistuu.

Nämä eivät ole CSS-muuttujia vaan menevät canvakselle, joten `rgba()` käy
mutta `var()` ei.

### Miten katsot muutoksesi

Avaa puhelinproppi ja mene cueen 3. Operaattorin karttapaneeli näkyy oikeassa
laidassa aina kun ohjauspalkki on esillä:

```
W A S D  siirrä karttaa      C  keskitä autoon
Q E      zoom                K  kartan kääntyminen päälle/pois
N        uusi kaupunki       M  tallenna näkymä
G        laitteen paikannin
```

`M` tallentaa nykyisen näkymän — siemenen, zoomin ja kohdan reitillä — ja
tulostaa sen konsoliin muodossa, jonka voi liittää suoraan `sisalto.json`:iin
kohtaan `hopp.kartta`.

## 6. Mitä kussakin sovelluksessa on

Nämä ovat rakenteita, joita koodi piirtää. Sinä ratkaiset värin, tilan,
typografian ja rytmin — et tee niistä kuvatiedostoja.

> **Rakenteet on tarkistettu oikeista sovelluksista** — ks.
> **[REFERENSSIT.md](REFERENSSIT.md)**. Sieltä löytyy myös se, miksi
> pystyasennossa on välilehtipalkki eikä sivupalkkia, ja mitä Liquid Glass
> tarkoittaa propin kannalta.

### Kaikissa kolmessa: kelluva välilehtipalkki alalaidassa

Ei sivupalkkia. Apple ohjeistaa harkitsemaan pystyasennossa ensin
välilehtipalkkia, koska sivupalkki vie vaakatilaa sisällöltä. Navigointi
kelluu sisällön päällä ja sisältö vierii sen alta.

### CANDLR — kryptopörssi

Reapercoin (RPR). Iso kaavio, kurssilukema, prosenttimuutos, ostopainikkeet,
tilin kate, salkkulista.

Kolme rakenteellista asiaa, jotka tulevat suoraan oikeasta pörssistä:

- **Aikavälipillerit** `1H 1D 1W 1M 1Y ALL` kurssin oikealla puolella, valittu
  täytettynä. Nämä ovat genren tunnistettavin merkki — tee ne isoina
- **Hinta-asteikko kaavion oikeassa laidassa**, aika alalaidassa. Vasemmalle
  sijoitettu asteikko lukee heti vääränä
- **Muutos kolmena osana**: nuoli, euromäärä ja prosentti suluissa

- **Romahduskaavio.** Verenpunainen sahalaita, joka **lävistää asteikon
  diagonaalisesti** ylhäältä alas — käsikirjoituksen sanamuoto, ja se on
  sommittelullinen vaatimus, ei tekninen. Ratkaise ruudukko ja asteikko niin,
  että diagonaali lukee heti
- **Vilkkuvat miinusmerkit ja tappioluvut.** Määrittele niiden koko, väri ja
  paikka. Määrää rajaa: koko ruudun välähdyksiä saa olla enintään 3 sekunnissa
  ja punaista välkkyä vain rajatulla pinta-alalla (lähetysstandardi)
- **Rakettikaavio.** Sama sommittelu vihreänä ja ylösalaisin. Päällä banneri:
  `Your portfolio is rocketing! Buy in before it's too late!` Se on
  huijausmainen ilmoitus — suunnittele se sen näköiseksi
- **Kate 3,31 €.** Yksi luku, kuvattu läheltä. Suurin yksittäinen typografinen
  ratkaisu koko propissa

### GRUMBL — keskustelupalsta

Aihealueita, postauslista, äänestysnuolet, kommenttimäärät. Päällä
kirjoituskenttä ja **sovelluksen oma näppäimistö**.

**GRUMBL on selainsivu, ei sovellus.** Asettelu on kolmipalstainen
työpöytäasettelu: vasen navigaatio (158 pt), keskellä sisältö, oikealla
yhteisön tiedot ja numeroidut säännöt (214 pt). Näin siksi, että iPadin
Safari pyytää työpöytäsivut oletuksena — juuri tämän Alvina näkisi.

Palstat ovat kapeita, joten **chrome on pientä (9,5–12,5 pt) ja vain
kirjoitettava otsikko on isoa (25 pt)**. Se on tarkoituksellista: sivun reunat
ovat tekstuuria, otsikko on se, mikä kameralla luetaan.

Näppäimistö on piirretty käyttöliittymä, ei iOS:n oma — muuten automaattikorjaus
ja ennakoiva tekstipalkki pilaavat oton. Sen pitää näyttää oikealta lähikuvassa:
**iPadin näppäimistö on eri asia kuin puhelimen** — leveämpi, enemmän näppäimiä,
rivit eri kohdassa.

Otsikko, jonka Alvina kirjoittaa:
`My crypto portfolio is tanking!! WTF DO I DO???`

### TABB — osta nyt, maksa myöhemmin

Ostosrivilista. Jokaisella rivillä kauppias, tuote, summa, eräpäivä ja tila.
**Valtaosa merkitty ERÄÄNTYNEEKSI.** Ylhäällä kokonaissumma ja myöhästymismaksut.

Rivi ei ole lasku vaan **maksusuunnitelma**: siinä näkyy erälaskuri (`1/4`,
`3/4`) ja yhden erän summa, ei vain kokonaissummaa. Se yksityiskohta erottaa
osamaksusovelluksen laskusovelluksesta.

Erääntymisilme on vapaasti keksittävissä: alan sovellukset eivät näytä
maksunäkymiään ulospäin, joten tavaramerkkiriskiä ei tässä juuri ole.

Rivit tulevat `sisalto.json`-tiedostosta, joten määrä ja sisältö voivat muuttua
vielä myöhään. Suunnittele rivi, älä listaa.

Erääntymismerkintä on se, mikä kohtauksesta luetaan — se on tärkeämpi kuin summat.

### HOPP Partner — kuljettajanäkymä

Neljä tilaa:

1. **Vuoroloki** — `18 tuntia`, ansiot, hyväksymisprosentti, taso tai kerroin
2. **Kyytipyyntö** — asiakkaan etäisyys, arvioitu tuotto, **laskeva ajastin
   renkaana**, HYVÄKSY ja HYLKÄÄ
3. **Navigaattori** — kartta, reitti, seuraava käännös, **START RIDE**
4. **Varoitus** — `KÄÄNNY YMPÄRI` kartan päällä

Suunnittele ajastinrengas huolella. Se sykkii ja se on kohtauksen paine:
sovellus laskee sekunteja siitä, ehtiikö ihminen päättää.

Painikkeet ovat oikeasti painettavia — Alvina koskee niitä. Kosketusalue
vähintään **44 × 44 pt**, ja painetun tilan pitää näkyä kameralle.

---

## 7. Räpsy ja hohto — nämä ovat koodissa

Älä suunnittele näitä kuviksi. Ne ovat kerroksia kaiken päällä ja ne on jo
ratkaistu tuotannon aiemmassa propissa.

| | |
|---|---|
| **Räpsy** | Puhelimen häiriö (`Ruutu räpsyy`). Neljä tyyppiä: repeytyminen, blokkiintuminen, kuva väärinpäin, sahalaita. Ne pilkkovat ja siirtävät oikeaa ruutusisältöä, joten ne toimivat minkä tahansa ulkoasun päällä |
| **Hohto** | Värikerros, jonka voimakkuutta operaattori säätää. Punainen tai vihreä. Tämä tuottaa valon Alvinan kasvoille |

Sinulle tämä tarkoittaa yhtä asiaa: **jätä hieman ilmaa.** Hohto nostaa
kokonaiskirkkautta ja vetää sävyt kohti punaista tai vihreää. Suunnittele
perustila hieman himmeämmäksi kuin lopputuloksen pitää olla.

---

## 8. Tavaramerkit

Nimet ovat keksittyjä juuri siksi, ettei oikeita palveluita tarvitse klaarata.
Tuotanto ajaa niille tavaramerkkihaun, ja **jokin nimi voi vielä vaihtua** —
myös kuvausten lähellä.

Siksi nimet eivät ole missään koodissa eivätkä kuvatiedostoissa. Ne ovat
`sisalto.json`:in `nimet`-lohkossa, yksi rivi kutakin:

```json
"candlr": { "nimi": "CANDLR", "tunnusvari": "#C9A227" },
```

Rivin muuttaminen vaihtaa nimen **kaikkialle kerralla** — otsikoihin,
sanamerkkeihin, ilmoituksiin ja TABB:n ostosriveille. Sinulle tämä tarkoittaa
kahta asiaa:

- **Älä lado nimeä osaksi mitään muuta grafiikkaa.** Ei taustaan, ei kuvakkeen
  sisään, ei kaavion otsikkoon. Nimi tulee aina omana elementtinään
- **Sanamerkki on valinnainen.** Jos toimitat `assets/logo_candlr.svg`, sitä
  käytetään; muuten nimi ladotaan tekstinä tunnusvärillä. Molemmat lukevat saman
  rivin, joten nimenvaihdon jälkeen vain SVG pitää päivittää — muu seuraa itse.
  Tee sanamerkit vasta kun nimet on klaarattu

**Älä jäljittele tunnistettavasti.** Genren saa tunnistaa sekunnissa, tuotetta ei.

- Ei keskustelupalstan oranssia eikä pyöreää maskottia
- Ei osamaksupalvelun vaaleanpunaista
- Ei kyytipalvelun mustaa neliötä eikä tunnettua kirjainmerkkiä
- Ei kryptopörssien tunnistettavaa sinistä ympyrää
- Ei oikeita karttatyylejä eikä karttadataa

Lisäksi kaikki ruudulla näkyvä sisältö on fiktiota ja se tarkistetaan:
käyttäjänimet, avatarit, puhelinnumerot, osoitteet, kadunnimet, IBAN- ja
korttinumerot, QR-koodit. **QR-koodi ei saa johtaa mihinkään oikeaan
osoitteeseen** — jos sellainen on kuvassa, tee siitä toimimaton.

---

## 9. Toimitus

- **Kansio:** `assets/`. Tiedostonimet täsmälleen kuten kohdassa 4 — pienet
  kirjaimet, ei välilyöntejä, ei ääkkösiä
- **SVG:t:** `viewBox` mukana, ei kiinteitä mittoja, tekstit poluiksi muutettuna
  tai kirjasin mainittuna. Jos haluat että koodi voi värittää muodon uudelleen,
  käytä siinä `fill="currentColor"`
- **Värit ja tekstit:** suoraan `teema.json` ja `sisalto.json`. Älä toimita niitä
  erillisenä dokumenttina — muutos menee silloin läpi tulkinnan
- **Versiointi:** repossa. Jokainen muutos on oma commit, joten mikä tahansa
  versio saadaan takaisin kuvauspäivänä

Ensimmäinen tarkistus kannattaa tehdä **oikealla laitteella** heti kun ensimmäiset
värit ovat paikallaan, ei vasta lopuksi. Tabletin ruutu on kirkkaampi ja
kylläisempi kuin työpöytämonitori, ja ero näkyy heti.

---

## Liite: prioriteettijärjestys

Jos aikaa on vähän, tässä järjestyksessä.

| # | | Miksi |
|:--:|---|---|
| 1 | Peruspaletti ja typografia | Kaikki neljä sovellusta ratkeavat kerralla |
| 2 | CANDLR:n kaavio ja **3,31 €** | Eniten ruutuaikaa, kuvattu lähimpää |
| 3 | HOPP:n karttapaletti ja ajastinrengas | Kartta on koodissa — sinä ratkaiset värit |
| 4 | TABB:n rivi ja erääntymismerkintä | Yksi elementti, joka toistuu |
| 5 | GRUMBL ja näppäimistö | Näkyy lyhyimmän ajan |
| 6 | Sanamerkit ja avatarit | Toimivat paikkamerkkeinä loppuun asti — ja sanamerkit vasta kun nimet on klaarattu |

Puhelimen sisältö (kohta 3) odottaa laitemallia. Tabletin voi tehdä valmiiksi
sitä odottamatta.
