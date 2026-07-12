# LifeLang — Note tecniche integrative per Codex

**Versione:** 1.0  
**Documento principale:** `LifeLang_PRD_Spec.md`  
**Scopo:** trasformare il PRD in un percorso di implementazione verificabile senza modificarne la visione o i requisiti.

---

## 1. Come usare questo documento

Il PRD resta la fonte primaria dei requisiti di prodotto. Queste note:

- chiariscono alcune decisioni architetturali;
- riducono il rischio di costruire una semplice chat mascherata da simulatore;
- propongono contratti e confini tecnici;
- definiscono l'ordine consigliato di implementazione;
- esplicitano controlli di coerenza, costi, privacy e test.

In caso di conflitto, Codex deve segnalare la divergenza e applicare il PRD, salvo una decisione registrata in un ADR approvato.

---

## 2. Decisione architetturale principale

Per il vertical slice usare un **modular monolith TypeScript**, non microservizi.

Motivazioni:

- il prodotto richiede transazioni coerenti tra scena, memoria, relazione e storyline;
- il dominio è ancora in fase di scoperta;
- i microservizi renderebbero più complessi test, debugging e deployment;
- i confini logici possono essere estratti in seguito senza distribuire subito i componenti.

Moduli raccomandati:

1. Identity and Access;
2. Learner Profile;
3. World and Time;
4. Characters and Relationships;
5. Narrative and Storylines;
6. Scenes and Conversation;
7. Memory;
8. Learning and Assessment;
9. AI Gateway;
10. Safety;
11. Messaging;
12. Observability;
13. Admin and Authoring.

Ogni modulo deve esporre use case e contratti, non tabelle o dettagli del provider AI.

---

## 3. Stack consigliato per il vertical slice

- monorepo con `pnpm` e Turborepo;
- Next.js, React e TypeScript strict;
- PostgreSQL come source of truth;
- pgvector per retrieval semantico, solo dopo la validazione delle memorie;
- Prisma o Drizzle con migrazioni versionate;
- Zod o JSON Schema per tutti i contratti AI;
- Server-Sent Events per streaming testuale;
- job worker per consolidamento memoria, debrief e simulazione offline;
- Redis soltanto quando serve realmente per queue, rate limit o cache;
- object storage S3-compatible per l'audio;
- OpenTelemetry, log strutturati ed error tracking;
- test con Vitest, integration test su database reale ed E2E con Playwright.

La voce deve essere integrata tramite adapter STT/TTS sostituibili. Non bloccare il ciclo testuale in attesa della voce.

---

## 4. Regole invarianti del dominio

Queste regole devono essere applicate dal codice, non affidate soltanto ai prompt.

1. Un output AI non modifica direttamente lo stato canonico.
2. Ogni modifica persistente deriva da un comando validato e da un evento registrato.
3. Un NPC può usare soltanto fatti inclusi nel proprio knowledge boundary.
4. Una storyline avanza soltanto quando le precondizioni sono soddisfatte.
5. Un personaggio non può trovarsi contemporaneamente in luoghi incompatibili.
6. Una memoria contestata non viene presentata come fatto certo.
7. La correzione di una memoria sostituisce anche il contenuto indicizzato nel retrieval.
8. Gli aggiornamenti critici della fine scena sono atomici o protetti da outbox pattern.
9. Gli handler degli eventi sono idempotenti.
10. Gli eventi irreversibili importanti non avvengono offline senza una finestra di intervento.
11. Un replay didattico non modifica la timeline canonica, salvo scelta esplicita.
12. Il livello CEFR è sempre indicato come stima, non certificazione.

---

## 5. Source of truth e memoria

Separare chiaramente quattro livelli:

### 5.1 Stato canonico

Fatti verificati necessari al funzionamento del mondo: professioni, residenze, relazioni familiari, proprietà, posizione, stato delle storyline e calendario.

### 5.2 Memoria episodica

Riepiloghi di eventi e interazioni. Può essere incompleta o soggettiva.

### 5.3 Conoscenza dell'NPC

Collegamento tra un NPC e un fatto, con origine, confidenza, data e possibile dimenticanza. Sapere che un fatto esiste nel mondo non significa che ogni NPC lo conosca.

