# LIFELANG

## Product Requirements Document e specifica tecnica

**Versione:** 1.0  
**Stato:** Concept e specifica per MVP  
**Nome provvisorio:** LifeLang  
**Categoria:** AI language learning, life simulation, role-playing game  
**Piattaforme iniziali:** Web responsive e mobile app  
**Lingua iniziale da apprendere:** Inglese  
**Lingua madre iniziale:** Italiano  

---

# 1. Istruzioni per l’agente di sviluppo

Questo documento descrive un prodotto completo chiamato provvisoriamente **LifeLang**.

L’obiettivo dell’agente di sviluppo è:

1. analizzare l’intera specifica;
2. proporre un’architettura tecnica sostenibile;
3. suddividere il lavoro in milestone;
4. creare inizialmente un MVP funzionante;
5. evitare di simulare funzionalità che non sono realmente implementate;
6. mantenere il codice modulare, testabile e documentato;
7. non modificare requisiti fondamentali senza dichiararlo;
8. segnalare eventuali incoerenze o rischi tecnici;
9. privilegiare un’esperienza semplice ma completa rispetto a molte funzionalità superficiali;
10. costruire il sistema in modo che possa evolvere da applicazione educativa a vero mondo virtuale persistente.

Prima di sviluppare, l’agente deve produrre:

- architettura proposta;
- struttura del repository;
- schema del database;
- flussi principali;
- backlog suddiviso per milestone;
- rischi tecnici;
- assunzioni;
- decisioni che richiedono approvazione.

---

# 2. Visione del prodotto

LifeLang è un’applicazione per imparare l’inglese vivendo una seconda vita simulata.

L’utente non svolge esercizi isolati e non seleziona semplicemente uno scenario come:

- ordinare al ristorante;
- prenotare un hotel;
- parlare con un medico;
- sostenere un colloquio.

L’utente entra invece in un **mondo narrativo persistente**, nel quale:

- possiede un’identità;
- vive in una città;
- ha una casa;
- svolge un lavoro;
- frequenta luoghi;
- conosce persone;
- costruisce relazioni;
- prende decisioni;
- affronta problemi;
- accumula esperienze;
- modifica il mondo attraverso le proprie azioni.

L’inglese non viene presentato come materia scolastica.

L’inglese è la lingua necessaria per vivere nel mondo virtuale.

## 2.1 Sintesi del concept

> Una seconda vita interattiva, generata dall’intelligenza artificiale, nella quale l’utente costruisce relazioni, lavora, viaggia e affronta eventi quotidiani usando la lingua che desidera imparare.

## 2.2 Principio fondamentale

L’app deve far percepire all’utente:

> “Voglio tornare per sapere cosa succederà nella mia vita virtuale.”

Non soltanto:

> “Devo tornare per studiare inglese.”

## 2.3 Differenziazione

Le tradizionali applicazioni linguistiche utilizzano:

- lezioni;
- esercizi;
- flashcard;
- scenari indipendenti;
- chatbot senza memoria;
- dialoghi che iniziano e finiscono senza conseguenze.

LifeLang utilizza:

- continuità narrativa;
- personaggi ricorrenti;
- memoria persistente;
- relazioni;
- conseguenze;
- luoghi riconoscibili;
- progressione personale;
- eventi dinamici;
- obiettivi linguistici nascosti nella storia.

---

# 3. Problema da risolvere

Le applicazioni di language learning soffrono frequentemente di cinque problemi.

## 3.1 Scarsa continuità

L’utente affronta oggi un dialogo al ristorante e domani una conversazione dal veterinario. Gli scenari non sono collegati.

## 3.2 Coinvolgimento limitato

L’apprendimento è percepito come un compito e non come un’esperienza.

## 3.3 Memoria artificiale insufficiente

Il personaggio AI spesso dimentica:

- chi è l’utente;
- cosa è successo;
- quali persone ha incontrato;
- quali promesse ha fatto;
- quali argomenti sono già stati discussi.

## 3.4 Personalizzazione superficiale

Molte app personalizzano soltanto il livello linguistico, ma non:

- la vita dell’utente;
- gli interessi;
- la professione;
- le relazioni;
- gli obiettivi;
- gli errori ricorrenti;
- la personalità;
- il ritmo di apprendimento.

## 3.5 Mancanza di conseguenze

La conversazione non produce effetti reali sul mondo.

In LifeLang, invece:

- un cliente può diventare un partner;
- un amico può perdere fiducia;
- un dipendente può dimettersi;
- una promessa non mantenuta può riapparire;
- una scelta può aprire o chiudere una storyline;
- un errore linguistico può generare un piccolo equivoco realistico.

---

# 4. Pubblico di riferimento

## 4.1 Target primario

Adulti tra 25 e 55 anni che:

- conoscono almeno le basi dell’inglese;
- vogliono migliorare soprattutto la conversazione;
- hanno abbandonato corsi tradizionali;
- utilizzano l’inglese per lavoro, viaggi o relazioni;
- preferiscono imparare attraverso esperienze pratiche;
- sono interessati a videogiochi, serie televisive o storie interattive.

## 4.2 Target secondario

- studenti universitari;
- professionisti;
- manager;
- imprenditori;
- expat;
- persone che devono trasferirsi all’estero;
- candidati che preparano colloqui internazionali.

## 4.3 Livelli supportati inizialmente

- A1 avanzato;
- A2;
- B1;
- B2;
- C1.

Il prodotto non deve essere progettato inizialmente per persone completamente prive di conoscenze della lingua.

---

# 5. Principi di prodotto

Ogni decisione progettuale deve rispettare i seguenti principi.

## 5.1 Story first

L’utente deve vivere una storia, non percepire una sequenza di esercizi.

## 5.2 Learning by living

Le competenze linguistiche vengono allenate attraverso bisogni concreti.

## 5.3 Persistent consequences

Le azioni dell’utente devono modificare relazioni, opportunità e mondo.

## 5.4 Controlled generative AI

L’intelligenza artificiale non deve generare liberamente tutto. Deve operare entro:

- regole narrative;
- dati strutturati;
- obiettivi educativi;
- limiti di sicurezza;
- fatti memorizzati.

## 5.5 Invisible curriculum

Il sistema segue un curriculum linguistico, ma l’utente non deve percepirlo come una lezione tradizionale.

## 5.6 Low friction

Per iniziare una conversazione devono essere necessari pochissimi passaggi.

## 5.7 Explain on demand

L’app non deve interrompere continuamente il dialogo per correggere. Le spiegazioni devono essere disponibili:

- su richiesta;
- al termine della scena;
- quando l’errore impedisce la comprensione;
- quando l’utente attiva la modalità tutor.

