# Käyttöönotto — iPad ja iPhone

Lyhyt vastaus kolmeen kysymykseen:

| | |
|---|---|
| **Miten propit saa laitteisiin?** | Avataan **HTTPS-osoitteesta** kerran ja lisätään Koti-valikkoon. Sen jälkeen ne ovat laitteessa pysyvästi |
| **Tarvitaanko läppäriä kuvauspaikalla?** | **Ei.** Läppäri on vain kehitys- ja esikatselukone kotona. Kuvauspaikalla laitteet ovat lentotilassa eivätkä tarvitse mitään |
| **Ohjataanko läppäriltä?** | **Ei.** Ohjaus tapahtuu laitteessa itsessään Bluetooth-klikkerillä. Ks. kohta 7 — läppäriohjaus on mahdollinen, mutta sitä ei ole rakennettu |

**Tärkein yksittäinen asia:** offline-tuki vaatii suojatun yhteyden. Läppärin
`http://192.168.x.x` **ei** kelpaa — selain ei anna siitä service workeria
lainkaan, jolloin proppi näyttää toimivan mutta kuolee lentotilassa. Siksi
asennus tehdään GitHub Pagesin HTTPS-osoitteesta.

Proppi kertoo tilansa itse: ohjauspalkissa lukee **`offline ✓`** kun kaikki on
laitteessa, ja **`EI OFFLINE — avattu ilman HTTPS:ää`** jos ei ole.

---

## 1. Osoite

**Proppi on julkaistu. Tämä on osoite, joka avataan jokaisella laitteella:**

```
https://antsub.github.io/grind-jakso3/
```

Repo: <https://github.com/antsub/grind-jakso3> — julkinen, koska GitHub Pages ei
ole ilmaisella tilillä käytettävissä yksityisille repoille. `robots.txt` ja
`noindex` pitävät sivun poissa hakukoneista, ja sovellukset ovat keksittyjä.
Sama ratkaisu kuin tuotannon aiemmassa propissa.

### Päivitykset

```bash
cd ~/Documents/grind-jakso3
git add -A && git commit -m "…" && git push
```

Pages rakentaa uuden version noin minuutissa. **Nosta `sw.js`:n `VERSIO`
jokaisella muutoksella** — muuten laitteissa pyörii vanha välimuisti. Laitteet
saavat päivityksen, kun proppi avataan kerran verkkoyhteydellä; ohjauspalkin
versionumerosta näkee, mikä build on koneessa.

---

## 2. Asenna laitteelle (kerran per laite)

Tee tämä **kotona tai toimistossa, missä on wifi.** Ei kuvauspaikalla.

1. Avaa **`antsub.github.io/grind-jakso3`** laitteen **Safarissa** (ei
   Chromessa — Koti-valikkoon lisääminen ja offline-tuki toimivat iOS:ssä
   vain Safarissa)
2. Valitse proppi:
   - iPad → **Tabletti**
   - iPhone → **Puhelin**
3. Odota pari sekuntia, kunnes ohjauspalkissa lukee **`offline ✓`**.
   Jos lukee `offline asentuu`, päivitä sivu kerran
4. Jaa-painike → **Lisää Koti-valikkoon** → Lisää
5. Sulje Safari kokonaan ja avaa proppi **kotivalikon kuvakkeesta**

Kohta 5 ei ole muotoseikka: vain kotivalikosta avattuna proppi menee koko
ruutuun ilman selainpalkkia, ja vasta silloin turva-alueet ovat oikein.

Kuvakkeet ovat paikkamerkkejä, jotta oikean propin löytää: **kulta = tabletti,
turkoosi = puhelin.**

---

## 3. Varmista offline — älä ohita tätä

Tämä on ainoa tapa tietää, että proppi toimii kuvauspäivänä.

1. **Lentotila päälle**
2. **Wifi ja Bluetooth pois** (lentotila katkaisee ne, älä laita takaisin vielä)
3. Sulje proppi kokonaan (pyyhkäise pois sovellusvalitsimesta)
4. Avaa se uudelleen kotivalikon kuvakkeesta

Jos proppi aukeaa normaalisti ja ohjauspalkissa lukee `offline ✓`, kaikki on
laitteessa. Jos tulee virhesivu, palaa kohtaan 2.

---

## 4. Kytke klikkeri

Nyt vasta, ja tässä järjestyksessä:

1. **Lentotila päälle** (jos ei jo ole)
2. **Bluetooth takaisin päälle** — se saa olla päällä lentotilassa
3. Pariuta klikkeri

**Yksi klikkeri per laite.** Bluetooth-klikkeri pariutuu vain yhteen laitteeseen
kerrallaan, joten iPadille ja iPhonelle tarvitaan omansa.

Osta klikkeri, joka toimii **näppäimistötilassa** (HID) ja lähettää nuolia tai
Page Up/Down. Moni halpa esitysklikkeri lähettää äänenvoimakkuusnäppäimiä, jotka
eivät kanna selaimeen lainkaan. Sivunkääntöpoljin toimii myös.

Testaa: paina klikkeriä ja katso, että ohjauspalkin cue-numero vaihtuu.

---

## 5. Laiteasetukset ennen ottoa

