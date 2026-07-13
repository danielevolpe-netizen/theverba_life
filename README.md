# LifeLang

Vertical slice di una seconda vita persistente per imparare l'inglese. La prima demo mostra il ciclo:

`conversazione → memoria → conseguenza → nuova scena → apprendimento`

## Cosa è già eseguibile

- onboarding essenziale italiano/inglese;
- Today, World, People, Journey ed English;
- menu Settings con registro gateway, LLM selezionato e stato della configurazione;
- New York con quattro luoghi, tre NPC e una storyline;
- scena testuale a più turni con Arthur;
- output AI validati tramite adapter deterministico o Vercel AI Gateway;
- fatto/promessa con evidenza, relazione e avanzamento storyline;
- messaggio conseguente di Maya;
- debrief linguistico e mastery recognition/production;
- memoria visibile e correggibile;
- event ledger e misurazione token/latenza/costo;
- persistenza canonica su Neon PostgreSQL con fallback locale versionato;
- schema PostgreSQL Drizzle, migrazione e seed.

Senza una chiave gateway l'app usa intenzionalmente l'adapter deterministico, così demo e test restano riproducibili. Con Vercel AI Gateway configurato, i turni NPC passano invece dall'LLM selezionato e il relativo JSON viene comunque validato prima di modificare il dominio. Neon è la source of truth per profilo demo, scena, messaggi, memoria, knowledge boundary, relazione, storyline, mastery, eventi e usage. `localStorage` viene usato soltanto se le API non sono disponibili ed è indicato nella UI.

## Avvio rapido

Requisiti: Node.js 22+, pnpm 10+.

```bash
pnpm install
pnpm dev
```

Aprire l'indirizzo mostrato da Next.js. Il percorso consigliato è:

1. completare l'onboarding;
2. avviare **The house rules**;
3. usare il suggerimento due volte;
4. concludere la scena;
5. aprire il debrief;
6. correggere la memoria creata.

Per azzerare il flusso usare **Reset demo**.

## Database locale

```bash
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate
pnpm --filter @lifelang/db db:seed
```

In ambienti Neon usare `DATABASE_URL` pooled per l'applicazione e
`DATABASE_DIRECT_URL` non pooled per migrazioni e operazioni amministrative.

La connessione runtime può essere verificata con `GET /api/health/database`. Lo stato aggregato del vertical slice è disponibile tramite `GET /api/demo-state`; tutte le mutation richiedono `Idempotency-Key`.

## Vercel AI Gateway

Le variabili necessarie sono già documentate in `.env.example`. Nel file `.env` locale impostare almeno:

```dotenv
AI_PROVIDER=vercel-gateway
AI_GATEWAY_API_KEY=<vercel-ai-gateway-key>
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_MODEL=openai/gpt-5.4-mini
AI_GATEWAY_TIMEOUT_MS=30000
```

Il file `.env` nella root del workspace viene caricato dal bootstrap Next dell'app web. Dopo ogni modifica alle credenziali è necessario riavviare il server. Se `AI_GATEWAY_API_KEY` resta vuota, **Settings** mostra il gateway e il modello scelto ma segnala correttamente il fallback deterministico. Nessun valore segreto viene restituito al browser o tracciato da Git.

## Verifica

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Repository

- `apps/web`: applicazione Next.js;
- `packages/domain`: regole pure e vertical slice;
- `packages/contracts`: contratti Zod per AI, comandi ed eventi;
- `packages/ai`: porta AI, adapter deterministico e adapter Vercel AI Gateway;
- `packages/db`: schema PostgreSQL, migrazioni e seed;
- `docs`: piano tecnico, ADR, OpenAPI e prompt template.

## Limiti attuali

- identità demo, non autenticazione production;
- chiamate LLM reali subordinate alla configurazione della chiave gateway; nessuno streaming SSE;
- nessuna voce STT/TTS;
- retrieval semantico, worker e outbox non ancora attivi;
- una sola scena golden e un solo learning item;
- nessun backoffice.

Il backlog e le decisioni aperte sono in [`docs/TECHNICAL_PLAN.md`](docs/TECHNICAL_PLAN.md).
