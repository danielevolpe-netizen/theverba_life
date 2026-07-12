# ADR 0004 — Vercel AI Gateway come primo gateway LLM

Stato: accepted

## Decisione

LifeLang usa Vercel AI Gateway come primo percorso LLM configurabile. Il modello iniziale è `openai/gpt-5.4-mini`, identificato nel formato `creator/model`. L'applicazione chiama l'endpoint OpenAI-compatible del gateway dal solo server e valida ogni risposta con il contratto `NPCTurn@1` prima che il dominio possa persistere comandi o conseguenze.

La UI Settings espone soltanto metadati non sensibili: gateway, endpoint, modello selezionato, tipo di autenticazione e stato configurato/non configurato. La chiave non raggiunge mai il client.

## Fallback

Se `AI_PROVIDER` non seleziona il gateway o se manca `AI_GATEWAY_API_KEY` (e non è disponibile un token OIDC Vercel), resta attivo l'adapter deterministico. Questo mantiene avvio locale, test e demo riproducibili senza simulare che un provider reale sia connesso.

## Conseguenze

Nuovi gateway potranno essere aggiunti dietro la stessa porta `SceneAI`. Costi, latenza e token continuano a essere misurati per turno; il pricing reale verrà configurato separatamente quando il modello entrerà in esercizio.
