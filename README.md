# GRIND jakso 3 — Pelkääjän paikka

Kuvausproppi Alvinan iPadille ja iPhonelle. Neljä keksittyä sovellusta, kaksi
ajolistaa, yksi cue-moottori.

Ei App Storea, ei Xcodea, ei Apple Developer -tiliä. Sivu lisätään laitteen
Koti-valikkoon ja ajetaan lentotilassa.

**→ <https://antsub.github.io/grind-jakso3/>**

**Vaihe 1 on tehty:** cue-moottori, hohtokerros, kirkkaussäätö, offline-asennus,
laitetiedot ja esikatselu toimivat. Sovellusten ulkoasu on vielä paikkamerkeillä
— ajolistan voi silti ajaa läpi sellaisenaan.

---

## Käyttöönotto laitteella

> Täydet ohjeet julkaisusta, asennuksesta, offline-varmistuksesta ja
> klikkerin kytkennästä: **[KAYTTOONOTTO.md](KAYTTOONOTTO.md)**

1. Avaa proppi **Safarissa** kerran verkkoyhteydellä
2. Jaa → **Lisää Koti-valikkoon**
3. Avaa kotivalikon kuvakkeesta — koko ruutu, ei selainpalkkia
4. **Lentotila päälle**, sitten Bluetooth takaisin päälle ja klikkeri kiinni

Järjestys kohdassa 4 on tärkeä: lentotila katkaisee Bluetoothin, mutta sen saa
takaisin päälle lentotilan ollessa voimassa.

Päivitys: avaa kerran verkossa, uusi versio latautuu itsestään. Ohjauspalkissa
näkyy ajossa oleva versionumero.

| Proppi | Laite | Cuet |
|---|---|---|
| `proppi_tabletti.html` | iPad Air, pysty | 0–6 + kameratesti |
| `proppi_puhelin.html` | iPhone, pysty | 0–5 + kameratesti |

---

## Ohjaus

Kuvauspaikalla ajetaan **Bluetooth-esitysklikkerillä**. Se on HID-näppäimistö,
joten sama näppäinkartta toimii sekä klikkerillä että näppäimistöllä
valmistelussa. Yksi klikkeri per laite.

```
VÄLILYÖNTI / → / PageDown   seuraava cue
← / PageUp                  edellinen cue
0–9                         hyppää cueen
H                           ohjauspalkki piiloon / esiin
R                           alkuun
B  tai  .                   musta ruutu
[  ]                        kirkkaus 50–140 %
−  +                        hohdon voima 0–9
P / V                       punainen / vihreä hohto
O                           hohto pois
U                           puhdas hohto — pelkkä valo, ei käyttöliittymää
T                           kameratestikortti
G X Y Z                     glitch  (⇧ = jatkuva)
```

Glitchit ovat samat neljä kuin tuotannon aiemmassa propissa, samoilla
näppäimillä: **G** repeytyminen, **X** blokkiintuminen, **Y** kuva väärinpäin,
**Z** sahalaita. Painallus = purske 0,36–0,66 s, **⇧ + sama näppäin** jää
päälle, toisen tyypin näppäin vaihtaa tyyppiä lennossa.

Cuessa 1 räpsähtely **käynnistyy itsestään** — kuvauspaikalla operaattorilla on
vain klikkeri eikä näppäimistöä. Tahti on `sisalto.json`:in `hopp.rapsy`.

Glitchin ääni on oletuksena **pois**: puhelin on telineessä keskellä dialogia
eikä propin rahina saa mennä ääniraidalle.

Puhelinpropissa lisäksi karttatyökalu (näkyy kun ohjauspalkki on esillä):

```
W A S D   siirrä karttaa      C  keskitä autoon
Q E       zoom                K  kartan kääntyminen
F         nopeampi            J  jarru
N         uusi kaupunki       M  tallenna näkymä
L         laitteen paikannin (antaa nopeuden, ei sijaintia)
```

Yksikään toiminto ei ole Shift-yhdistelmän takana: klikkeri ei lähetä Shiftiä,
ja operaattori säätää näitä pimeässä yhdellä sormella.

**Piilota ohjauspalkki `H`:lla ennen ottoa.** Palkin ollessa esillä sisältö
työntyy sen verran alas — otossa sommittelu on se, jonka graafikko on
suunnitellut.

### Piilotetut kulmat — varajärjestelmä

Ruudun kulmissa on näkymättömät alueet: oikea ylä = seuraava, vasen ylä =
edellinen, vasen ala = musta ruutu, **oikea ala pitkään painettuna = ohjauspalkki
esiin** ilman näppäimistöä. Ne näkyvät katkoviivalla, kun ohjauspalkki on esillä.

Molemmat laitteet ovat autossa eikä niihin ylety kesken oton, joten kulmat ovat
vara eivätkä työkalu. Klikkeri on ohjaustapa.

