# ADR 0002 — Adapter AI deterministico prima del provider remoto

Stato: accepted

## Contesto

Il vertical slice deve essere riproducibile, testabile senza segreti e dimostrare che il modello non è il database.

## Decisione

Il primo adapter implementa scenari golden deterministici e restituisce gli stessi output strutturati del provider remoto. Il gateway valida ogni output e misura l'uso. Un provider remoto verrà aggiunto dietro la stessa porta.

## Conseguenze

La demo funziona offline e le regole di dominio vengono testate subito. La qualità conversazionale aperta non è ancora rappresentativa e sarà dichiarata nell'interfaccia e nel README.
