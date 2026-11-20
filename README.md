# Brickpussel

Det klassiska skjutpusslet för låg- och mellanstadiet. Barnet trycker på brickorna intill den tomma
rutan för att skjuta dem på plats, tills siffrorna eller bilden ligger i rätt ordning. Börjar på
2×2 och går upp till 8×8.

**Spela:** https://brickpussel.skolappar.com · En del av [Skolappar](https://www.skolappar.com) – pedagogiska appar av föräldrar · öppen källkod (MIT)

Började som ett Google AI Studio-projekt och körs nu fristående.

## Vad du kan göra

- **Sju nivåer**, från Uppvärmning (2×2) till Legend (8×8). Nästa nivå låses upp när du klarar
  den du står på.
- **Välj tema**: siffror, färgspektrum eller en av 17 bilder (hund, katt, lejon, tåg, pizza …).
- **Demoläge** på startsidan: ett 3×3-pussel blandas och löser sig självt så att man ser hur
  brickorna rör sig.
- **Poäng** efter nivå, antal drag och tid, med rekord per nivå.
- Blandningen ger alltid ett lösbart pussel.
- Klickljud vid varje drag (Web Audio, inga ljudfiler).
- Nivå och rekord sparas lokalt i webbläsaren.

## Kom igång

```bash
npm install
npm run dev      # utvecklingsserver på port 3000
npm run build    # produktionsbygge till dist/
npm run preview  # förhandsgranska bygget
```

Docker-bygget använder Node 22.

## Docker

```bash
docker build -t brickpussel .
docker run --rm -p 8080:8080 brickpussel
```

Servern ligger bakom nginx med `deploy/nginx.conf`.

## Integritet

- Ingen inloggning, inga kakor, ingen analys.
- Det som sparas är upplåst nivå och rekord, i `localStorage` under `brickpussel_level` och
  `brickpussel_highscores`.
- Bilderna ligger i `public/images/` och typsnittet Fredoka i `public/fonts/` – inget hämtas
  från andra servrar.
- Koden har kvar ett valfritt anrop till Google Gemini för vinstmeddelandet
  (`services/geminiService.ts`). Det används bara om `GEMINI_API_KEY` finns när appen byggs, och
  då hamnar nyckeln i den publicerade koden. Dockerfilen sätter ingen nyckel, så utan den visas
  ett fast grattismeddelande och inga anrop görs.

## Struktur

```
App.tsx                   nivåer, teman, poäng, demoläge, vinstruta
components/Board.tsx      spelplanen
components/Tile.tsx       en bricka (siffra, färg eller bildbit)
services/gameLogic.ts     blandning, lösbarhet, vinstkontroll, poäng
services/geminiService.ts valfritt vinstmeddelande via Gemini
index.html                startskärm och typsnitt
public/images/            bilderna till bildteman
deploy/nginx.conf         nginx-konfiguration
```

## Licens

MIT – se [LICENSE](LICENSE).