### 5.4 Indice semantico

Strumento di ricerca, mai source of truth. Contiene embedding di memorie già validate e riferimenti agli ID canonici.

Una possibile struttura di fatto canonico:

```ts
type CanonicalFact = {
  id: string;
  worldId: string;
  subject: EntityRef;
  predicate: string;
  object: unknown;
  confidence: number;
  status: "active" | "contested" | "superseded" | "deleted";
  validFrom: string;
  validTo?: string;
  sourceEventId: string;
  version: number;
};
```

Pipeline di consolidamento:

1. estrazione dei candidati;
2. classificazione come fatto, opinione, preferenza, promessa o inferenza;
3. assegnazione di importanza e confidenza;
4. deduplicazione;
5. controllo dei conflitti;
6. approvazione tramite regole di dominio;
7. persistenza e audit trail;
8. indicizzazione semantica;
9. aggiornamento del knowledge boundary.

---

## 6. Event ledger

Ogni evento deve contenere almeno:

```ts
type DomainEvent<T> = {
  id: string;
  worldId: string;
  type: string;
  schemaVersion: number;
  actor: EntityRef | { type: "system" };
  payload: T;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  idempotencyKey: string;
};
```

Eventi minimi:

- `SCENE_PROPOSED`;
- `SCENE_STARTED`;
- `USER_SPOKE`;
- `NPC_RESPONDED`;
- `SCENE_COMPLETED`;
- `FACT_DISCOVERED`;
- `FACT_CONTESTED`;
- `MEMORY_CREATED`;
- `MEMORY_CORRECTED`;
- `RELATIONSHIP_CHANGED`;
- `STORYLINE_ADVANCED`;
- `LEARNING_OBJECTIVE_UPDATED`;
- `MESSAGE_RECEIVED`;
- `TIME_ADVANCED`;
- `LOCATION_VISITED`.

L'event ledger serve per audit, debugging e ricostruzione delle conseguenze. Non è necessario adottare event sourcing completo nell'MVP.

---

## 7. Contratti AI

Non usare un prompt monolitico. Ogni chiamata AI ha uno scopo singolo, input minimo, output validato e versione registrata.

### 7.1 SceneProposal

```ts
type SceneProposal = {
  title: string;
  reason: string;
  locationId: string;
  participantIds: string[];
  prerequisiteFactIds: string[];
  narrativeObjective: string;
  primaryLearningObjectiveId: string;
  secondaryLearningObjectiveIds: string[];
  targetItemIds: string[];
  estimatedTurns: number;
  possibleOutcomes: Array<{
    key: string;
    description: string;
    allowedCommands: string[];
  }>;
};
```

Il Director propone; il dominio decide se la scena è valida.

### 7.2 SceneBrief

Deve essere congelato all'avvio e includere identità, luogo, tempo, partecipanti, obiettivi, fatti autorizzati, stato relazionale e limiti. Evitare di cambiare implicitamente gli obiettivi durante la scena.

### 7.3 NPCTurn

```ts
type NPCTurn = {
  utterance: string;
  action?: string;
  emotion: {
    label: string;
    intensity: number;
  };
  sceneSignals: string[];
  memoryCandidates: MemoryCandidate[];
  proposedCommands: ProposedDomainCommand[];
  sceneStatus: "continue" | "ready_to_close";
};
```

Le `proposedCommands` non sono eseguite finché non superano validazione, autorizzazione e regole di dominio.

### 7.4 LanguageEvaluation

Separare:

- successo comunicativo;
- errore certo;
- formulazione possibile ma innaturale;
- alternativa stilistica;
- probabile errore di trascrizione;
- evidenza collegata al messaggio originale.

Ogni correzione deve includere confidenza e severità. Il debrief seleziona al massimo tre elementi ad alta utilità.

---

## 8. Knowledge boundary degli NPC

Per ogni turno costruire il contesto dell'NPC usando:

- fatti personali stabili;
- fatti pubblici pertinenti;
- fatti osservati direttamente;
- fatti comunicati da persone autorizzate;
- inferenze esplicitamente marcate;
- memorie episodiche rilevanti;
- stato della relazione con l'utente.

Non includere:

