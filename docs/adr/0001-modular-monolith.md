# ADR 0001 — Monolite modulare TypeScript

Stato: accepted

## Contesto

Scene, memoria, relazioni e storyline richiedono aggiornamenti coerenti e il dominio è ancora in scoperta.

## Decisione

Usare un monorepo pnpm con una sola applicazione Next.js e package interni per dominio, contratti, database e AI. I confini sono applicativi, non di rete. Turborepo viene rinviato finché la pipeline non richiede caching o scheduling del grafo: per i cinque package iniziali `pnpm -r` evita una dipendenza non ancora utile.

## Conseguenze

Le transazioni e i test end-to-end restano semplici. Un modulo potrà essere estratto solo quando carico, ownership e protocollo saranno stabili. È vietato importare adapter infrastrutturali nel package di dominio.