## 5.8 Consistency over creativity

È preferibile una storia meno sorprendente ma coerente rispetto a una storia creativa che contraddice il passato.

---

# 6. Struttura dell’esperienza

L’esperienza è composta da sei livelli.

## 6.1 Il mondo

Rappresenta la città o l’ambiente generale nel quale vive l’utente.

Contiene:

- quartieri;
- luoghi;
- attività commerciali;
- aziende;
- servizi;
- eventi;
- notizie;
- condizioni atmosferiche;
- economia semplificata;
- calendario.

## 6.2 La vita dell’utente

Contiene:

- identità virtuale;
- abitazione;
- professione;
- risorse economiche;
- obiettivi;
- attività;
- reputazione;
- relazioni;
- cronologia.

## 6.3 I personaggi

Ogni personaggio non giocante, o NPC, deve avere:

- identità;
- personalità;
- tono di voce;
- obiettivi;
- paure;
- bisogni;
- professione;
- agenda;
- relazioni;
- opinioni;
- ricordi;
- livello di fiducia verso l’utente;
- informazioni conosciute e non conosciute.

## 6.4 Le scene

Una scena è un’interazione circoscritta nel tempo e nello spazio.

Esempi:

- colazione al bar;
- riunione con un cliente;
- appuntamento medico;
- telefonata con un amico;
- colloquio di lavoro;
- litigio;
- cena;
- imprevisto in aeroporto.

## 6.5 Le storyline

Una storyline è una sequenza di scene collegate.

Esempio:

1. l’utente incontra una donna durante un evento;
2. la donna lavora per un fondo di investimento;
3. propone un secondo incontro;
4. chiede informazioni sul progetto dell’utente;
5. introduce un partner;
6. nasce una trattativa;
7. la trattativa produce conseguenze positive o negative.

## 6.6 Il curriculum linguistico

Ogni scena deve allenare una o più competenze, tra cui:

- comprensione;
- vocabolario;
- grammatica;
- pronuncia;
- fluidità;
- ascolto;
- gestione della conversazione;
- pragmatica;
- registro;
- persuasione;
- narrazione.

---

# 7. Onboarding

L’onboarding deve durare tra cinque e otto minuti.

## 7.1 Creazione del profilo linguistico

L’utente indica:

- lingua madre;
- lingua da apprendere;
- livello percepito;
- obiettivi;
- difficoltà principali;
- tempo disponibile;
- preferenza tra testo e voce;
- interesse principale.

## 7.2 Valutazione iniziale

Il sistema esegue una breve conversazione adattiva.

Deve valutare:

- ampiezza del vocabolario;
- comprensione;
- costruzione delle frasi;
- uso dei tempi verbali;
- capacità di rispondere spontaneamente;
- errori frequenti;
- livello di sicurezza.

Il test non deve sembrare un esame.

## 7.3 Scelta della vita

L’utente sceglie una vita iniziale.

Esempi:

### Founder a New York

- dirige una piccola startup;
- cerca clienti e investitori;
- deve costruire un team;
- frequenta eventi professionali.

### Manager a Londra

- lavora in una società internazionale;
- gestisce persone;
- affronta riunioni;
- partecipa ad attività sociali.

### Nuovo residente a Miami

- deve trovare casa;
- aprire un conto;
- conoscere persone;
- orientarsi nella città.

### Studente a Boston

- frequenta l’università;
- vive con coinquilini;
- partecipa a lezioni ed eventi;
- cerca un lavoro part-time.

### Imprenditore in espansione internazionale

- mantiene il proprio ruolo reale;
- incontra partner esteri;
- negozia;
- assume collaboratori;
- presenta progetti.

## 7.4 Personalizzazione del protagonista

L’utente definisce:

- nome;
- età virtuale;
- professione;
- stile di vita;
- interessi;
- aspirazioni;
- tratti caratteriali;
- eventuali paure;
- disponibilità economica iniziale;
- intensità narrativa desiderata.

## 7.5 Modalità di realismo

Tre modalità:

### Realistica

Eventi plausibili, vita quotidiana e professionale.

### Cinematografica

Eventi più intensi, coincidenze, conflitti e opportunità frequenti.

### Avventura

Misteri, elementi thriller, fantasy o fantascientifici.

Per l’MVP deve essere implementata soprattutto la modalità realistica.

---

# 8. Categorie della vita

Le categorie non devono essere presentate come menu rigidi. Devono servire al sistema per bilanciare le esperienze.

## 8.1 Daily Life

- casa;
- spesa;
- ristorante;
- servizi;
- banca;
- trasporti;
- acquisti;
- salute;
- palestra;
- manutenzione;
- burocrazia.

## 8.2 Social Life

- amicizie;
- inviti;
- feste;
- vicini;
- appuntamenti;
- famiglia;
- incomprensioni;
- conversazioni informali;
- networking;
- relazioni.

## 8.3 Professional Life

- riunioni;
- vendite;
- negoziazioni;
- leadership;
- recruiting;
- feedback;
- gestione dei conflitti;
- partnership;
- presentazioni;
- problem solving;
- decisioni.

## 8.4 Travel

- taxi;
- aeroporto;
- hotel;
- noleggio auto;
- bagagli;
- ristoranti;
- emergenze;
- indicazioni;
- itinerari;
- interazioni culturali.

## 8.5 Culture and Interests

- libri;
- cinema;
- musica;
- sport;
- arte;
- tecnologia;
- cucina;
- attualità;
- hobby.

## 8.6 Creative and Adventure

- misteri;
- detective story;
- viaggi nel tempo;
- fantasy;
- fantascienza;
- scenari alternativi.

---

# 9. Loop principale dell’utente

Il loop quotidiano deve essere semplice.

## 9.1 Apertura dell’app

L’utente vede una schermata chiamata **Today**.

Contiene:

- data e ora virtuale;
- luogo attuale;
- messaggi ricevuti;
- eventi programmati;
- novità nel mondo;
- persone che hanno cercato l’utente;
- una proposta di attività;
- eventuali questioni irrisolte.

Esempio:

> Sarah ti ha scritto riguardo alla cena di ieri.  
> Alle 10:30 hai una riunione con Alex.  
> Il tuo vicino ha lasciato un pacco davanti alla porta.  
> La tua proposta commerciale scade domani.

## 9.2 Scelta dell’attività

L’utente può:

- rispondere a un messaggio;
- avviare una scena;
- recarsi in un luogo;
- chiamare una persona;
- partecipare a un evento;
- svolgere una missione;
- esplorare liberamente.

## 9.3 Conversazione

