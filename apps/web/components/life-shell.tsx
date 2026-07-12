"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DeterministicSceneAI } from "@lifelang/ai";
import {
  completeOnboarding,
  completeScene,
  correctMemory,
  createDemoState,
  startScene,
  submitTurn,
  type DemoState,
  type NavigationSection
} from "@lifelang/domain";
import {
  ArrowIcon,
  BrainIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  EnglishIcon,
  JourneyIcon,
  MapIcon,
  MessageIcon,
  PeopleIcon,
  PinIcon,
  ResetIcon,
  SettingsIcon,
  SendIcon,
  SparkIcon,
  SunIcon
} from "./icons";

const STORAGE_KEY = "lifelang-demo-state:v1";
const ai = new DeterministicSceneAI();
type PersistenceMode = "loading" | "neon" | "fallback";
type AISettings = {
  requestedProvider: "deterministic" | "vercel-gateway";
  activeAdapter: "deterministic" | "vercel-gateway";
  selectedModel: { id: string; creator: string; purpose: string };
  gateways: Array<{
    id: "vercel-ai-gateway";
    name: string;
    baseUrl: string;
    configured: boolean;
    authentication: "api-key" | "oidc" | "missing";
    modelCount: string;
  }>;
};

const defaultAISettings: AISettings = {
  requestedProvider: "vercel-gateway",
  activeAdapter: "deterministic",
  selectedModel: {
    id: "openai/gpt-5.4-mini",
    creator: "openai",
    purpose: "NPC dialogue and structured scene commands"
  },
  gateways: [{
    id: "vercel-ai-gateway",
    name: "Vercel AI Gateway",
    baseUrl: "https://ai-gateway.vercel.sh/v1",
    configured: false,
    authentication: "missing",
    modelCount: "200+ models"
  }]
};

const navItems: { id: NavigationSection; label: string; icon: typeof SunIcon }[] = [
  { id: "today", label: "Today", icon: SunIcon },
  { id: "world", label: "World", icon: MapIcon },
  { id: "people", label: "People", icon: PeopleIcon },
  { id: "journey", label: "Journey", icon: JourneyIcon },
  { id: "english", label: "English", icon: EnglishIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];

const locations = [
  { id: "apartment", name: "Hudson House", type: "Home", x: "18%", y: "31%", note: "You are here", open: true },
  { id: "cafe", name: "Northstar Café", type: "Coffee", x: "57%", y: "22%", note: "Maya is working", open: true },
  { id: "studio", name: "Canal Works", type: "Workspace", x: "68%", y: "63%", note: "Visit tomorrow", open: true },
  { id: "park", name: "Riverside Green", type: "Park", x: "28%", y: "72%", note: "8 min walk", open: true }
];

const people = [
  { id: "arthur", initials: "AB", name: "Arthur Bennett", role: "Landlord", place: "Hudson House", tone: "umber", status: "Just met" },
  { id: "maya", initials: "MC", name: "Maya Chen", role: "Barista · Photographer", place: "Northstar Café", tone: "sage", status: "Not met yet" },
  { id: "marcus", initials: "MR", name: "Marcus Reed", role: "Retail founder", place: "Canal Works", tone: "blue", status: "Locked" }
];

const safelyLoadState = (): DemoState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoState;
    return parsed.schemaVersion === 1 ? parsed : null;
  } catch {
    return null;
  }
};

async function requestState(path: string, options?: {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
}) {
  const method = options?.method ?? "GET";
  const response = await fetch(path, {
    method,
    cache: "no-store",
    ...(method === "GET"
      ? {}
      : { headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID()
        } }),
    ...(options?.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    ...(options?.signal ? { signal: options.signal } : {})
  });
  if (!response.ok) throw new Error(`LifeLang API returned ${response.status}.`);
  return response.json() as Promise<DemoState>;
}