| | |
|---|---|
| Lentotila | Päälle |
| Bluetooth | Päälle lentotilan jälkeen, klikkeri kiinni |
| Wifi | Pois — sitä ei tarvita eikä sen katoaminen saa yllättää |
| Älä häiritse | Päälle |
| Kirkkaus | **100 %, automaattikirkkaus pois** |
| True Tone / Night Shift | Pois |
| Automaattilukitus | Ei koskaan |
| Kiertolukko | Päälle, pystyasentoon |
| Kellonaika | Käsin: Yleiset → Päivä ja aika → automaattinen pois |
| Akku | Ladattu — prosentti näkyy kuvassa |
| Ohjattu käyttö | Päälle, kun proppi on auki |
| ProMotion (iPad Pro / iPhone Pro) | Saavutettavuus → Liike → **Rajoita kuvanopeus** |

Kirkkautta säädetään ottojen välillä **propista** (`[` ja `]`), ei laitteen
kirkkaussäätimestä. Laitteen himmennys on pulssitusta, joka lyö kameran
sulkijaa vastaan.

Muista lopuksi **`H` — ohjauspalkki piiloon.**

---

## 6. Läppäri paikallisverkossa

Tämä on **esikatselua ja mittauksia varten**, ei kuvauspäivää.

Käynnistä palvelin:

```bash
cd ~/Documents/grind-jakso3 && python3 -m http.server 8731
```

Selvitä läppärin osoite samassa wifissä:

```bash
ipconfig getifaddr en0
```

Avaa laitteella `http://<osoite>:8731/` — esimerkiksi `http://192.168.1.42:8731/`.
Laitteen ja läppärin pitää olla **samassa wifi-verkossa**.

### Mikä toimii näin

- `laitetiedot.html` — **tämän voi tehdä tänään**, ja se on se mitä graafikko
  tarvitsee: iPad Airin artboard-mitat ja turva-alueet suoraan laitteesta
- `?esikatselu` — ulkoasun tarkistus oikean kokoisena
- Ajolistan läpiajo ja hohdon säätö

### Mikä ei toimi

- **Offline-tuki ei asennu.** Ohjauspalkissa lukee `EI OFFLINE — avattu ilman
  HTTPS:ää`. Proppi toimii vain niin kauan kuin läppärin palvelin pyörii ja
  laite on samassa verkossa. Lentotilassa se ei toimi lainkaan

Jos GitHub Pages ei ole vaihtoehto, HTTPS:n saa myös tunnelilla (esim.
`cloudflared tunnel --url http://localhost:8731`), joka antaa väliaikaisen
https-osoitteen. Se vaatii nettiyhteyden asennushetkellä, mutta asennuksen
jälkeen proppi on laitteessa eikä tunnelia enää tarvita.

---

## 7. Miksi ohjaus ei ole läppärillä

Nykyisessä rakenteessa proppi on laitteessa ja ohjaus laitteessa. Se on tietoinen
valinta: **kuvauspaikalla ei tarvita mitään verkkoa.** Ei wifiä, ei tukiasemaa,
ei läppäriä auton takapenkillä. Vähemmän asioita, jotka voivat pettää yöllä
liikkuvassa autossa.

Läppäriohjaus olisi silti mahdollinen, ja siinä on yksi todellinen etu: **yksi
operaattori näkisi ja ajaisi molempia laitteita samalta ruudulta.** Molemmat ovat
autossa samassa kohtauksessa, joten se ei ole pieni asia.

| | Klikkeri (nyt) | Läppäriohjain |
|---|---|---|
| Verkkoriippuvuus | ei mitään | wifi tai tukiasema myös kuvauspaikalla |
| Laitteita ohjataan | yksi klikkeri per laite | molemmat samalta ruudulta |
| Operaattori näkee cue-tilan | laitteen ruudulta | omalta ruudultaan, molemmat kerralla |
| Lisähankinnat | 2 klikkeriä | matkareititin tai vastaava |
| Rakennettu | kyllä | ei — noin päivä työtä |

**Suositus:** aja vaiheen 2 kameratesti klikkerillä. Se on rakennettu, se on
testattavissa heti, eikä se voi kaatua verkkoon. Jos testissä käy ilmi, että
kahden laitteen tahdistaminen on hankalaa, läppäriohjain lisätään päälle —
se ei korvaa klikkeriä vaan tulee sen rinnalle, joten mitään ei mene hukkaan.

---

## Pikaviite kuvauspäivälle

```
Ennen ottoa:   lentotila · BT päälle · klikkeri kiinni · kirkkaus 100 %
               automaattilukitus ei koskaan · ohjattu käyttö
               H = ohjauspalkki piiloon
Ohjauspalkki:  offline ✓  ← tämän pitää lukea siinä

VÄLILYÖNTI / →   seuraava cue        [ ]   kirkkaus
←                edellinen           − +   hohdon voima
0–9              hyppää cueen        P / V punainen / vihreä
R                alkuun              O     hohto pois
B                musta ruutu         U     puhdas hohto
H                ohjauspalkki        T     kameratestikortti
G X Y Z          glitch (⇧ jatkuva)
```

Jos klikkeri pettää: ruudun **oikea yläkulma** = seuraava cue, **vasen yläkulma**
= edellinen. **Oikea alakulma pitkään painettuna** tuo ohjauspalkin takaisin.