L’utente interagisce tramite:

- voce;
- testo;
- scelta rapida opzionale.

## 9.4 Risultato

Al termine della scena, il sistema aggiorna:

- memoria;
- relazioni;
- storyline;
- eventi;
- profilo linguistico;
- inventario;
- reputazione;
- agenda.

## 9.5 Debrief linguistico

L’utente riceve un riepilogo breve:

- cosa ha comunicato bene;
- massimo tre errori importanti;
- una frase migliore;
- nuove parole;
- pronuncia da allenare;
- progresso della competenza.

Il debrief non deve trasformarsi in una lezione lunga.

---

# 10. Conversazioni

## 10.1 Modalità disponibili

### Immersive mode

- solo inglese;
- nessuna traduzione automatica;
- correzioni soltanto alla fine;
- gli NPC reagiscono naturalmente.

### Assisted mode

- possibilità di tradurre parole;
- suggerimenti discreti;
- correzioni principali;
- pulsante “Come posso dirlo?”.

### Tutor mode

- spiegazioni frequenti;
- traduzioni;
- possibilità di interrompere la scena;
- guida grammaticale.

## 10.2 Interazioni vocali

Il sistema deve supportare:

- speech-to-text;
- text-to-speech;
- risposta in streaming;
- interruzione dell’NPC;
- riconoscimento delle pause;
- gestione del silenzio;
- velocità della voce personalizzabile;
- ripetizione;
- visualizzazione opzionale del testo.

## 10.3 Pronuncia

Il sistema deve valutare separatamente:

- intelligibilità;
- suoni problematici;
- accento tonico;
- ritmo;
- fluidità;
- parole omesse;
- parole non riconosciute.

La valutazione non deve penalizzare un accento italiano comprensibile.

## 10.4 Reazioni agli errori

Gli NPC non devono sempre ignorare gli errori.

Esempi:

- errore lieve: continuano normalmente;
- frase ambigua: chiedono chiarimento;
- termine errato: interpretano in modo plausibile;
- errore importante: il tutor interviene in modo discreto;
- errore culturalmente inappropriato: reagiscono in base alla personalità.

---

# 11. Motore narrativo

Il motore narrativo è il cuore del prodotto.

## 11.1 Responsabilità

Deve:

- selezionare gli eventi;
- generare le scene;
- mantenere la coerenza;
- sviluppare le storyline;
- rispettare la memoria;
- bilanciare vita personale e professionale;
- inserire obiettivi linguistici;
- evitare ripetizioni;
- gestire conseguenze.

## 11.2 Tipi di eventi

### Scheduled events

Eventi programmati:

- appuntamento;
- riunione;
- compleanno;
- viaggio;
- colloquio.

### Reactive events

Conseguenze di azioni precedenti:

- risposta a una proposta;
- reclamo;
- ringraziamento;
- litigio;
- opportunità.

### Ambient events

Rendono vivo il mondo:

- pioggia;
- traffico;
- manifestazione;
- promozione in un negozio;
- apertura di un locale.

### Learning events

Creati per allenare una competenza:

- chiedere chiarimenti;
- rifiutare educatamente;
- gestire un’obiezione;
- raccontare un fatto passato;
- formulare ipotesi.

### Narrative events

Fanno avanzare la storia:

- incontro importante;
- segreto;
- conflitto;
- scelta;
- cambiamento di relazione.

## 11.3 Director AI

Un componente denominato **Director AI** deve decidere:

- cosa proporre;
- quando proporlo;
- con quali personaggi;
- con quale difficoltà;
- con quale obiettivo linguistico;
- con quale intensità narrativa.

Il Director AI non dialoga direttamente con l’utente. Pianifica.

## 11.4 Scene AI

Un componente denominato **Scene AI** gestisce la singola conversazione.

Riceve:

- descrizione della scena;
- personaggi presenti;
- fatti rilevanti;
- obiettivi;
- conoscenze degli NPC;
- tono;
- livello linguistico;
- eventi possibili;
- limiti.

Restituisce:

- risposta dell’NPC;
- emozione;
- azione;
- eventuale evento;
- fatti da memorizzare;
- variazioni relazionali;
- stato della scena.

## 11.5 Regole di coerenza

L’AI non può:

- conoscere fatti mai comunicati al personaggio;
- cambiare improvvisamente professione a un NPC;
- contraddire eventi stabiliti;
- resuscitare relazioni chiuse senza motivo;
- spostare personaggi in luoghi incompatibili;
- inventare proprietà dell’utente già definite diversamente;
- modificare unilateralmente fatti strutturali.

---

# 12. Sistema di memoria

La memoria deve essere ibrida: strutturata, temporale e semantica.

## 12.1 Tipi di memoria

### Memoria del profilo

Fatti stabili sull’utente:

- professione;
- interessi;
- preferenze;
- obiettivi;
- famiglia virtuale;
- paure;
- stile comunicativo.

### Memoria episodica

Eventi specifici:

- incontro con un personaggio;
- promessa;
- litigio;
- acquisto;
- viaggio;
- successo;
- fallimento.

### Memoria relazionale

Per ogni coppia utente-personaggio:

- fiducia;
- simpatia;
- rispetto;
- familiarità;
- tensione;
- debito;
- attrazione opzionale;
- storia condivisa.

### Memoria semantica del mondo

Fatti consolidati:

- John lavora in banca;
- il Café North chiude alle 20;
- Sarah è sorella di Alex;
- l’utente possiede un appartamento.

### Memoria linguistica

- parole conosciute;
- parole emergenti;
- errori frequenti;
- strutture grammaticali;
- pronuncia;
- velocità;
- livello per competenza.

### Memoria narrativa

- storyline attive;
- obiettivi aperti;
- misteri;
- conflitti;
- promesse;
- decisioni.

## 12.2 Livelli di importanza

Ogni memoria deve avere:

- importanza;
- affidabilità;
- data;
- origine;
- personaggi coinvolti;
- possibilità di scadenza;
- stato: attiva, risolta, superata, contestata.

## 12.3 Consolidamento

Non ogni frase deve diventare una memoria permanente.

Il sistema deve:

1. estrarre fatti candidati;
2. attribuire importanza;
3. eliminare duplicati;
4. distinguere fatti da opinioni;
5. aggiornare fatti esistenti;
6. generare un riepilogo dell’episodio;
7. memorizzare embedding per il recupero semantico.

## 12.4 Dimenticanza controllata

I personaggi possono dimenticare fatti poco importanti.

La dimenticanza deve dipendere da:

- importanza;
- tempo trascorso;
- personalità;
- intensità emotiva;
- frequenza;
- relazione.

