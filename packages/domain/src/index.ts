import type { SceneAI } from "@lifelang/ai";
import type { DomainEvent, ProposedCommand } from "@lifelang/contracts";

export type NavigationSection = "today" | "world" | "people" | "journey" | "english" | "settings";

export type DemoMessage = {
  id: string;
  speaker: "npc" | "player";
  content: string;
  at: string;
};

export type DemoMemory = {
  id: string;
  ownerId: string;
  type: "fact" | "promise" | "preference";
  content: string;
  evidence: string;
  confidence: number;
  status: "active" | "contested" | "superseded" | "deleted";
  version: number;
};

export type DemoState = {
  schemaVersion: 1;
  onboarded: boolean;
  player: { id: string; name: string; level: "A2" | "B1" | "B2"; mode: "assisted" | "immersive" };
  world: {
    id: string;
    date: string;
    dayNumber: number;
    locationId: string;
    weather: string;
  };
  scene: {
    id: string;
    status: "available" | "active" | "completed";
    version: number;
    turnNumber: number;
    messages: DemoMessage[];
    outcome?: string;
  };
  relationship: { npcId: string; trust: number; affinity: number; respect: number; familiarity: number; tension: number };
  storyline: { id: string; stage: "arrival" | "settled_in" | "cafe_invitation" | "network_event"; progress: number };
  memories: DemoMemory[];
  events: DomainEvent[];
  usage: { inputTokens: number; outputTokens: number; latencyMs: number; estimatedCostUsd: number; calls: number };
  learning: {
    cefr: "B1";
    confidence: number;
    vocabulary: number;
    grammar: number;
    fluency: number;
    recognitionScore: number;
    productionScore: number;
    targetPhrase: string;
    debrief?: {
      success: string;
      improvements: { original: string; suggestion: string; explanation: string }[];
      newExpression: string;
    };
  };
};

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const event = (
  state: DemoState,
  type: DomainEvent["type"],
  actor: DomainEvent["actor"],
  payload: Record<string, unknown>,
  key: string
): DomainEvent => ({
  id: id("evt"),
  worldId: state.world.id,
  type,
  schemaVersion: 1,
  actor,
  payload,
  occurredAt: new Date().toISOString(),
  correlationId: `scene:${state.scene.id}`,
  idempotencyKey: key
});

export const createDemoState = (): DemoState => ({
  schemaVersion: 1,
  onboarded: false,
  player: { id: "player-demo", name: "Daniele", level: "B1", mode: "assisted" },
  world: {
    id: "world-new-york-01",
    date: "2026-09-08T08:40:00-04:00",
    dayNumber: 1,
    locationId: "location-apartment",
    weather: "18° · Clear after rain"
  },
  scene: { id: "scene-house-rules", status: "available", version: 1, turnNumber: 0, messages: [] },
  relationship: { npcId: "npc-arthur", trust: 28, affinity: 34, respect: 36, familiarity: 12, tension: 4 },
  storyline: { id: "story-new-beginnings", stage: "arrival", progress: 8 },
  memories: [],
  events: [],
  usage: { inputTokens: 0, outputTokens: 0, latencyMs: 0, estimatedCostUsd: 0, calls: 0 },
  learning: {
    cefr: "B1",
    confidence: 42,
    vocabulary: 48,
    grammar: 51,
    fluency: 39,
    recognitionScore: 35,
    productionScore: 10,
    targetPhrase: "Can I count on you?"
  }
});

export const completeOnboarding = (
  state: DemoState,
  profile: Pick<DemoState["player"], "name" | "level" | "mode">
): DemoState => ({ ...state, onboarded: true, player: { ...state.player, ...profile } });

export const startScene = (state: DemoState): DemoState => {
  if (state.scene.status !== "available") return state;
  const openedAt = new Date().toISOString();
  return {
    ...state,
    scene: {
      ...state.scene,
      status: "active",
      version: state.scene.version + 1,
      messages: [{
        id: id("msg"),
        speaker: "npc",
        content: `Welcome to Hudson House, ${state.player.name}. You made good time from the airport. How was the journey?`,
        at: openedAt
      }]
    },
    events: [...state.events, event(state, "SCENE_STARTED", { type: "player", id: state.player.id }, { sceneId: state.scene.id }, `start:${state.scene.id}`)]
  };
};