async function requestAISettings(signal?: AbortSignal) {
  const response = await fetch("/api/settings/ai", {
    cache: "no-store",
    ...(signal ? { signal } : {})
  });
  if (!response.ok) throw new Error(`AI settings API returned ${response.status}.`);
  return response.json() as Promise<AISettings>;
}

export function LifeShell() {
  const [state, setState] = useState<DemoState>(() => createDemoState());
  const [section, setSection] = useState<NavigationSection>("today");
  const [sceneOpen, setSceneOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [persistence, setPersistence] = useState<PersistenceMode>("loading");
  const [aiSettings, setAISettings] = useState<AISettings>(defaultAISettings);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = safelyLoadState();
    const controller = new AbortController();
    Promise.all([
      requestState("/api/demo-state", { signal: controller.signal }),
      requestAISettings(controller.signal)
    ])
      .then(([nextState, nextAISettings]) => {
        setState(nextState);
        setAISettings(nextAISettings);
        setPersistence("neon");
      })
      .catch(() => {
        if (stored) setState(stored);
        setPersistence("fallback");
      })
      .finally(() => setHydrated(true));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const beginScene = () => {
    setSceneOpen(true);
    if (state.scene.status !== "available") return;
    startTransition(async () => {
      setSyncError(null);
      try {
        if (persistence === "neon") {
          setState(await requestState(`/api/scenes/${state.scene.id}/start`, { method: "POST" }));
        } else {
          setState((current) => startScene(current));
        }
      } catch {
        setSceneOpen(false);
        setSyncError("Neon non ha salvato l'avvio della scena. Riprova.");
      }
    });
  };

  const resetDemo = () => {
    startTransition(async () => {
      setSyncError(null);
      try {
        const reset = persistence === "neon"
          ? await requestState("/api/demo-state/reset", { method: "POST" })
          : createDemoState();
        setState(reset);
        setSection("today");
        setSceneOpen(false);
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        setSyncError("Impossibile azzerare il mondo persistente.");
      }
    });
  };

  const handleTurn = (content: string) => {
    startTransition(async () => {
      setSyncError(null);
      try {
        const next = persistence === "neon"
          ? await requestState(`/api/scenes/${state.scene.id}/turns`, { method: "POST", body: { content } })
          : await submitTurn(state, content, ai);
        setState(next);
      } catch {
        setSyncError("Il turno non è stato salvato. Il testo resta nel campo per riprovare.");
      }
    });
  };

  const finishScene = () => {
    startTransition(async () => {
      setSyncError(null);
      try {
        const next = persistence === "neon"
          ? await requestState(`/api/scenes/${state.scene.id}/complete`, { method: "POST" })
          : completeScene(state);
        setState(next);
        setSceneOpen(false);
      } catch {
        setSyncError("La scena non è stata chiusa: nessun aggiornamento parziale è stato applicato.");
      }
    });
  };

  const handleOnboarding = (profile: Pick<DemoState["player"], "name" | "level" | "mode">) => {
    startTransition(async () => {
      setSyncError(null);
      try {
        const next = persistence === "neon"
          ? await requestState("/api/profile", { method: "PATCH", body: profile })
          : completeOnboarding(state, profile);
        setState(next);
      } catch {
        setSyncError("Il profilo non è stato salvato su Neon.");
      }
    });
  };

  const handleCorrection = (memoryId: string, content: string) => {
    startTransition(async () => {
      setSyncError(null);
      try {
        const next = persistence === "neon"
          ? await requestState(`/api/memories/${memoryId}`, { method: "PATCH", body: { content } })
          : correctMemory(state, memoryId, content);
        setState(next);
      } catch {
        setSyncError("La correzione non è stata salvata.");
      }
    });
  };

  if (!hydrated) return <div className="boot-screen"><div className="brand-mark">L</div><p>Preparing your life…</p></div>;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="wordmark" type="button" onClick={() => setSection("today")} aria-label="LifeLang home">
          <span className="brand-mark">L</span>
          <span><strong>LifeLang</strong><small>Live the language</small></span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={section === item.id ? "active" : ""} type="button" onClick={() => setSection(item.id)}>
                <Icon /><span>{item.label}</span>
                {item.id === "people" && state.scene.status === "completed" ? <i>1</i> : null}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="level-stamp"><span>B1</span><div><strong>New York life</strong><small>Day {state.world.dayNumber} · Assisted</small></div></div>
          <button className="reset-button" type="button" onClick={resetDemo} disabled={isPending}><ResetIcon /> Reset demo</button>
          <div className={`demo-badge ${persistence}`}><span /> {persistence === "neon" ? "deterministic AI · Neon live" : "offline demo · local save"}</div>
        </div>
      </aside>

      <section className="content-frame">
        {syncError ? <div className="sync-error" role="alert">{syncError}</div> : null}
        {section === "today" ? <TodayView state={state} onBeginScene={beginScene} onOpenEnglish={() => setSection("english")} /> : null}
        {section === "world" ? <WorldView /> : null}
        {section === "people" ? <PeopleView state={state} /> : null}
        {section === "journey" ? <JourneyView state={state} /> : null}
        {section === "english" ? <EnglishView state={state} onCorrect={handleCorrection} /> : null}
        {section === "settings" ? <SettingsView settings={aiSettings} persistence={persistence} /> : null}
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)} type="button"><Icon /><span>{item.label}</span></button>;
        })}
      </nav>

      {state.onboarded ? null : <Onboarding state={state} persistence={persistence} onComplete={handleOnboarding} />}
      {sceneOpen ? <Conversation state={state} isPending={isPending} onClose={() => setSceneOpen(false)} onSend={handleTurn} onComplete={finishScene} /> : null}
    </main>
  );
}