---

# 13. Personaggi virtuali

## 13.1 Modello dati del personaggio

Ogni NPC deve includere:

- ID;
- nome;
- cognome;
- età;
- genere;
- aspetto sintetico;
- professione;
- luogo di lavoro;
- residenza;
- background;
- famiglia;
- interessi;
- valori;
- obiettivi;
- paure;
- segreti;
- personalità;
- stile linguistico;
- accento;
- livello culturale;
- disponibilità;
- agenda;
- relazioni;
- ricordi;
- stato emotivo;
- arco narrativo.

## 13.2 Tratti di personalità

Usare una combinazione di:

- Big Five semplificato;
- livello di formalità;
- pazienza;
- empatia;
- assertività;
- umorismo;
- curiosità;
- impulsività.

## 13.3 Obiettivi autonomi

Ogni personaggio deve avere:

- obiettivi a breve termine;
- obiettivi a lungo termine;
- bisogni;
- priorità;
- ostacoli.

Gli NPC non devono esistere soltanto in funzione dell’utente.

## 13.4 Evoluzione

I personaggi possono:

- cambiare lavoro;
- trasferirsi;
- iniziare o interrompere relazioni;
- migliorare o peggiorare il rapporto con l’utente;
- perseguire opportunità;
- commettere errori;
- modificare opinioni.

## 13.5 Limite dell’autonomia

Per l’MVP il mondo non deve simulare continuamente ogni NPC.

Il sistema deve utilizzare una simulazione a eventi:

- quando passa tempo;
- quando l’utente torna nell’app;
- quando una storyline richiede un aggiornamento;
- quando un personaggio ha un evento programmato.

---

# 14. Luoghi e mappa

## 14.1 Mappa iniziale

Per l’MVP è sufficiente una città con:

- casa dell’utente;
- bar;
- ristorante;
- supermercato;
- palestra;
- ufficio;
- banca;
- farmacia;
- ospedale;
- stazione;
- aeroporto;
- parco;
- locale;
- negozio;
- hotel.

## 14.2 Ogni luogo deve avere

- nome;
- categoria;
- indirizzo virtuale;
- quartiere;
- orari;
- descrizione;
- personale;
- clienti abituali;
- reputazione;
- eventi;
- memoria delle visite;
- livello di familiarità con l’utente.

## 14.3 Familiarità

Esempio:

Prima visita:

> “Good morning. What can I get you?”

Dopo dieci visite:

> “Morning, Daniele. The usual?”

Dopo una lunga assenza:

> “I haven’t seen you in a while. Everything okay?”

---

# 15. Tempo e mondo persistente

## 15.1 Modalità temporali

### Real time

Il mondo segue il tempo reale.

### Accelerated time

Un giorno reale equivale a più giorni virtuali.

### Session time

Il tempo avanza principalmente quando l’utente interagisce.

Per l’MVP usare una modalità ibrida:

- calendario legato al tempo reale;
- eventi principali congelati per evitare che l’utente li perda;
- aggiornamenti tra sessioni limitati e comprensibili.

## 15.2 Mondo offline

Quando l’utente non utilizza l’app, possono verificarsi:

- messaggi;
- piccoli cambiamenti;
- aggiornamenti professionali;
- eventi sociali;
- conseguenze già previste.

Non devono accadere offline eventi irreversibili troppo importanti senza possibilità di intervento.

---

# 16. Curriculum linguistico

## 16.1 Competenze principali

### Vocabulary

- parole frequenti;
- collocazioni;
- phrasal verbs;
- espressioni idiomatiche;
- linguaggio settoriale.

### Grammar

- tempi verbali;
- modali;
- condizionali;
- articoli;
- preposizioni;
- ordine delle parole;
- domande;
- subordinate.

### Conversation management

- iniziare;
- interrompere;
- chiedere chiarimenti;
- prendere tempo;
- cambiare argomento;
- concludere.

### Pragmatics

- formalità;
- cortesia;
- ironia;
- sottintesi;
- accordo;
- disaccordo;
- rifiuto;
- persuasione.

### Listening

- velocità;
- accenti;
- riduzioni;
- connected speech;
- rumore ambientale opzionale.

### Pronunciation

- fonemi;
- ritmo;
- accento;
- intonazione;
- intelligibilità.

## 16.2 Profilo di padronanza

Ogni elemento deve avere un punteggio, per esempio da 0 a 100:

- sconosciuto;
- riconosciuto;
- compreso;
- usato con aiuto;
- usato spontaneamente;
- consolidato.

## 16.3 Spaced repetition invisibile

Le parole e strutture da ripassare devono riapparire naturalmente.

Esempio:

Se l’utente deve consolidare “although”, il sistema può:

- farla usare da un NPC;
- creare una situazione in cui è utile;
- proporre un suggerimento;
- riutilizzarla dopo alcuni giorni.

## 16.4 Frequenza lessicale

Il sistema deve partire da vocabolari ad alta frequenza, integrando:

- livello CEFR;
- contesto dell’utente;
- professione;
- interessi;
- frequenza d’uso;
- utilità comunicativa.

## 16.5 Learning objectives per scena

Ogni scena deve contenere:

- obiettivo primario;
- massimo due obiettivi secondari;
- parole target;
- struttura grammaticale;
- funzione comunicativa;
- criterio di successo.

---

# 17. Correzioni e feedback

## 17.1 Tipi di errore

- grammaticale;
- lessicale;
- pronuncia;
- collocazione;
- registro;
- comprensione;
- pragmatica;
- fluidità.

## 17.2 Priorità

Non correggere tutto.

Dare priorità a:

1. errori che impediscono la comprensione;
2. errori ripetuti;
3. errori relativi all’obiettivo della scena;
4. errori molto frequenti nella lingua;
5. formulazioni innaturali importanti.

## 17.3 Debrief

Esempio:

**You handled the complaint well.**

Hai spiegato il problema in modo chiaro e sei rimasto cortese.

**Da migliorare**

Hai detto:

> “I am waiting from two hours.”

Forma più naturale:

> “I have been waiting for two hours.”

**Nuova espressione**

> “Could you look into this for me?”

## 17.4 Replay

L’utente può:

- ripetere una frase;
- riascoltare;
- registrarla di nuovo;
- rifare l’intera scena;
- provare una risposta alternativa.

Il replay non deve cancellare necessariamente la storia originale. Può essere una modalità allenamento separata.

---

# 18. Progressione

## 18.1 Progressione linguistica

Dashboard con:

- livello globale;
- comprensione;
- vocabolario;
- grammatica;
- pronuncia;
- fluidità;
- business English;
- social English.

