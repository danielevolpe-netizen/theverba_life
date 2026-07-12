# ADR 0003 — PostgreSQL come source of truth

Stato: accepted

## Decisione

PostgreSQL conserva stato canonico, scene, messaggi, memorie, mastery ed eventi. Gli embedding futuri in pgvector sono un indice derivato e ricostruibile. Redis non viene introdotto finché non esiste un requisito misurato di queue, rate limit o cache.

## Conseguenze

Correzioni e cancellazioni hanno una singola fonte verificabile. L'ambiente locale usa Docker Compose e migrazioni versionate.