### Näyttelijän kosketus

Cueissa, joissa Alvina koskee ruutua itse — postauksen kirjoitus, START RIDE,
HYVÄKSY — **kulma-alueet menevät automaattisesti pois päältä**, jottei sormi
laukaise cueta kesken oton. Ohjauspalkkiin syttyy tällöin oranssi varoitus.
Klikkeri toimii silloinkin.

---

## Jatkuvuus

- Kaikki "satunnainen" tulee kiinteästä siemenluvusta — sama cue piirtää saman
  kuvan tänään ja huomenna
- Cue-suhteellinen kello nollautuu joka kerta: otto 5 näyttää samalta kuin otto 1
- Kellonaika on jäädytetty lukemaan `sisalto.json`:in `luvut.kello`, vain
  sekunnit elävät
- Kohtauksen luvut ovat yhtä sarjaa (331 · 33,1 · 3 310 · 83,1) ja ne ovat
  kaikki yhdessä lohkossa, jotta sarjan näkee kerralla

---

## Työkalut

| Osoite | Mitä |
|---|---|
| `laitetiedot.html` | Avaa **kuvauslaitteella**: artboardin mitat, turva-alueet, virkistystaajuus, kuvatiheys. Kopioi-nappi lopussa |
| `proppi_tabletti.html?esikatselu` | Kaikki cuet vierekkäin laitteen oikeassa koossa |
| `?cue=4` | Avaa suoraan tiettyyn cueen |
| `?tuore=1` | Purkaa offline-välimuistin ja hakee kaiken uudelleen |

`?tuore=1` **poistaa offline-tuen käytöstä** siihen asti, kunnes proppi avataan
kerran ilman sitä. Muista tehdä se ennen kuvauspäivää.

---

## Grafiikan ja tekstien muuttaminen

Mitään ei tarvitse kääntää — tallennus riittää.

| Mitä | Missä |
|---|---|
| Värit, kirjasimet, hohdon sävyt | `teema.json` |
| Kaikki teksti ja numerot | `sisalto.json` |
| **Sovellusten nimet ja tavaramerkit** | `sisalto.json` → `nimet` |
| Kuvat, logot, kartta | `assets/` |

Nimen vaihtaminen `nimet`-lohkosta muuttaa sen kaikkialle kerralla. Molemmissa
JSON-tiedostoissa saa olla `//`-kommentteja.

Täydet ohjeet: **[BRIEF_GRAAFIKKO.md](BRIEF_GRAAFIKKO.md)**

---

## Kehitys

Ei käännösvaihetta eikä riippuvuuksia. Service worker vaatii kuitenkin
palvelimen — `file://`-avaus toimii, mutta ilman offline-tukea ja
JSON-tiedostoja (proppi käyttää silloin sisäänrakennettuja varapuun arvoja).

```bash
python3 -m http.server 8731
```

Sitten `http://localhost:8731/`.

Julkaisu: GitHub Pages on jo päällä. `git push` riittää — Pages rakentaa uuden
version noin minuutissa. `robots.txt` ja `noindex` pitävät sivun poissa
hakukoneista.

### Rakenne

```
proppi_tabletti.html    Ajolista ja cue-määrittelyt — iPad
proppi_puhelin.html     Ajolista ja cue-määrittelyt — iPhone
moottori.js             Cue-moottori, hohto, kirkkaus, kulmat, laitetiedot, esikatselu
kartta.js               Karttamoottori — tiestö, reitti, kamera, paikannin
kaavio.js               Kurssikaavio — romahdus ja raketti
glitch.js · glitch.css  Räpsy — neljä tyyppiä, siirretty aiemmasta propista
runko.css               Rakenteen tyylit
hopp.css                HOPP Partnerin ulkoasu
candlr.css              CANDLR:n ulkoasu
teema.json              Värit ja kirjasimet
sisalto.json            Teksti, numerot ja nimet
assets/                 Grafiikka
laitetiedot.html        Laitteen mitat
sw.js                   Offline-välimuisti
```

Uusi cue lisätään `proppi_*.html`-tiedoston `cuet`-taulukkoon. Sovelluksen
ulkoasu on cuen `piirra(juuri, ctx)`-funktio; `ctx` tarjoaa `S` (sisältö),
`T` (teema), `rnd` (siemennetty satunnaisluku), `nimi()`, `sanamerkki()`,
`kello()` ja numeromuotoilut `e0` `e1` `e2`.

Kun `sw.js`:ää tai mitä tahansa tiedostoa muutetaan, **nosta `sw.js`:n
`VERSIO`** — muuten laitteissa pyörii vanha välimuisti.

---

Sovellukset ovat keksittyjä: CANDLR, GRUMBL, TABB, HOPP. Ei oikeita
tavaramerkkejä. Tuotanto vastaa tavaramerkkihausta ennen nimien lukitsemista.