## 18.2 Progressione narrativa

- giorni vissuti;
- persone conosciute;
- relazioni;
- luoghi scoperti;
- storyline concluse;
- reputazione;
- carriera;
- patrimonio virtuale;
- obiettivi raggiunti.

## 18.3 Missioni

Le missioni devono sembrare obiettivi di vita.

Esempi:

- ottenere un secondo incontro con un cliente;
- organizzare una cena;
- risolvere un problema con il vicino;
- convincere un candidato;
- prenotare un viaggio;
- aiutare un amico.

## 18.4 Achievement

Utilizzare achievement discreti:

- First Friend;
- Smooth Negotiator;
- Local Regular;
- Problem Solver;
- Confident Speaker;
- Storyteller.

Evitare una gamification eccessivamente infantile.

---

# 19. Interfaccia utente

## 19.1 Navigazione principale

Cinque sezioni:

### Today

Agenda, eventi e novità.

### World

Mappa, luoghi e attività.

### People

Network personale e relazioni.

### Journey

Storia, missioni e decisioni.

### English

Progressi, parole, errori e replay.

## 19.2 Schermata People

Per ogni persona:

- foto o avatar;
- nome;
- ruolo;
- dove è stata conosciuta;
- ultimo incontro;
- stato della relazione;
- fatti importanti;
- conversazioni;
- prossimi eventi.

## 19.3 Schermata World

Mostra:

- luoghi;
- distanza;
- apertura;
- persone presenti;
- eventi;
- grado di familiarità;
- possibilità di visita.

## 19.4 Schermata conversazione

Elementi:

- avatar;
- nome;
- contesto;
- sottotitoli opzionali;
- microfono;
- testo;
- traduci;
- suggerimento;
- pausa;
- ripeti;
- stato emotivo discreto.

## 19.5 UI generativa controllata

L’AI può generare contenuto, ma non deve modificare liberamente la struttura dell’interfaccia.

---

# 20. Economia virtuale

Per aumentare il realismo, l’utente può avere:

- reddito;
- spese;
- casa;
- acquisti;
- abbonamenti;
- viaggi.

Per l’MVP l’economia deve essere semplificata.

Non deve diventare un gestionale complesso.

Serve a creare decisioni:

- puoi permetterti un viaggio?
- accetti un nuovo lavoro?
- investi in un progetto?
- cambi appartamento?

---

# 21. Sicurezza e contenuti

## 21.1 Limiti

Il sistema deve gestire:

- molestie;
- linguaggio offensivo;
- contenuti sessuali;
- discriminazione;
- violenza;
- autolesionismo;
- minori;
- attività illegali;
- consigli medici o legali.

## 21.2 Contenuti sensibili

L’utente deve poter scegliere l’intensità:

- family friendly;
- standard;
- mature, nei limiti consentiti.

## 21.3 Manipolazione emotiva

Gli NPC non devono:

- fingere di essere esseri senzienti;
- creare dipendenza emotiva intenzionale;
- minacciare l’utente affinché torni;
- generare colpa legata all’assenza;
- sostituirsi a professionisti reali.

## 21.4 Privacy

Separare:

- identità reale;
- identità virtuale;
- memoria linguistica;
- cronologia narrativa.

L’utente deve poter:

- vedere i dati memorizzati;
- correggerli;
- eliminarli;
- disattivare la memoria;
- cancellare la vita virtuale.

---

# 22. Architettura tecnica proposta

## 22.1 Frontend

Possibili tecnologie:

- Next.js per il web;
- React Native o Expo per mobile;
- TypeScript;
- Tailwind o design system equivalente;
- streaming via WebSocket o Server-Sent Events.

## 22.2 Backend

Possibili tecnologie:

- Python con FastAPI oppure Node.js con NestJS;
- API REST per le operazioni standard;
- WebSocket per la conversazione in tempo reale;
- worker asincroni per memoria e simulazione;
- coda eventi.

## 22.3 Database

### PostgreSQL

Per:

- utenti;
- personaggi;
- relazioni;
- eventi;
- scene;
- storyline;
- luoghi;
- curriculum;
- progressi.

### Vector database

Per:

- memoria semantica;
- recupero di episodi;
- ricerca nei dialoghi;
- similarità tra errori;
- contenuti educativi.

Si può utilizzare:

- pgvector inizialmente;
- un database vettoriale dedicato in futuro.

### Redis

Per:

- sessioni;
- cache;
- stato temporaneo;
- rate limit;
- code leggere.

### Object storage

Per:

- audio;
- immagini;
- avatar;
- trascrizioni esportate.

## 22.4 Servizi AI

Separare logicamente:

- Director service;
- Scene service;
- Memory service;
- Language assessment service;
- Speech service;
- Safety service;
- Summary service.

## 22.5 Event-driven architecture

Ogni azione significativa genera un evento.

Esempi:

- SCENE_STARTED;
- USER_SPOKE;
- NPC_RESPONDED;
- FACT_DISCOVERED;
- RELATIONSHIP_CHANGED;
- SCENE_COMPLETED;
- MEMORY_CREATED;
- LEARNING_OBJECTIVE_UPDATED;
- STORYLINE_ADVANCED;
- MESSAGE_RECEIVED.

---

# 23. Modello dati iniziale

## 23.1 User

- id;
- email;
- locale;
- native_language;
- target_language;
- timezone;
- subscription_plan;
- created_at.

## 23.2 LearnerProfile

- user_id;
- CEFR_level;
- preferred_mode;
- interests;
- goals;
- corrections_preference;
- speech_speed;
- difficulty;
- assessment_summary.

## 23.3 World

- id;
- name;
- city;
- mode;
- current_date;
- status;
- configuration.

## 23.4 PlayerCharacter

- id;
- user_id;
- world_id;
- name;
- age;
- profession;
- biography;
- home_location_id;
- financial_state;
- reputation;
- goals.

## 23.5 NPC

- id;
- world_id;
- name;
- age;
- profession;
- biography;
- personality_json;
- goals_json;
- speech_profile_json;
- current_location_id;
- status.

## 23.6 Relationship

- id;
- subject_id;
- object_id;
- trust;
- affinity;
- respect;
- familiarity;
- tension;
- notes;
- updated_at.

## 23.7 Location

- id;
- world_id;
- name;
- category;
- description;
- opening_hours;
- metadata;
- status.

## 23.8 Scene

- id;
- world_id;
- location_id;
- storyline_id;
- title;
- objective;
- learning_objectives;
- started_at;
- ended_at;
- status;
- summary;
- outcome.

## 23.9 Message

