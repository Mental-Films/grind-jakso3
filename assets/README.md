# assets/

Pudota grafiikka tähän kansioon oikealla nimellä — se korvaa paikkamerkin
automaattisesti. Koodiin ei kosketa.

Täysi lista nimineen ja mittoineen: **[../BRIEF_GRAAFIKKO.md](../BRIEF_GRAAFIKKO.md)**
kohta 4.

Tärkeimmät:

| Tiedosto | Muoto | Sisältö |
|---|---|---|
| `hopp_kartta.svg` | SVG | Yökartta. Reitti omana polkuna `id="reitti"` |
| `logo_candlr.svg` ym. | SVG | Sanamerkit. Valinnaisia — ilman niitä nimi ladotaan tekstinä |
| `rpr_tunnus.svg` | SVG | Reapercoinin kolikkotunnus |
| `kauppias_*.svg` | SVG | TABB:n ostosrivien kauppiaat |
| `avatar_01.png` … | PNG 96 × 96 | GRUMBL-käyttäjien kuvakkeet |
| `fontit/*.woff2` | woff2 | IBM Plex Sans ja Mono, ks. alla |

## Kirjasimet

`fontit/`-kansio on tyhjä. Ilman sitä proppi käyttää laitteen omaa kirjasinta,
mikä kelpaa kameratestiin mutta **ei lopulliseen proppiin** — iOS:ssä ei ole
IBM Plexiä eikä web-käyttöön kelpaavaa mono-kirjasinta, joten numerot näyttävät
väärältä.

Tarvittavat tiedostot:

```
fontit/IBMPlexSans-Regular.woff2
fontit/IBMPlexSans-SemiBold.woff2
fontit/IBMPlexMono-Regular.woff2
fontit/IBMPlexMono-SemiBold.woff2
```

IBM Plex on SIL OFL -lisensoitu, joten sen saa upottaa levitykseen menevään
tuotantoon.

## Kuvakkeet

`ikoni_tabletti.png` ja `ikoni_puhelin.png` ovat koodilla tehtyjä
paikkamerkkejä, jotta operaattori löytää oikean propin laitteen kotivalikosta.
**Kotivalikko ei näy missään otossa**, joten näitä ei tarvitse suunnitella.