function Onboarding({ state, persistence, onComplete }: { state: DemoState; persistence: PersistenceMode; onComplete: (profile: Pick<DemoState["player"], "name" | "level" | "mode">) => void }) {
  const [name, setName] = useState(state.player.name);
  const [level, setLevel] = useState<DemoState["player"]["level"]>(state.player.level);
  const [mode, setMode] = useState<DemoState["player"]["mode"]>(state.player.mode);

  return (
    <div className="onboarding-backdrop">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div className="arrival-ticket"><small>ONE WAY · JFK → MANHATTAN</small><strong>08 SEP</strong></div>
        <p className="eyebrow">Your other life starts here</p>
        <h1 id="onboarding-title">New city.<br/><em>New voice.</em></h1>
        <p className="onboarding-copy">Sei appena arrivato a New York per aprire la tua attività. Le persone che incontrerai ricorderanno quello che dici.</p>
        <label className="field-label">Come ti chiami in questa vita?<input value={name} onChange={(event) => setName(event.target.value)} maxLength={30} /></label>
        <div className="choice-row" aria-label="English level">
          {(["A2", "B1", "B2"] as const).map((item) => <button type="button" className={level === item ? "selected" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>)}
        </div>
        <div className="mode-switch">
          <button type="button" className={mode === "assisted" ? "selected" : ""} onClick={() => setMode("assisted")}><strong>Assisted</strong><small>Suggerimenti discreti</small></button>
          <button type="button" className={mode === "immersive" ? "selected" : ""} onClick={() => setMode("immersive")}><strong>Immersive</strong><small>Solo inglese</small></button>
        </div>
        <button className="primary-button full" type="button" disabled={!name.trim()} onClick={() => onComplete({ name: name.trim(), level, mode })}>Enter your life <ArrowIcon /></button>
        <p className="fineprint">Vertical slice · {persistence === "neon" ? "progresso sincronizzato su Neon" : "salvataggio locale di fallback"}</p>
      </section>
    </div>
  );
}

function TodayView({ state, onBeginScene, onOpenEnglish }: { state: DemoState; onBeginScene: () => void; onOpenEnglish: () => void }) {
  const complete = state.scene.status === "completed";
  return (
    <div className="page today-page">
      <header className="page-header stagger one">
        <div><p className="eyebrow">Tuesday, September 8 · 08:40</p><h1>Good morning, <em>{state.player.name}.</em></h1></div>
        <div className="weather"><SunIcon /><span><strong>{state.world.weather.split(" · ")[0]}</strong><small>{state.world.weather.split(" · ")[1]}</small></span></div>
      </header>

      <div className="place-line stagger two"><PinIcon /><span>Hudson House · West Village</span><i /> <span>Day one</span></div>

      <section className="priority-strip stagger three" aria-label="Today's priorities">
        <article><span className="priority-number">01</span><div><small>Now · at home</small><strong>{complete ? "Unpack and settle in" : "Meet your landlord"}</strong><p>{complete ? "The spare key is on the kitchen counter." : "Arthur is waiting by the door with the keys."}</p></div></article>
        <article><span className="priority-number">02</span><div><small>{complete ? "New message" : "10:30 · 6 min walk"}</small><strong>{complete ? "Maya from Northstar" : "Find a decent coffee"}</strong><p>{complete ? "Coffee on the house for new neighbors." : "Northstar Café is open until 6 pm."}</p></div></article>
        <article><span className="priority-number">03</span><div><small>Tomorrow · 09:00</small><strong>Visit Canal Works</strong><p>Your first possible workspace in the city.</p></div></article>
      </section>

      <div className="today-grid stagger four">
        <article className={`story-card ${complete ? "resolved" : ""}`}>
          <div className="story-art" aria-hidden="true"><div className="window-light"/><div className="skyline"><i/><i/><i/><i/><i/></div><span>WEST VILLAGE · 08:40</span></div>
          <div className="story-body">
            <div className="story-kicker"><span>{complete ? "Scene complete" : "Your next scene"}</span><small>~ 4 min · B1</small></div>
            <h2>{complete ? "A key, and a little trust" : "The house rules"}</h2>
            <p>{complete ? state.scene.outcome : "Arthur Bennett has one last thing to explain before he leaves you to unpack. First impressions have a way of lasting."}</p>
            <div className="cast-row"><Avatar initials="AB" tone="umber"/><div><strong>Arthur Bennett</strong><small>Landlord · warm, direct</small></div></div>
            {complete ? (
              <button type="button" className="primary-button" onClick={onOpenEnglish}>View your debrief <ArrowIcon /></button>
            ) : (
              <button type="button" className="primary-button" onClick={onBeginScene}>{state.scene.status === "active" ? "Continue conversation" : "Start conversation"}<ArrowIcon /></button>
            )}
          </div>
        </article>

        <aside className="day-thread">
          <div className="section-title"><div><p className="eyebrow">The day so far</p><h3>Your thread</h3></div><span>{state.events.length} events</span></div>
          <ol>
            <li className="done"><span><CheckIcon /></span><div><small>07:55</small><strong>Arrived at JFK</strong><p>A yellow cab, one suitcase, no return ticket.</p></div></li>
            <li className={state.scene.status !== "available" ? "done" : "current"}><span>{state.scene.status !== "available" ? <CheckIcon /> : <i />}</span><div><small>08:40</small><strong>Keys to Hudson House</strong><p>{complete ? "Arthur trusts you with the spare key." : "A conversation is waiting."}</p></div></li>
            <li className={complete ? "current" : "future"}><span>{complete ? <MessageIcon /> : <i />}</span><div><small>{complete ? "Just now" : "Later"}</small><strong>{complete ? "A message from Maya" : "The city opens up"}</strong><p>{complete ? "“Welcome to the neighborhood. Coffee?”" : "What happens next depends on what you say."}</p></div></li>
          </ol>
          <div className="language-nudge"><SparkIcon/><div><small>Language thread</small><strong>Making a clear promise</strong><p>Listen for: <em>“Can I count on you?”</em></p></div></div>
        </aside>
      </div>
    </div>
  );
}

function WorldView() {
  return (
    <div className="page inner-page">
      <header className="page-header"><div><p className="eyebrow">Your New York</p><h1>A city learned<br/><em>one place at a time.</em></h1></div><div className="map-legend"><span><i className="known"/>Known</span><span><i className="next"/>Next</span></div></header>
      <section className="world-layout">
        <div className="map-canvas">
          <div className="river">HUDSON RIVER</div><div className="street s1"/><div className="street s2"/><div className="street s3"/><div className="street s4"/>
          {locations.map((location, index) => <button type="button" className={`map-pin pin-${index}`} style={{ left: location.x, top: location.y }} key={location.id}><span>{index + 1}</span><div><strong>{location.name}</strong><small>{location.note}</small></div></button>)}
          <div className="map-caption">MANHATTAN · WEST SIDE</div>
        </div>
        <div className="location-list">
          <div className="section-title"><div><p className="eyebrow">4 places</p><h3>Within reach</h3></div></div>
          {locations.map((location, index) => <article key={location.id}><span>0{index + 1}</span><div><small>{location.type}</small><strong>{location.name}</strong><p>{location.note}</p></div><ArrowIcon /></article>)}
        </div>
      </section>
    </div>
  );
}

function PeopleView({ state }: { state: DemoState }) {
  return (
    <div className="page inner-page">
      <header className="page-header"><div><p className="eyebrow">Your living network</p><h1>People remember<br/><em>how you made them feel.</em></h1></div><div className="network-count"><strong>3</strong><span>people in<br/>your orbit</span></div></header>
      <div className="people-grid">
        {people.map((person, index) => {
          const isArthur = person.id === "arthur";
          const unlocked = isArthur || state.scene.status === "completed" || index === 1;
          return <article key={person.id} className={unlocked ? "" : "locked"}><div className="person-top"><Avatar initials={person.initials} tone={person.tone}/><span>{unlocked ? person.status : "Not yet known"}</span></div><small>{person.role}</small><h2>{person.name}</h2><p><PinIcon /> {person.place}</p>{isArthur ? <div className="relation-bars"><Meter label="Trust" value={state.relationship.trust}/><Meter label="Familiarity" value={state.relationship.familiarity}/></div> : <div className="unknown-note">Their story has not crossed yours yet.</div>}<button type="button">Open profile <ArrowIcon /></button></article>;
        })}
      </div>
      <section className="memory-note"><BrainIcon/><div><p className="eyebrow">Knowledge boundary</p><h3>Not everyone knows everything.</h3><p>Arthur can remember only what you shared with him. Maya and Marcus receive their own authorized memories.</p></div><span>{state.memories.filter((memory) => memory.status === "active").length} active facts</span></section>
    </div>
  );
}

function JourneyView({ state }: { state: DemoState }) {
  const completed = state.scene.status === "completed";
  return (
    <div className="page inner-page journey-page">
      <header className="page-header"><div><p className="eyebrow">New beginnings · Chapter one</p><h1>The story changes<br/><em>when you speak.</em></h1></div><div className="chapter-progress"><strong>{state.storyline.progress}%</strong><span>chapter<br/>complete</span></div></header>
      <section className="journey-track">
        <div className="chapter-line"/>
        <article className="complete"><span>01</span><div><small>ARRIVAL</small><h2>One suitcase, a whole city</h2><p>You arrived at JFK and took a cab downtown.</p></div></article>
        <article className={completed ? "complete" : "active"}><span>02</span><div><small>HUDSON HOUSE</small><h2>The house rules</h2><p>{completed ? "You earned Arthur's first measure of trust." : "A first promise can define a relationship."}</p></div></article>
        <article className={completed ? "active" : "locked"}><span>03</span><div><small>NORTHSTAR CAFÉ</small><h2>Coffee, then an invitation</h2><p>{completed ? "Maya has sent you a welcome message." : "Complete the current scene to reveal this thread."}</p></div></article>
        <article className="locked"><span>04</span><div><small>UNKNOWN</small><h2>A room full of strangers</h2><p>Your network begins with one introduction.</p></div></article>
      </section>
    </div>
  );
}

function EnglishView({ state, onCorrect }: { state: DemoState; onCorrect: (memoryId: string, content: string) => void }) {
  const activeMemories = state.memories.filter((memory) => memory.status === "active");
  return (
    <div className="page inner-page english-page">
      <header className="page-header"><div><p className="eyebrow">Your Language DNA</p><h1>English shaped by<br/><em>the life you live.</em></h1></div><div className="cefr-seal"><strong>{state.learning.cefr}</strong><small>estimated</small></div></header>
      <div className="english-grid">
        <section className="skill-card"><div className="section-title"><div><p className="eyebrow">Current signal</p><h3>Your voice</h3></div><span>Day 1</span></div><div className="skill-radar"><div className="radar-shape"/><span className="r1">Vocabulary</span><span className="r2">Grammar</span><span className="r3">Fluency</span><span className="r4">Confidence</span></div><div className="skill-meters"><Meter label="Vocabulary" value={state.learning.vocabulary}/><Meter label="Grammar" value={state.learning.grammar}/><Meter label="Fluency" value={state.learning.fluency}/><Meter label="Confidence" value={state.learning.confidence}/></div></section>
        <section className="debrief-card">
          <div className="section-title"><div><p className="eyebrow">Latest scene</p><h3>Debrief</h3></div>{state.learning.debrief ? <span className="success-pill"><CheckIcon/> complete</span> : null}</div>
          {state.learning.debrief ? <><p className="success-copy">{state.learning.debrief.success}</p>{state.learning.debrief.improvements.map((item) => <div className="correction" key={item.original}><small>A more natural way</small><del>{item.original}</del><strong>{item.suggestion}</strong><p>{item.explanation}</p></div>)}<div className="new-expression"><SparkIcon/><div><small>Keep this</small><strong>“{state.learning.debrief.newExpression}”</strong></div></div></> : <div className="empty-debrief"><EnglishIcon/><h3>Live a scene first.</h3><p>Your feedback will stay short, specific and tied to what you actually said.</p></div>}
        </section>
      </div>
      <section className="memory-vault"><div className="section-title"><div><p className="eyebrow">What your world remembers</p><h3>Memory vault</h3></div><span>{activeMemories.length} active</span></div>{activeMemories.length ? activeMemories.map((memory) => <MemoryRow key={memory.id} memory={memory} onCorrect={onCorrect}/>) : <div className="empty-memory"><BrainIcon/><p>No personal memories yet. Facts appear here only after a supported conversation.</p></div>}</section>
      <section className="learning-item"><div><small>Invisible repetition · target item</small><strong>Can I count on you?</strong><p>Recognition {state.learning.recognitionScore}% · Production {state.learning.productionScore}%</p></div><div className="split-meter"><i style={{ width: `${state.learning.recognitionScore}%` }}/><i style={{ width: `${state.learning.productionScore}%` }}/></div></section>
    </div>
  );
}

function SettingsView({ settings, persistence }: { settings: AISettings; persistence: PersistenceMode }) {
  const gateway = settings.gateways[0];
  if (!gateway) return null;
  const gatewayActive = settings.activeAdapter === "vercel-gateway";
  const modelLabel = settings.selectedModel.id.split("/").slice(1).join("/");
  const authLabel = gateway.authentication === "api-key"
    ? "API key"
    : gateway.authentication === "oidc"
      ? "Vercel OIDC"
      : "Not configured";

  return (
    <div className="page inner-page settings-page">
      <header className="page-header">
        <div><p className="eyebrow">System room</p><h1>The engines behind<br/><em>your living world.</em></h1></div>
        <div className={`runtime-seal ${gatewayActive ? "live" : "safe"}`}><i/><strong>{gatewayActive ? "Live" : "Safe mode"}</strong><small>{gatewayActive ? "Gateway active" : "Deterministic fallback"}</small></div>
      </header>

      <section className="settings-grid">
        <article className="gateway-registry">
          <div className="section-title"><div><p className="eyebrow">Gateway registry</p><h3>Connected routes</h3></div><span>{settings.gateways.length} gateway</span></div>
          <div className="gateway-card">
            <div className="gateway-monogram">V</div>
            <div className="gateway-copy">
              <div><small>PRIMARY ROUTE</small><span className={gateway.configured ? "configured" : "waiting"}>{gateway.configured ? "Configured" : "Awaiting secret"}</span></div>
              <h2>{gateway.name}</h2>
              <p>One controlled route to models from OpenAI, Anthropic, Google and other providers.</p>
              <dl>
                <div><dt>Endpoint</dt><dd>{gateway.baseUrl}</dd></div>
                <div><dt>Authentication</dt><dd>{authLabel}</dd></div>
                <div><dt>Catalog</dt><dd>{gateway.modelCount}</dd></div>
              </dl>
            </div>
          </div>
          <div className="future-gateway"><span>02</span><div><small>Future route</small><strong>Reserved for the next gateway</strong></div><i>Not configured</i></div>
        </article>

        <article className="model-selection">
          <div className="section-title"><div><p className="eyebrow">Selected language model</p><h3>Dialogue brain</h3></div><span>{settings.selectedModel.creator}</span></div>
          <div className="model-plate">
            <span className="model-index">01 / PRIMARY</span>
            <div className="model-orbit"><i/><i/><i/><span>LLM</span></div>
            <small>MODEL ID</small>
            <h2>{modelLabel}</h2>
            <code>{settings.selectedModel.id}</code>
            <p>{settings.selectedModel.purpose}</p>
            <div className="model-state"><i className={gatewayActive ? "active" : "standby"}/><span><strong>{gatewayActive ? "Routing live turns" : "Selected · standing by"}</strong><small>{gatewayActive ? "Structured output validation enabled" : "Add AI_GATEWAY_API_KEY to activate"}</small></span></div>
          </div>
        </article>
      </section>

      <section className="execution-path">
        <div className="section-title"><div><p className="eyebrow">Runtime path</p><h3>How a turn travels</h3></div><span>{persistence === "neon" ? "Neon state online" : "Local state fallback"}</span></div>
        <div className="path-diagram">
          <div className="path-node active"><small>01 · INPUT</small><strong>Scene command</strong><span>Validated user turn</span></div>
          <ArrowIcon />
          <div className={`path-node ${gatewayActive ? "active" : "standby"}`}><small>02 · GATEWAY</small><strong>Vercel Gateway</strong><span>{gatewayActive ? "Authenticated route" : "Awaiting key"}</span></div>
          <ArrowIcon />
          <div className={`path-node ${gatewayActive ? "active" : "standby"}`}><small>03 · MODEL</small><strong>{modelLabel}</strong><span>NPCTurn@1 JSON</span></div>
          <ArrowIcon />
          <div className="path-node active"><small>04 · DOMAIN</small><strong>Rule engine</strong><span>Only valid commands persist</span></div>
        </div>
      </section>

      <section className="environment-checklist">
        <div><p className="eyebrow">Environment contract</p><h3>Server-only variables</h3><p>Values stay outside the browser and Git. Settings exposes only configuration status.</p></div>
        <ul>
          <li><code>AI_PROVIDER</code><span className="set">vercel-gateway</span></li>
          <li><code>AI_GATEWAY_API_KEY</code><span className={gateway.configured ? "set" : "missing"}>{gateway.configured ? "set · hidden" : "required"}</span></li>
          <li><code>AI_GATEWAY_MODEL</code><span className="set">set</span></li>
          <li><code>AI_GATEWAY_BASE_URL</code><span className="set">set</span></li>
          <li><code>AI_GATEWAY_TIMEOUT_MS</code><span className="set">set</span></li>
        </ul>
      </section>
    </div>
  );
}

function Conversation({ state, isPending, onClose, onSend, onComplete }: { state: DemoState; isPending: boolean; onClose: () => void; onSend: (content: string) => void; onComplete: () => void }) {
  const [draft, setDraft] = useState("");
  const ready = state.memories.some((memory) => memory.status === "active");
  const suggested = useMemo(() => state.scene.turnNumber === 0 ? "The journey was fine. I'm here to start a new business." : "You can count on me. I'll respect the quiet hours.", [state.scene.turnNumber]);

  const send = () => {
    if (!draft.trim() || isPending) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <div className="conversation-backdrop">
      <section className="conversation-panel" aria-label="Conversation with Arthur Bennett">
        <header><button type="button" onClick={onClose} aria-label="Close conversation"><CloseIcon/></button><div className="scene-person"><Avatar initials="AB" tone="umber"/><div><small>Hudson House · entryway</small><strong>Arthur Bennett</strong><span><i/> warm · attentive</span></div></div><div className="scene-goal"><small>YOUR INTENT</small><strong>Make a clear promise</strong></div></header>
        <div className="conversation-context"><ClockIcon/><span>08:43 · The suitcase is still by the door.</span><i>ASSISTED</i></div>
        <div className="messages" aria-live="polite">
          {state.scene.messages.map((message) => <div className={`message ${message.speaker}`} key={message.id}>{message.speaker === "npc" ? <Avatar initials="AB" tone="umber"/> : null}<div><small>{message.speaker === "npc" ? "Arthur" : "You"}</small><p>{message.content}</p></div></div>)}
          {isPending ? <div className="message npc thinking"><Avatar initials="AB" tone="umber"/><div><small>Arthur</small><p><i/><i/><i/></p></div></div> : null}
        </div>
        <div className="assist-row"><button type="button" onClick={() => setDraft(suggested)}><SparkIcon/> How can I say it?</button><span>Target: <em>Can I count on you?</em></span></div>
        {ready ? <div className="ready-banner"><CheckIcon/><span><strong>Promise understood.</strong> Arthur's trust changed and a memory is ready.</span><button type="button" onClick={onComplete}>Finish scene <ArrowIcon/></button></div> : <div className="composer"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Reply in English…" rows={2}/><button type="button" disabled={!draft.trim() || isPending} onClick={send} aria-label="Send message"><SendIcon/></button><small>Enter to send · Shift + Enter for a new line</small></div>}
      </section>
    </div>
  );
}

function MemoryRow({ memory, onCorrect }: { memory: DemoState["memories"][number]; onCorrect: (memoryId: string, content: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(memory.content);
  return <article className="memory-row"><span><BrainIcon/></span><div><small>PROMISE · ARTHUR KNOWS THIS · {Math.round(memory.confidence * 100)}% CONFIDENCE</small>{editing ? <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={2}/> : <strong>{memory.content}</strong>}<p>Evidence: “{memory.evidence}”</p></div>{editing ? <div className="memory-actions"><button type="button" onClick={() => { onCorrect(memory.id, content); setEditing(false); }}>Save</button><button type="button" onClick={() => setEditing(false)}>Cancel</button></div> : <button type="button" onClick={() => setEditing(true)}>Correct</button>}</article>;
}

function Meter({ label, value }: { label: string; value: number }) {
  return <div className="meter"><span><small>{label}</small><em>{value}</em></span><div><i style={{ width: `${value}%` }}/></div></div>;
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return <span className={`avatar ${tone}`} aria-hidden="true"><i/>{initials}</span>;
}