- id;
- scene_id;
- speaker_type;
- speaker_id;
- content;
- audio_url;
- detected_language;
- timestamp;
- analysis_json.

## 23.10 Memory

- id;
- world_id;
- owner_type;
- owner_id;
- memory_type;
- content;
- structured_facts;
- importance;
- confidence;
- occurred_at;
- expires_at;
- embedding;
- status.

## 23.11 Storyline

- id;
- world_id;
- title;
- description;
- characters;
- state;
- current_stage;
- next_possible_events;
- status.

## 23.12 LearningItem

- id;
- language;
- type;
- lemma;
- phrase;
- definition;
- CEFR_level;
- frequency_rank;
- metadata.

## 23.13 LearnerMastery

- user_id;
- learning_item_id;
- recognition_score;
- production_score;
- last_seen;
- next_review;
- attempts;
- error_count.

---

# 24. Pipeline di una conversazione

## 24.1 Avvio scena

1. il Director seleziona la scena;
2. il sistema recupera personaggi;
3. recupera memoria rilevante;
4. recupera storyline;
5. seleziona obiettivi linguistici;
6. costruisce il scene brief;
7. avvia la conversazione.

## 24.2 Ogni turno

1. acquisizione voce o testo;
2. trascrizione;
3. analisi linguistica;
4. analisi intenzione;
5. recupero delle memorie rilevanti;
6. generazione risposta NPC;
7. validazione di coerenza;
8. validazione sicurezza;
9. sintesi vocale;
10. aggiornamento dello stato temporaneo.

## 24.3 Fine scena

1. generazione del risultato;
2. aggiornamento relazioni;
3. aggiornamento storyline;
4. estrazione memorie;
5. consolidamento;
6. aggiornamento profilo linguistico;
7. generazione debrief;
8. pianificazione di possibili eventi futuri.

---

# 25. Prompt architecture

Non utilizzare un unico prompt monolitico.

## 25.1 System prompt globale

Contiene:

- filosofia del prodotto;
- regole di sicurezza;
- regole narrative;
- separazione tra fatti e invenzioni;
- formato degli output.

## 25.2 Director prompt

Deve produrre output strutturato contenente:

- scena proposta;
- motivo;
- personaggi;
- obiettivi narrativi;
- obiettivi linguistici;
- rischio;
- possibili esiti;
- durata prevista.

## 25.3 NPC prompt

Contiene soltanto ciò che il personaggio può conoscere:

- identità;
- personalità;
- memoria;
- relazione;
- obiettivo;
- scena;
- conoscenze autorizzate.

## 25.4 Evaluator prompt

Valuta:

- grammatica;
- vocabolario;
- naturalezza;
- pragmatica;
- successo comunicativo;
- obiettivi della scena.

## 25.5 Memory extraction prompt

Restituisce JSON con:

- fatti;
- opinioni;
- promesse;
- preferenze;
- relazioni;
- questioni aperte;
- importanza;
- affidabilità.

## 25.6 Output strutturati

Tutti i componenti interni devono preferire JSON validato da schema.

La conversazione visibile all’utente resta naturale.

---

# 26. Controllo dei costi AI

## 26.1 Strategie

- modelli piccoli per classificazioni;
- modelli avanzati solo per scene complesse;
- riepiloghi progressivi;
- recupero di poche memorie rilevanti;
- caching;
- prompt compatti;
- batch per attività offline;
- limiti alla durata delle scene;
- compressione dello storico.

## 26.2 Gerarchia dei modelli

Esempio:

- classificazione intento: modello economico;
- estrazione memoria: modello economico o medio;
- dialogo NPC: modello medio;
- scene importanti: modello avanzato;
- valutazione linguistica: modello specializzato;
- sintesi: modello economico.

## 26.3 Budget per sessione

Il sistema deve registrare:

- token input;
- token output;
- secondi audio;
- costo stimato;
- latenza;
- modello utilizzato.

---

# 27. MVP

L’MVP non deve tentare di costruire subito un vero Second Life completo.

Deve dimostrare tre cose:

1. l’utente si affeziona ai personaggi;
2. la continuità narrativa aumenta il ritorno;
3. l’apprendimento linguistico è percepito come naturale.

## 27.1 Contenuto MVP

- una città;
- una vita iniziale;
- dieci luoghi;
- dodici NPC principali;
- tre storyline;
- cinquanta tipi di evento;
- conversazione testuale;
- conversazione vocale base;
- memoria persistente;
- relazioni;
- debrief linguistico;
- dashboard semplice;
- calendario;
- messaggi tra personaggi e utente.

## 27.2 Vita iniziale consigliata

**Imprenditore italiano che apre una nuova attività a New York.**

Motivazioni:

- combina vita quotidiana e business;
- permette scene sociali e professionali;
- consente un vocabolario ampio;
- crea obiettivi chiari;
- è adatta a utenti adulti;
- consente crescita narrativa.

## 27.3 NPC iniziali

1. proprietario dell’appartamento;
2. vicino di casa;
3. barista;
4. primo collaboratore;
5. potenziale cliente;
6. investitrice;
7. consulente legale;
8. amico locale;
9. personal trainer;
10. responsabile della banca;
11. ristoratrice;
12. concorrente.

## 27.4 Storyline iniziali

### Apertura dell’attività

- ricerca dell’ufficio;
- banca;
- assunzioni;
- clienti;
- problemi.

### Costruzione del network

- eventi;
- amicizie;
- inviti;
- introduzioni;
- conflitti.

### Vita nella nuova città

- casa;
- vicini;
- palestra;
- ristoranti;
- servizi;
- viaggio.

---

# 28. Roadmap

## Fase 0 – Prototype

Obiettivo: validare la conversazione con memoria.

Funzionalità:

- chat;
- tre NPC;
- memoria;
- una storyline;
- feedback linguistico.

## Fase 1 – MVP

Obiettivo: validare la vita persistente.

Funzionalità:

- città;
- mappa;
- dodici NPC;
- voce;
- relazioni;
- calendario;
- tre storyline;
- curriculum.

## Fase 2 – Engagement

Obiettivo: aumentare retention.

Funzionalità:

- mondo offline;
- messaggi;
- eventi;
- achievement;
- replay;
- notifiche;
- personalizzazione maggiore.

## Fase 3 – Platform

Obiettivo: supportare vite diverse.

Funzionalità:

- più città;
- più professioni;
- creator tools;
- storyline configurabili;
- lingue aggiuntive.

## Fase 4 – Social

Da valutare solo successivamente:

- mondi condivisi;
- eventi con altri utenti;
- gruppi;
- roleplay cooperativo;
- tutor umani;
- marketplace di vite.