- segreti di altri NPC non condivisi;
- note interne del Director;
- rubriche didattiche;
- fatti reali dell'utente non introdotti nella vita virtuale;
- intero storico delle conversazioni;
- possibili eventi futuri.

Prevedere test automatici specifici contro il knowledge leakage.

---

## 9. Fine scena: transazione critica

La conclusione della scena deve seguire questo ordine:

1. blocco ottimistico sulla versione della scena;
2. determinazione dell'esito con regole di dominio;
3. aggiornamento della relazione;
4. avanzamento condizionale della storyline;
5. registrazione degli eventi nell'outbox;
6. commit della scena;
7. elaborazione asincrona di memoria e debrief;
8. pianificazione di conseguenze future;
9. aggiornamento di Today.

Se l'estrazione AI della memoria fallisce, la scena resta completata ma il job viene ritentato. Se la validazione fallisce, nessuna memoria candidata entra nello stato canonico.

---

## 10. Retrieval

Il retrieval deve combinare:

- filtri per mondo e proprietario;
- autorizzazione alla conoscenza;
- tipo e stato della memoria;
- recency;
- importanza;
- rilevanza relazionale;
- similarità semantica;
- limite rigido al numero di risultati.

Registrare quali memorie sono state fornite al modello. Questo permette di distinguere un problema di retrieval da un problema di generazione.

Una politica iniziale può recuperare:

- 3–5 fatti canonici;
- 2–4 episodi relazionali;
- 1 riepilogo della storyline;
- obiettivi e questioni aperte direttamente pertinenti.

I numeri vanno tarati tramite eval, non trattati come requisiti definitivi.

---

## 11. Learning engine

Ogni scena deve avere:

- una funzione comunicativa;
- un obiettivo primario;
- massimo due obiettivi secondari;
- parole o collocazioni target;
- criterio osservabile di successo;
- grado di supporto coerente con il livello.

Conservare separatamente `recognitionScore` e `productionScore` per ogni learning item. Un item non diventa consolidato perché il modello lo ha usato: deve essere prodotto o compreso dall'utente in più occasioni.

Il sistema di spaced repetition suggerisce al Director contesti narrativi compatibili, senza imporre frasi artificiali agli NPC.

---

## 12. Cost control

Ogni chiamata deve registrare:

- provider e modello;
- scopo;
- prompt version;
- input/output token;
- secondi audio;
- latenza;
- cache hit;
- tentativi;
- costo stimato;
- stato e codice errore.

Applicare budget per scena, giorno e piano. Strategie di contenimento:

- modelli piccoli per classificazione ed estrazione semplice;
- modello più capace per dialoghi o scene importanti;
- riepiloghi progressivi;
- retrieval limitato;
- caching di identità e prompt stabili;
- batch per job offline;
- lunghezza massima della scena;
- fallback testuale se TTS non è disponibile.

Non ottimizzare soltanto il costo per chiamata: misurare costo per conversazione significativa e per utente trattenuto.

---

## 13. Privacy e sicurezza

Separare:

- account reale;
- protagonista virtuale;
- memoria narrativa;
- profilo linguistico;
- audio e trascrizioni.

Requisiti minimi:

- cifratura in transito e a riposo;
- autorizzazione per `userId` e `worldId` su ogni query;
- retention configurabile per audio;
- esportazione e cancellazione dei dati;
- cancellazione degli embedding associati;
- audit log delle correzioni di memoria;
- redazione dei dati sensibili nei log;
- protezione contro prompt injection nei messaggi;
- rate limiting;
- secret manager o variabili ambiente;
- threat model prima del beta test.

Gli NPC non devono usare senso di colpa, minacce o pressione emotiva per favorire il ritorno dell'utente.

---

## 14. Osservabilità

Usare un `correlationId` per collegare:

- apertura scena;
- turni;
- retrieval;
- chiamate AI;
- validazioni;
- aggiornamenti memoria;
- eventi futuri;
- debrief.

Dashboard minima:

- latenza p50/p95 per tipo di chiamata;
- costo medio per turno e scena;
- invalid structured output rate;
- retry rate;
- contraddizioni rilevate;
- memory extraction failure rate;
- knowledge leakage test failures;
- scene completion rate.

