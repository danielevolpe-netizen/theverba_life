# LifeLang

Vertical slice di una seconda vita persistente per imparare l'inglese. La prima demo mostra il ciclo:

`conversazione → memoria → conseguenza → nuova scena → apprendimento`

## Cosa è già eseguibile

- onboarding essenziale italiano/inglese;
- Today, World, People, Journey ed English;
- New York con quattro luoghi, tre NPC e una storyline;
- scena testuale a più turni con Arthur;
- output AI validati tramite adapter deterministico;
- fatto/promessa con evidenza, relazione e avanzamento storyline;
- messaggio conseguente di Maya;
- debrief linguistico e mastery recognition/production;
- memoria visibile e correggibile;
- event ledger e misurazione token/latenza/costo;
- persistenza demo versionata in `localStorage`;
- schema PostgreSQL Drizzle, migrazione e seed.

L'adapter deterministico è intenzionale: rende demo e test riproducibili senza chiavi API. Non rappresenta ancora una conversazione generativa aperta. PostgreSQL è predisposto come source of truth production, ma la UI del walking skeleton salva localmente finché gli endpoint di M2 non sostituiscono il demo repository.

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

La UI non legge ancora PostgreSQL: schema, migrazione e seed sono foundation pronta per il repository server-side della milestone Conversation.

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
- `packages/ai`: porta AI e adapter deterministico;
- `packages/db`: schema PostgreSQL, migrazioni e seed;
- `docs`: piano tecnico, ADR, OpenAPI e prompt template.

## Limiti attuali

- identità demo, non autenticazione production;
- repository browser-local, non ancora endpoint PostgreSQL;
- nessun provider LLM reale o streaming SSE;
- nessuna voce STT/TTS;
- retrieval semantico, worker e outbox non ancora attivi;
- una sola scena golden e un solo learning item;
- nessun backoffice.

Il backlog e le decisioni aperte sono in [`docs/TECHNICAL_PLAN.md`](docs/TECHNICAL_PLAN.md).

# theverba_life