---

# 29. Metriche

## 29.1 North Star Metric

**Numero di conversazioni significative completate per utente attivo ogni settimana.**

Una conversazione è significativa se:

- dura almeno un numero minimo di turni;
- contiene produzione attiva;
- contribuisce alla storia;
- aggiorna una competenza.

## 29.2 Metriche di engagement

- retention D1, D7, D30;
- sessioni settimanali;
- durata media;
- scene completate;
- ritorno dopo notifiche;
- personaggi ricontattati;
- storyline continuate.

## 29.3 Metriche linguistiche

- parole prodotte;
- riduzione degli errori;
- fluidità;
- parole consolidate;
- strutture utilizzate spontaneamente;
- miglioramento della comprensione;
- avanzamento CEFR stimato.

## 29.4 Metriche narrative

- relazioni sviluppate;
- percentuale di storyline completate;
- varietà delle scene;
- coerenza percepita;
- coinvolgimento emotivo;
- interesse verso gli NPC.

## 29.5 Metriche economiche

- conversione trial;
- costo AI per utente;
- margine lordo;
- churn;
- lifetime value;
- costo per sessione.

---

# 30. Modello di business

## 30.1 Free

- numero limitato di scene;
- solo testo;
- memoria ridotta;
- una vita;
- feedback base.

## 30.2 Premium

- conversazioni vocali;
- memoria completa;
- scene illimitate con fair use;
- statistiche;
- più storyline;
- personalizzazione.

## 30.3 Pro

Per professionisti:

- business life;
- negoziazione;
- leadership;
- presentazioni;
- colloqui;
- vocabolario professionale;
- report avanzati.

## 30.4 B2B

Per aziende:

- percorsi per ruoli;
- scenari aziendali;
- dashboard HR;
- valutazioni;
- soft skills;
- roleplay personalizzati;
- gestione dei team.

---

# 31. Rischi principali

## 31.1 Incoerenza narrativa

Mitigazione:

- stato strutturato;
- fact validation;
- memoria selettiva;
- test automatici;
- riepiloghi canonici.

## 31.2 Costi AI elevati

Mitigazione:

- routing tra modelli;
- limiti;
- caching;
- sintesi;
- architettura modulare.

## 31.3 Conversazioni lente

Mitigazione:

- streaming;
- preparazione anticipata della scena;
- TTS rapido;
- modelli a bassa latenza;
- risposte più brevi.

## 31.4 Esperienza dispersiva

Mitigazione:

- Today screen;
- massimo tre priorità;
- missioni chiare;
- suggerimenti;
- onboarding guidato.

## 31.5 Il gioco prevale sull’apprendimento

Mitigazione:

- learning objectives obbligatori;
- valutazione continua;
- ripetizione;
- debrief;
- curriculum.

## 31.6 L’apprendimento rovina il gioco

Mitigazione:

- correzioni limitate;
- tutor opzionale;
- curriculum invisibile;
- feedback post-scena.

---

# 32. Criteri di accettazione dell’MVP

L’MVP è accettabile quando:

1. l’utente crea il proprio personaggio;
2. seleziona una vita;
3. entra nel mondo;
4. incontra almeno tre NPC;
5. ogni NPC ricorda fatti specifici;
6. le relazioni cambiano;
7. le scene producono conseguenze;
8. una scelta modifica una scena successiva;
9. il sistema rileva errori linguistici;
10. il sistema produce un debrief utile;
11. una parola target riappare in una scena futura;
12. il mondo presenta nuovi eventi al ritorno;
13. l’utente può vedere persone e luoghi conosciuti;
14. l’utente può cancellare o correggere memorie;
15. le risposte vocali hanno una latenza accettabile;
16. non vengono creati fatti in contraddizione con lo stato canonico;
17. i costi per sessione sono misurati;
18. gli errori applicativi sono tracciati;
19. le scene possono essere riprodotte nei test;
20. esiste una suite minima di test automatici.

---

# 33. Test fondamentali

## 33.1 Test memoria

- un NPC ricorda un nome;
- un NPC ricorda una promessa;
- un NPC non conosce un fatto mai condiviso;
- un fatto corretto sostituisce quello precedente;
- una preferenza ritorna in una scena futura.

## 33.2 Test narrativa

- una decisione apre una storyline;
- una decisione chiude un’opportunità;
- un evento non si ripete impropriamente;
- un personaggio non appare in due luoghi incompatibili;
- una scena rispetta il calendario.

## 33.3 Test linguistici

- riconoscimento di errore grammaticale;
- riconoscimento di errore lessicale;
- feedback non eccessivo;
- aggiornamento mastery;
- ripetizione pianificata.

## 33.4 Test sicurezza

- contenuti dannosi;
- richieste illegali;
- dati personali;
- minori;
- manipolazione emotiva;
- consigli medici.

---

# 34. Backoffice

Il team deve poter:

- creare mondi;
- creare NPC;
- modificare personalità;
- creare luoghi;
- definire storyline;
- impostare eventi;
- assegnare obiettivi linguistici;
- vedere conversazioni anonimizzate;
- correggere errori narrativi;
- sospendere contenuti;
- analizzare costi;
- analizzare retention;
- eseguire simulazioni.

---

# 35. Strumenti per autori

In una fase successiva deve esistere un editor visuale.

## 35.1 Storyline editor

Permette di definire:

- trigger;
- personaggi;
- condizioni;
- scene;
- esiti;
- ramificazioni;
- obiettivi educativi.

## 35.2 NPC editor

Permette di definire:

- background;
- personalità;
- obiettivi;
- voce;
- conoscenze;
- segreti;
- arco narrativo.

## 35.3 World editor

Permette di creare:

- città;
- quartieri;
- luoghi;
- orari;
- attività;
- eventi.

---

# 36. Esempio di esperienza

## Giorno 1

L’utente arriva a New York.

Deve:

- prendere un taxi;
- raggiungere l’appartamento;
- parlare con il proprietario;
- capire alcune regole della casa.

Competenze allenate:

- presentarsi;
- chiedere chiarimenti;
- comprendere indicazioni;
- usare il present simple.

## Giorno 2

Va al bar.

Conosce Maya, la barista.

Scopre che nel locale si terrà un evento per imprenditori.

Competenze:

- ordinare;
- small talk;
- fare domande;
- parlare del proprio lavoro.

## Giorno 3

Partecipa all’evento.

Conosce Sarah, investitrice.

Sarah chiede:

> “What makes your business different from the others?”

L’utente deve spiegare il progetto.

Competenze:

- descrivere;
- persuadere;
- comparativi;
- business vocabulary.