Evitare di inserire conversazioni integrali nei log applicativi. Usare ID e campioni autorizzati in ambienti controllati.

---

## 15. Test ed eval

### Test deterministici

- transizioni della storyline;
- regole relazionali;
- idempotenza degli eventi;
- correzione e cancellazione memoria;
- knowledge boundary;
- budget e routing;
- validazione degli schemi.

### Integration test

- transazione di fine scena;
- outbox e worker;
- retrieval ibrido;
- aggiornamento dell'indice vettoriale;
- retry dopo errore provider;
- isolamento tra utenti e mondi.

### Golden eval AI

Costruire scenari fissi con stato iniziale, conversazione e proprietà attese:

- l'NPC ricorda un nome;
- l'NPC non conosce un segreto;
- una promessa genera un seguito;
- un fatto corretto sostituisce il precedente;
- il livello della lingua resta adeguato;
- il debrief non corregge alternative stilistiche come errori;
- il Director evita ripetizioni recenti;
- la scena non contraddice calendario e luogo.

Eseguire gli eval quando cambia modello, prompt, schema o retrieval policy.

---

## 16. Ordine di implementazione consigliato

### Milestone 0 — Foundation

- monorepo;
- CI;
- lint, typecheck e test;
- database e migrazioni;
- autenticazione;
- observability;
- AI Gateway con fake adapter;
- seed framework.

### Milestone 1 — World

- onboarding essenziale;
- protagonista;
- mondo e tempo;
- quattro luoghi;
- tre NPC;
- schermata Today.

### Milestone 2 — Conversation

- `SceneProposal` e `SceneBrief`;
- chat testuale in streaming;
- persistenza dei turni;
- validazione e safety;
- logging costi e latenza.

### Milestone 3 — Memory and consequence

- canonical facts;
- memory extraction;
- knowledge boundary;
- retrieval;
- relazioni;
- event ledger;
- scena successiva influenzata dalla precedente.

### Milestone 4 — Learning

- learning items;
- mastery;
- language evaluator;
- debrief;
- dashboard;
- ripetizione narrativa minima.

### Milestone 5 — Quality gate

- demo flow E2E;
- eval suite;
- privacy controls;
- performance;
- correzione/cancellazione memoria;
- documentazione e deploy staging.

Integrare la voce soltanto dopo aver stabilizzato il ciclo testuale, salvo una decisione esplicita diversa.

---

## 17. Criterio tecnico di successo

Il vertical slice è tecnicamente riuscito soltanto se dimostra con dati persistenti che:

1. una conversazione produce una memoria validata;
2. la memoria è disponibile soltanto agli NPC autorizzati;
3. una scelta o promessa genera una conseguenza successiva;
4. la nuova scena rispetta mondo, calendario e storyline;
5. il sistema identifica pochi errori linguistici ad alto valore;
6. almeno un learning item riappare naturalmente;
7. l'utente può vedere e correggere una memoria;
8. la correzione influenza il retrieval successivo;
9. costi, token e latenza sono misurati;
10. il demo flow è riproducibile tramite test con fake AI adapter.

Se manca uno di questi punti, il sistema è ancora un prototipo conversazionale e non il vertical slice di LifeLang.

---

## 18. Prompt breve da aggiungere alla richiesta di sviluppo

```text
Leggi prima LifeLang_PRD_Spec.md, che è la specifica master, e poi
LifeLang_Note_Tecniche_Integrative.md, che contiene raccomandazioni attuative.

Non iniziare subito a implementare tutto. Ispeziona il repository, produci i
deliverable pre-coding richiesti dal PRD e crea un backlog con dipendenze e criteri
di accettazione. Implementa poi il vertical slice per milestone verificabili.

Usa uno stato canonico persistente, output AI validati, knowledge boundary per gli
NPC, eventi idempotenti e test deterministici. Il modello non è il database e non
può aggiornare direttamente relazioni, memoria o storyline.

La priorità è dimostrare:
Conversazione → memoria → conseguenza → nuova scena coerente → apprendimento.

Se una decisione non è bloccante, scegli un default ragionevole, documentalo in
un ADR e continua. Chiedi approvazione soltanto per scelte costose, irreversibili
o che cambiano sostanzialmente il prodotto.
```