const applyCommand = (state: DemoState, command: ProposedCommand, evidence: string): DemoState => {
  if (command.type === "record_fact") {
    if (command.confidence < 0.8 || command.evidence !== evidence) return state;
    const duplicate = state.memories.some((memory) => memory.status === "active" && memory.content.includes("quiet hours"));
    if (duplicate) return state;
    const memory: DemoMemory = {
      id: id("memory"),
      ownerId: "npc-arthur",
      type: "promise",
      content: "You promised Arthur to respect the building's quiet hours.",
      evidence,
      confidence: command.confidence,
      status: "active",
      version: 1
    };
    return {
      ...state,
      memories: [...state.memories, memory],
      events: [
        ...state.events,
        event(state, "FACT_DISCOVERED", { type: "player", id: state.player.id }, { memoryId: memory.id }, `fact:${memory.id}`),
        event(state, "MEMORY_CREATED", { type: "system" }, { memoryId: memory.id, ownerId: memory.ownerId }, `memory:${memory.id}`)
      ]
    };
  }

  if (command.type === "adjust_relationship") {
    const current = state.relationship[command.dimension];
    return {
      ...state,
      relationship: { ...state.relationship, [command.dimension]: Math.max(0, Math.min(100, current + command.delta)) },
      events: [...state.events, event(state, "RELATIONSHIP_CHANGED", { type: "system" }, { dimension: command.dimension, delta: command.delta }, `relationship:${state.scene.id}:${state.scene.turnNumber}:${command.dimension}`)]
    };
  }

  if (command.type === "advance_storyline") {
    const allowed = state.storyline.stage === "arrival" && command.toStage === "settled_in";
    if (!allowed) return state;
    return {
      ...state,
      storyline: { ...state.storyline, stage: command.toStage, progress: 24 },
      events: [...state.events, event(state, "STORYLINE_ADVANCED", { type: "system" }, { from: "arrival", to: command.toStage }, `story:${state.storyline.id}:${command.toStage}`)]
    };
  }
  return state;
};

export const submitTurn = async (state: DemoState, content: string, ai: SceneAI): Promise<DemoState> => {
  if (state.scene.status !== "active") throw new Error("The scene is not active.");
  const normalized = content.trim();
  if (!normalized) throw new Error("Write a message before sending.");

  const nextTurnNumber = state.scene.turnNumber + 1;
  const at = new Date().toISOString();
  let next: DemoState = {
    ...state,
    scene: {
      ...state.scene,
      turnNumber: nextTurnNumber,
      messages: [...state.scene.messages, { id: id("msg"), speaker: "player", content: normalized, at }]
    },
    events: [...state.events, event(state, "USER_SPOKE", { type: "player", id: state.player.id }, { contentLength: normalized.length }, `user:${state.scene.id}:${nextTurnNumber}`)]
  };

  const authorizedFacts = next.memories
    .filter((memory) => memory.ownerId === "npc-arthur" && memory.status === "active")
    .map((memory) => memory.content);
  const measured = await ai.respond({ content: normalized, turnNumber: nextTurnNumber, npcId: "npc-arthur", authorizedFacts });

  next = {
    ...next,
    scene: {
      ...next.scene,
      messages: [...next.scene.messages, { id: id("msg"), speaker: "npc", content: measured.turn.utterance, at: new Date().toISOString() }]
    },
    usage: {
      inputTokens: next.usage.inputTokens + measured.usage.inputTokens,
      outputTokens: next.usage.outputTokens + measured.usage.outputTokens,
      latencyMs: next.usage.latencyMs + measured.usage.latencyMs,
      estimatedCostUsd: next.usage.estimatedCostUsd + measured.usage.estimatedCostUsd,
      calls: next.usage.calls + 1
    },
    events: [...next.events, event(next, "NPC_RESPONDED", { type: "npc", id: "npc-arthur" }, { sceneStatus: measured.turn.sceneStatus }, `npc:${next.scene.id}:${nextTurnNumber}`)]
  };

  for (const command of measured.turn.proposedCommands) next = applyCommand(next, command, normalized);
  return next;
};

export const completeScene = (state: DemoState): DemoState => {
  if (state.scene.status !== "active" || state.memories.length === 0) return state;
  return {
    ...state,
    scene: {
      ...state.scene,
      status: "completed",
      version: state.scene.version + 1,
      outcome: "Arthur trusts you with the apartment and leaves you the spare key."
    },
    world: { ...state.world, date: "2026-09-08T09:05:00-04:00" },
    learning: {
      ...state.learning,
      confidence: 47,
      fluency: 42,
      recognitionScore: 51,
      productionScore: 26,
      debrief: {
        success: "You understood the house rule and made a clear commitment.",
        improvements: [{
          original: "I will respect the silence time.",
          suggestion: "I'll respect the quiet hours.",
          explanation: "“Quiet hours” is the natural fixed expression for a building rule."
        }],
        newExpression: "You can count on me."
      }
    },
    events: [
      ...state.events,
      event(state, "SCENE_COMPLETED", { type: "player", id: state.player.id }, { outcome: "promise_kept" }, `complete:${state.scene.id}`),
      event(state, "LEARNING_OBJECTIVE_UPDATED", { type: "system" }, { productionScore: 26 }, `learning:${state.scene.id}`),
      event(state, "MESSAGE_RECEIVED", { type: "npc", id: "npc-maya" }, { preview: "Coffee on the house for new neighbors." }, `message:maya:welcome`)
    ]
  };
};

export const correctMemory = (state: DemoState, memoryId: string, content: string): DemoState => {
  const current = state.memories.find((memory) => memory.id === memoryId && memory.status === "active");
  if (!current) return state;
  const replacement: DemoMemory = { ...current, id: id("memory"), content: content.trim(), version: current.version + 1 };
  return {
    ...state,
    memories: state.memories.map((memory): DemoMemory => memory.id === memoryId ? { ...memory, status: "superseded" } : memory).concat(replacement),
    events: [...state.events, event(state, "MEMORY_CORRECTED", { type: "player", id: state.player.id }, { previousId: memoryId, replacementId: replacement.id }, `correct:${memoryId}:${replacement.version}`)]
  };
};
