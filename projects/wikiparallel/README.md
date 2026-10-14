# WikiParallel

WikiParallel är ett verktyg som körs enbart i webbläsaren och som hjälper dig att
låna idéer mellan olika discipliner. Du skriver in en **Challenge** — ett problem
formulerat i vardagligt språk, till exempel "hantera en plötslig anstormning av
användare" — och markerar dess **Home Field**, det av elva toppnivåfält i
Wikipedias Vital Articles-lista som problemet redan tillhör. WikiParallel
beräknar en embedding av din Challenge i webbläsaren och jämför den mot
**Corpus** (omkring 1 000 sidor från Wikipedias Vital Articles Level 3, där varje
sida har reducerats till sin **Lead Section** och embeddats en gång vid
bygget). Verktyget returnerar **Parallels**: artiklar vars Lead Section ligger
nära din Challenge i embedding-rymden men som befinner sig i ett _annat_ Field,
var och en visad med sin **Closeness** (0–100) och en länk till källartikeln.
Att utesluta Home Field är hur verktyget hoppar över de självklara svaren och
lyfter fram samma underliggande problem sett genom en annan disciplin.

Det finns ingen backend: `corpus.json` hämtas vid sidladdning och
embedding-modellen `gte-small` körs på klientsidan via transformers.js, så texten
i din Challenge lämnar aldrig datorn (se
[`docs/adr/0001-browser-only-no-backend.md`](docs/adr/0001-browser-only-no-backend.md)).

## Frågor

- Vilken ny AI-teknik/bibliotek identifierade ni och hur tillämpade ni det?
- Motivera varför ni valde den AI-tekniken/det biblioteket.
- Varför behövdes AI-komponenten? Skulle ni kunna löst det på ett annat sätt?

## Förutsättningar

- Node.js 20 eller senare (bygget och testköraren använder inbyggda
  `node --test`).
- Nätverksåtkomst vid det första bygget (för att hämta artikellistan och Lead
  Sections från Wikipedia) och vid den första sökningen i webbläsaren (för att
  ladda ner modellen).

## Installation

```sh
npm install
```

## Bygg din Corpus

```sh
node build/build.mjs        # eller: npm run build
```

Detta kör två steg bakom en gemensam ingångspunkt:

1. **List-steget** — hämtar Wikipedias Vital Articles Level 3-lista och härleder
   listan med `{ field, title, url }`. Namnen på alla Field och deras ordning
   läses från den aktuella listan här.
2. **Corpus-steget** — hämtar varje artikels Lead Section och rubriker och
   beräknar en embedding av Lead Section med `gte-small`.

Resultatet skrivs till `corpus.json` i projektroten (omkring 10 MB, ~1 000
poster). Svaren från Wikipedia cachas under `build/cache/`, så en andra körning
behöver inget nätverk och producerar en likvärdig fil.

`corpus.json` **genereras och versionshanteras inte** — den står i `.gitignore`.
En färsk klon har ingen Corpus förrän du kör bygget, och appen visar ett
meddelande om att köra bygget tills filen finns.

Relaterade byggkommandon:

- `npm run build:list` — kör enbart list-steget och skriver ut artikellistan.
- `node build/eval.mjs` — rangordnar åtta handskrivna Challenges mot den byggda
  Corpus och skriver ut deras Parallels; se [`docs/evaluation.md`](docs/evaluation.md).

## Kör appen

WikiParallel är en statisk webbplats — servera projektroten med valfri statisk
filserver:

```sh
npm run serve        # python3 -m http.server 8000
```

Öppna sedan <http://localhost:8000>. Skriv in en Challenge, välj ett Home Field
och välj **Find Parallels**. Den första sökningen laddar ner modellen `gte-small`
(~34 MB) från jsDelivr-CDN:et; webbläsaren cachar den till alla efterföljande
besök.

## Tester och typkontroll

```sh
npm test             # node --test
npm run typecheck    # tsc --noEmit
```

## Licensiering

- **Kod** — MIT. Se [`LICENSE`](LICENSE).
- **Artikeltext från Wikipedia** — de Lead Sections som lagras i `corpus.json`
  och visas i appen som underlag för varje Parallel kommer från Wikipedia och
  används under
  [Creative Commons Erkännande-DelaLika (CC BY-SA)](https://creativecommons.org/licenses/by-sa/4.0/).
  Appens sidfot bär denna upplysning och varje Parallel länkar till sin
  källartikel på Wikipedia för erkännande.