## Giorno 5

Sarah invia un messaggio:

> “I’ve been thinking about what you said. Would you be available for coffee?”

La storia riprende la conversazione precedente.

## Giorno 8

Il proprietario dell’appartamento segnala un problema.

Maya incontra l’utente e chiede come sia andato l’incontro con Sarah.

Un collaboratore chiede un aumento.

Le storyline iniziano a intrecciarsi.

---

# 37. Elementi che rendono il prodotto unico

## 37.1 Network graph vivente

L’utente vede il proprio network:

- chi conosce chi;
- chi si fida di lui;
- chi può introdurlo a qualcuno;
- chi ha conflitti;
- chi ricorda qualcosa.

## 37.2 Language DNA

Il sistema costruisce una rappresentazione personale del modo di parlare dell’utente:

- parole utilizzate;
- strutture evitate;
- errori;
- velocità;
- sicurezza;
- registro;
- ambiti forti e deboli.

## 37.3 Narrative spaced repetition

Il ripasso non avviene con flashcard isolate.

Avviene attraverso il ritorno di:

- persone;
- temi;
- promesse;
- parole;
- situazioni.

## 37.4 Consequence-based learning

La lingua produce risultati.

Una spiegazione chiara può:

- convincere un cliente;
- evitare un conflitto;
- ottenere un aiuto;
- migliorare una relazione.

## 37.5 Personal world model

Ogni utente possiede un mondo diverso.

Non soltanto perché riceve dialoghi differenti, ma perché:

- incontra persone diverse;
- prende decisioni;
- crea relazioni;
- apre storyline;
- frequenta luoghi;
- sviluppa una reputazione.

---

# 38. Non-obiettivi dell’MVP

L’MVP non deve includere:

- grafica 3D;
- mondo multiplayer;
- centinaia di città;
- simulazione economica complessa;
- avatar fotorealistici animati;
- realtà virtuale;
- contenuti generati senza controllo;
- marketplace;
- social network;
- generazione video in tempo reale.

Il prodotto deve prima dimostrare che:

- memoria;
- relazioni;
- storia;
- apprendimento

funzionano insieme.

---

# 39. Prima milestone richiesta all’agente di sviluppo

L’agente deve realizzare un vertical slice composto da:

1. autenticazione;
2. onboarding;
3. selezione della vita;
4. schermata Today;
5. tre NPC;
6. quattro luoghi;
7. una storyline;
8. conversazione testuale;
9. memoria strutturata;
10. relazione utente-NPC;
11. analisi linguistica;
12. debrief;
13. dashboard base;
14. test automatici;
15. logging dei costi AI.

## Scenario del vertical slice

L’utente:

1. arriva in città;
2. parla con il proprietario di casa;
3. visita un bar;
4. conosce la barista;
5. riceve un invito a un evento;
6. partecipa all’evento;
7. incontra un potenziale cliente;
8. riceve un messaggio il giorno successivo;
9. scopre che le persone ricordano ciò che ha detto;
10. vede il proprio progresso linguistico.

---

# 40. Deliverable richiesti al team tecnico

Prima di iniziare il coding, produrre:

- diagramma architetturale;
- schema ER;
- ADR principali;
- API specification;
- data model;
- schema degli eventi;
- prompt templates;
- piano dei test;
- modello di costo;
- piano di deployment;
- struttura repository;
- backlog.

Al termine del vertical slice:

- codice sorgente;
- README;
- istruzioni di installazione;
- variabili ambiente di esempio;
- migrazioni database;
- seed data;
- test;
- documentazione API;
- demo flow;
- elenco dei limiti;
- backlog successivo.

---

# 41. Prompt operativo per Codex o Claude Code

Agisci come un team composto da:

- product architect;
- senior full-stack engineer;
- AI engineer;
- game systems designer;
- learning experience designer;
- database architect;
- QA engineer;
- security engineer.

Analizza integralmente la specifica LifeLang.

Non iniziare immediatamente a scrivere tutte le funzionalità.

Procedi nel seguente ordine:

1. riassumi la soluzione;
2. individua assunzioni e aree ambigue;
3. proponi l’architettura;
4. definisci il vertical slice;
5. crea la struttura del repository;
6. definisci lo schema dati;
7. definisci gli endpoint;
8. definisci i servizi AI;
9. definisci gli output JSON;
10. prepara il backlog;
11. implementa la prima milestone;
12. aggiungi test;
13. documenta come eseguire il progetto.

Vincoli:

- usare TypeScript ovunque possibile;
- mantenere separato il dominio dalla logica AI;
- non utilizzare il modello linguistico come database;
- non inviare l’intero storico al modello;
- usare memoria strutturata e retrieval;
- validare tutti gli output AI;
- rendere sostituibile il provider LLM;
- tracciare token, costi e latenza;
- non inserire segreti nel repository;
- prevedere cancellazione e correzione delle memorie;
- utilizzare feature flag;
- evitare dipendenze inutili;
- implementare logging e gestione degli errori;
- scrivere test per memoria e coerenza narrativa.

Quando un requisito è troppo ampio per la prima milestone:

- non ignorarlo;
- inserirlo nel backlog;
- predisporre l’architettura per supportarlo;
- dichiarare esplicitamente cosa è stato rinviato.

La priorità assoluta è dimostrare questo ciclo:

> Conversazione → memoria → conseguenza → nuova scena coerente → apprendimento.

Il progetto non può considerarsi riuscito se produce soltanto una chat con un prompt elaborato.

Deve esistere uno stato applicativo persistente, verificabile e modificabile.

---

# 42. Definizione finale del prodotto

LifeLang non è:

- un chatbot;
- un corso;
- un catalogo di roleplay;
- un videogioco tradizionale;
- un simulatore puramente narrativo.

LifeLang è:

> Un sistema di apprendimento linguistico basato su una vita virtuale persistente, nella quale persone, luoghi, relazioni ed eventi evolvono nel tempo e ogni conversazione contribuisce contemporaneamente alla storia dell’utente e alla sua padronanza della lingua.

Il vantaggio competitivo non dipende soltanto dalla qualità del modello AI.

Dipende dall’unione di cinque sistemi:

1. motore narrativo;
2. memoria persistente;
3. simulazione sociale;
4. curriculum linguistico adattivo;
5. interazione vocale naturale.

Questi cinque sistemi devono essere progettati come componenti distinti ma coordinati.

Il prodotto deve dare all’utente la sensazione che il proprio mondo lo ricordi, reagisca alle sue scelte e continui a esistere nel tempo.

L’inglese diventa così non qualcosa da studiare, ma qualcosa da vivere.