import "server-only";

import type { DomainEvent, ProposedCommand } from "@lifelang/contracts";
import { db } from "@lifelang/db/client";
import {
  aiUsage,
  canonicalFacts,
  domainEvents,
  learnerMastery,
  learnerProfiles,
  messages,
  npcKnowledge,
  outboxEvents,
  playerCharacters,
  relationships,
  scenes,
  storylines,
  worlds
} from "@lifelang/db/schema";
import type { DemoMemory, DemoState } from "@lifelang/domain";
import { and, asc, eq, sql } from "drizzle-orm";
import { createConfiguredSceneAI } from "./ai-settings";
import { DEMO_IDS } from "./demo-ids";

export { DEMO_IDS } from "./demo-ids";

type StoredFactObject = {
  content?: string;
  evidence?: string;
  type?: DemoMemory["type"];
};

type StoredOutcome = {
  summary?: string;
  debrief?: DemoState["learning"]["debrief"];
};

const activeFactPredicate = "promised_respect_quiet_hours";

function eventInput(
  type: DomainEvent["type"],
  actor: DomainEvent["actor"],
  payload: Record<string, unknown>,
  idempotencyKey: string,
  correlationId = `scene:${DEMO_IDS.scene}`
) {
  return {
    id: crypto.randomUUID(),
    worldId: DEMO_IDS.world,
    type,
    schemaVersion: 1,
    actor,
    payload,
    occurredAt: new Date(),
    correlationId,
    idempotencyKey
  };
}

export async function loadPersistentDemoState(): Promise<DemoState> {
  const [
    profileRows,
    worldRows,
    playerRows,
    sceneRows,
    relationshipRows,
    storylineRows,
    factRows,
    messageRows,
    eventRows,
    usageRows,
    masteryRows
  ] = await Promise.all([
    db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, DEMO_IDS.user)).limit(1),
    db.select().from(worlds).where(eq(worlds.id, DEMO_IDS.world)).limit(1),
    db.select().from(playerCharacters).where(eq(playerCharacters.id, DEMO_IDS.player)).limit(1),
    db.select().from(scenes).where(eq(scenes.id, DEMO_IDS.scene)).limit(1),
    db.select().from(relationships).where(and(
      eq(relationships.worldId, DEMO_IDS.world),
      eq(relationships.npcId, DEMO_IDS.arthur)
    )).limit(1),
    db.select().from(storylines).where(eq(storylines.id, DEMO_IDS.storyline)).limit(1),
    db.select({ fact: canonicalFacts, npcId: npcKnowledge.npcId })
      .from(canonicalFacts)
      .innerJoin(npcKnowledge, eq(npcKnowledge.factId, canonicalFacts.id))
      .where(eq(canonicalFacts.worldId, DEMO_IDS.world))
      .orderBy(asc(canonicalFacts.validFrom)),
    db.select().from(messages).where(eq(messages.sceneId, DEMO_IDS.scene)).orderBy(asc(messages.createdAt)),
    db.select().from(domainEvents).where(eq(domainEvents.worldId, DEMO_IDS.world)).orderBy(asc(domainEvents.occurredAt)),
    db.select().from(aiUsage).where(eq(aiUsage.worldId, DEMO_IDS.world)),
    db.select().from(learnerMastery).where(and(
      eq(learnerMastery.userId, DEMO_IDS.user),
      eq(learnerMastery.learningItemId, DEMO_IDS.learningItem)
    )).limit(1)
  ]);

  const profile = profileRows[0];
  const world = worldRows[0];
  const player = playerRows[0];
  const scene = sceneRows[0];
  const relationship = relationshipRows[0];
  const storyline = storylineRows[0];
  if (!profile || !world || !player || !scene || !relationship || !storyline) {
    throw new Error("The LifeLang demo seed is incomplete. Run the database seed first.");
  }

  const preferences = profile.preferences as { onboarded?: boolean };
  const storylineState = storyline.state as { progress?: number };
  const outcome = (scene.outcome ?? {}) as StoredOutcome;
  const mastery = masteryRows[0];
  const totals = usageRows.reduce(
    (sum, usage) => ({
      inputTokens: sum.inputTokens + usage.inputTokens,
      outputTokens: sum.outputTokens + usage.outputTokens,
      latencyMs: sum.latencyMs + usage.latencyMs,
      estimatedCostUsd: sum.estimatedCostUsd + Number(usage.estimatedCostUsd),
      calls: sum.calls + 1
    }),
    { inputTokens: 0, outputTokens: 0, latencyMs: 0, estimatedCostUsd: 0, calls: 0 }
  );

  const status: DemoState["scene"]["status"] = scene.status === "proposed"
    ? "available"
    : scene.status === "completed"
      ? "completed"
      : "active";
  const activeMemories = factRows.map(({ fact, npcId }): DemoMemory => {
    const object = fact.object as StoredFactObject;
    return {
      id: fact.id,
      ownerId: npcId,
      type: object.type ?? "fact",
      content: object.content ?? `${fact.predicate}: ${JSON.stringify(fact.object)}`,
      evidence: object.evidence ?? "Stored canonical fact",
      confidence: Number(fact.confidence),
      status: fact.status,
      version: fact.version
    };
  });
  const persistedEvents = eventRows.map((stored): DomainEvent => ({
    id: stored.id,
    worldId: stored.worldId,
    type: stored.type as DomainEvent["type"],
    schemaVersion: 1,
    actor: stored.actor as DomainEvent["actor"],
    payload: stored.payload as Record<string, unknown>,
    occurredAt: stored.occurredAt.toISOString(),
    correlationId: stored.correlationId,
    ...(stored.causationId ? { causationId: stored.causationId } : {}),
    idempotencyKey: stored.idempotencyKey
  }));

  return {
    schemaVersion: 1,
    onboarded: preferences.onboarded ?? false,
    player: {
      id: player.id,
      name: player.name,
      level: profile.cefrLevel as DemoState["player"]["level"],
      mode: profile.preferredMode as DemoState["player"]["mode"]
    },
    world: {
      id: world.id,
      date: world.currentDate.toISOString(),
      dayNumber: 1,
      locationId: DEMO_IDS.apartment,
      weather: "18° · Clear after rain"
    },
    scene: {
      id: scene.id,
      status,
      version: scene.version,
      turnNumber: messageRows.filter((message) => message.speakerType === "player").length,
      messages: messageRows.map((message) => ({
        id: message.id,
        speaker: message.speakerType === "npc" ? "npc" : "player",
        content: message.content,
        at: message.createdAt.toISOString()
      })),
      ...(outcome.summary ? { outcome: outcome.summary } : {})
    },
    relationship: {
      npcId: relationship.npcId,
      trust: relationship.trust,
      affinity: relationship.affinity,
      respect: relationship.respect,
      familiarity: relationship.familiarity,
      tension: relationship.tension
    },
    storyline: {
      id: storyline.id,
      stage: storyline.currentStage as DemoState["storyline"]["stage"],
      progress: storylineState.progress ?? 8
    },
    memories: activeMemories,
    events: persistedEvents,
    usage: totals,
    learning: {
      cefr: "B1",
      confidence: scene.status === "completed" ? 47 : 42,
      vocabulary: 48,
      grammar: 51,
      fluency: scene.status === "completed" ? 42 : 39,
      recognitionScore: mastery?.recognitionScore ?? 35,
      productionScore: mastery?.productionScore ?? 10,
      targetPhrase: "Can I count on you?",
      ...(outcome.debrief ? { debrief: outcome.debrief } : {})
    }
  };
}

export async function updatePersistentProfile(input: {
  name: string;
  level: DemoState["player"]["level"];
  mode: DemoState["player"]["mode"];
}) {
  await db.transaction(async (tx) => {
    await tx.update(playerCharacters).set({ name: input.name }).where(eq(playerCharacters.id, DEMO_IDS.player));
    await tx.update(learnerProfiles).set({
      cefrLevel: input.level,
      preferredMode: input.mode,
      preferences: { onboarded: true }
    }).where(eq(learnerProfiles.userId, DEMO_IDS.user));
  });
  return loadPersistentDemoState();
}

export async function startPersistentScene() {
  const playerRows = await db.select({ name: playerCharacters.name })
    .from(playerCharacters)
    .where(eq(playerCharacters.id, DEMO_IDS.player))
    .limit(1);
  const playerName = playerRows[0]?.name ?? "Daniele";
  await db.transaction(async (tx) => {
    const updated = await tx.update(scenes).set({
      status: "active",
      version: sql`${scenes.version} + 1`,
      startedAt: new Date()
    }).where(and(eq(scenes.id, DEMO_IDS.scene), eq(scenes.status, "proposed"))).returning({ id: scenes.id });
    if (updated.length === 0) return;

    await tx.insert(messages).values({
      id: crypto.randomUUID(),
      worldId: DEMO_IDS.world,
      sceneId: DEMO_IDS.scene,
      speakerType: "npc",
      speakerId: DEMO_IDS.arthur,
      content: `Welcome to Hudson House, ${playerName}. You made good time from the airport. How was the journey?`
    });
    await tx.insert(domainEvents).values(eventInput(
      "SCENE_STARTED",
      { type: "player", id: DEMO_IDS.player },
      { sceneId: DEMO_IDS.scene },
      `start:${DEMO_IDS.scene}`
    )).onConflictDoNothing();
  });
  return loadPersistentDemoState();
}

async function applyProposedCommand(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  command: ProposedCommand,
  evidence: string,
  requestKey: string
) {
  if (command.type === "record_fact") {
    if (command.confidence < 0.8 || command.evidence !== evidence) return;
    const existing = await tx.select({ id: canonicalFacts.id }).from(canonicalFacts).where(and(
      eq(canonicalFacts.worldId, DEMO_IDS.world),
      eq(canonicalFacts.predicate, command.predicate),
      eq(canonicalFacts.status, "active")
    )).limit(1);
    if (existing.length > 0) return;

    const factEvent = eventInput(
      "FACT_DISCOVERED",
      { type: "player", id: DEMO_IDS.player },
      { predicate: command.predicate },
      `fact:${requestKey}`
    );
    const factId = crypto.randomUUID();
    await tx.insert(domainEvents).values(factEvent).onConflictDoNothing();
    await tx.insert(canonicalFacts).values({
      id: factId,
      worldId: DEMO_IDS.world,
      subject: { type: "player", id: DEMO_IDS.player },
      predicate: command.predicate,
      object: {
        content: "You promised Arthur to respect the building's quiet hours.",
        evidence,
        type: "promise"
      },
      confidence: command.confidence.toFixed(3),
      sourceEventId: factEvent.id
    });
    await tx.insert(npcKnowledge).values({
      npcId: DEMO_IDS.arthur,
      factId,
      source: "direct_observation",
      confidence: command.confidence.toFixed(3)
    });
    await tx.insert(domainEvents).values(eventInput(
      "MEMORY_CREATED",
      { type: "system" },
      { memoryId: factId, ownerId: DEMO_IDS.arthur },
      `memory:${factId}`
    )).onConflictDoNothing();
    return;
  }

  if (command.type === "adjust_relationship") {
    const delta = command.delta;
    if (command.dimension === "trust") {
      await tx.update(relationships).set({ trust: sql`greatest(0, least(100, ${relationships.trust} + ${delta}))` }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    } else if (command.dimension === "affinity") {
      await tx.update(relationships).set({ affinity: sql`greatest(0, least(100, ${relationships.affinity} + ${delta}))` }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    } else if (command.dimension === "respect") {
      await tx.update(relationships).set({ respect: sql`greatest(0, least(100, ${relationships.respect} + ${delta}))` }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    } else if (command.dimension === "familiarity") {
      await tx.update(relationships).set({ familiarity: sql`greatest(0, least(100, ${relationships.familiarity} + ${delta}))` }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    } else {
      await tx.update(relationships).set({ tension: sql`greatest(0, least(100, ${relationships.tension} + ${delta}))` }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    }
    await tx.update(relationships).set({
      version: sql`${relationships.version} + 1`,
      updatedAt: new Date()
    }).where(eq(relationships.npcId, DEMO_IDS.arthur));
    await tx.insert(domainEvents).values(eventInput(
      "RELATIONSHIP_CHANGED",
      { type: "system" },
      { dimension: command.dimension, delta, reason: command.reason },
      `relationship:${requestKey}:${command.dimension}`
    )).onConflictDoNothing();
    return;
  }

  const advanced = await tx.update(storylines).set({
    currentStage: command.toStage,
    state: { progress: 24, openQuestions: ["What will Maya's invitation lead to?"] },
    version: sql`${storylines.version} + 1`
  }).where(and(
    eq(storylines.id, DEMO_IDS.storyline),
    eq(storylines.currentStage, "arrival")
  )).returning({ id: storylines.id });
  if (advanced.length > 0) {
    await tx.insert(domainEvents).values(eventInput(
      "STORYLINE_ADVANCED",
      { type: "system" },
      { from: "arrival", to: command.toStage },
      `story:${requestKey}:${command.toStage}`
    )).onConflictDoNothing();
  }
}

export async function submitPersistentTurn(content: string, requestKey: string) {
  const existing = await db.select({ id: domainEvents.id }).from(domainEvents).where(and(
    eq(domainEvents.worldId, DEMO_IDS.world),
    eq(domainEvents.idempotencyKey, requestKey)
  )).limit(1);
  if (existing.length > 0) return loadPersistentDemoState();

  const [current, sceneAI] = await Promise.all([
    loadPersistentDemoState(),
    createConfiguredSceneAI()
  ]);
  if (current.scene.status !== "active") throw new Error("The scene is not active.");
  const authorizedFacts = current.memories
    .filter((memory) => memory.ownerId === DEMO_IDS.arthur && memory.status === "active")
    .map((memory) => memory.content);
  const measured = await sceneAI.respond({
    content,
    turnNumber: current.scene.turnNumber + 1,
    npcId: DEMO_IDS.arthur,
    authorizedFacts
  });

  await db.transaction(async (tx) => {
    const replayed = await tx.select({ id: domainEvents.id }).from(domainEvents).where(and(
      eq(domainEvents.worldId, DEMO_IDS.world),
      eq(domainEvents.idempotencyKey, requestKey)
    )).limit(1);
    if (replayed.length > 0) return;

    await tx.insert(messages).values({
      id: crypto.randomUUID(),
      worldId: DEMO_IDS.world,
      sceneId: DEMO_IDS.scene,
      speakerType: "player",
      speakerId: DEMO_IDS.player,
      content
    });
    await tx.insert(domainEvents).values(eventInput(
      "USER_SPOKE",
      { type: "player", id: DEMO_IDS.player },
      { contentLength: content.length },
      requestKey
    ));
    await tx.insert(messages).values({
      id: crypto.randomUUID(),
      worldId: DEMO_IDS.world,
      sceneId: DEMO_IDS.scene,
      speakerType: "npc",
      speakerId: DEMO_IDS.arthur,
      content: measured.turn.utterance,
      analysis: { emotion: measured.turn.emotion, action: measured.turn.action }
    });
    await tx.insert(domainEvents).values(eventInput(
      "NPC_RESPONDED",
      { type: "npc", id: DEMO_IDS.arthur },
      { sceneStatus: measured.turn.sceneStatus },
      `npc:${requestKey}`
    ));
    await tx.insert(aiUsage).values({
      worldId: DEMO_IDS.world,
      sceneId: DEMO_IDS.scene,
      purpose: "npc_turn",
      provider: measured.usage.provider,
      model: measured.usage.model,
      promptVersion: "npc-turn@1",
      inputTokens: measured.usage.inputTokens,
      outputTokens: measured.usage.outputTokens,
      latencyMs: measured.usage.latencyMs,
      estimatedCostUsd: measured.usage.estimatedCostUsd.toFixed(8),
      status: "success"
    });

    for (const command of measured.turn.proposedCommands) {
      await applyProposedCommand(tx, command, content, requestKey);
    }
  });
  return loadPersistentDemoState();
}

export async function completePersistentScene(requestKey: string) {
  await db.transaction(async (tx) => {
    const fact = await tx.select({ id: canonicalFacts.id }).from(canonicalFacts).where(and(
      eq(canonicalFacts.worldId, DEMO_IDS.world),
      eq(canonicalFacts.predicate, activeFactPredicate),
      eq(canonicalFacts.status, "active")
    )).limit(1);
    if (fact.length === 0) throw new Error("A validated promise is required to complete the scene.");

    const debrief: NonNullable<DemoState["learning"]["debrief"]> = {
      success: "You understood the house rule and made a clear commitment.",
      improvements: [{
        original: "I will respect the silence time.",
        suggestion: "I'll respect the quiet hours.",
        explanation: "“Quiet hours” is the natural fixed expression for a building rule."
      }],
      newExpression: "You can count on me."
    };
    const completed = await tx.update(scenes).set({
      status: "completed",
      version: sql`${scenes.version} + 1`,
      completedAt: new Date(),
      outcome: {
        summary: "Arthur trusts you with the apartment and leaves you the spare key.",
        debrief
      }
    }).where(and(eq(scenes.id, DEMO_IDS.scene), eq(scenes.status, "active"))).returning({ id: scenes.id });
    if (completed.length === 0) return;

    await tx.update(worlds).set({ currentDate: new Date("2026-09-08T13:05:00.000Z") }).where(eq(worlds.id, DEMO_IDS.world));
    await tx.insert(learnerMastery).values({
      userId: DEMO_IDS.user,
      learningItemId: DEMO_IDS.learningItem,
      recognitionScore: 51,
      productionScore: 26,
      attempts: 1,
      nextReview: new Date("2026-09-10T13:05:00.000Z")
    }).onConflictDoUpdate({
      target: [learnerMastery.userId, learnerMastery.learningItemId],
      set: { recognitionScore: 51, productionScore: 26, attempts: 1, updatedAt: new Date() }
    });
    await tx.insert(domainEvents).values([
      eventInput("SCENE_COMPLETED", { type: "player", id: DEMO_IDS.player }, { outcome: "promise_kept" }, requestKey),
      eventInput("LEARNING_OBJECTIVE_UPDATED", { type: "system" }, { productionScore: 26 }, `learning:${requestKey}`),
      eventInput("MESSAGE_RECEIVED", { type: "npc", id: DEMO_IDS.maya }, { preview: "Coffee on the house for new neighbors." }, `message:${requestKey}`)
    ]).onConflictDoNothing();
  });
  return loadPersistentDemoState();
}

export async function correctPersistentMemory(memoryId: string, content: string, requestKey: string) {
  await db.transaction(async (tx) => {
    const currentRows = await tx.select().from(canonicalFacts).where(and(
      eq(canonicalFacts.id, memoryId),
      eq(canonicalFacts.worldId, DEMO_IDS.world),
      eq(canonicalFacts.status, "active")
    )).limit(1);
    const current = currentRows[0];
    if (!current) return;
    const correctionEvent = eventInput(
      "MEMORY_CORRECTED",
      { type: "player", id: DEMO_IDS.player },
      { previousId: current.id },
      requestKey
    );
    const replacementId = crypto.randomUUID();
    correctionEvent.payload.replacementId = replacementId;

    await tx.update(canonicalFacts).set({ status: "superseded", validTo: new Date() }).where(eq(canonicalFacts.id, current.id));
    await tx.insert(domainEvents).values(correctionEvent).onConflictDoNothing();
    await tx.insert(canonicalFacts).values({
      id: replacementId,
      worldId: current.worldId,
      subject: current.subject,
      predicate: current.predicate,
      object: { ...(current.object as StoredFactObject), content },
      confidence: current.confidence,
      sourceEventId: correctionEvent.id,
      supersedesId: current.id,
      version: current.version + 1
    });
    await tx.delete(npcKnowledge).where(and(
      eq(npcKnowledge.npcId, DEMO_IDS.arthur),
      eq(npcKnowledge.factId, current.id)
    ));
    await tx.insert(npcKnowledge).values({
      npcId: DEMO_IDS.arthur,
      factId: replacementId,
      source: "user_correction",
      confidence: current.confidence
    });
  });
  return loadPersistentDemoState();
}

export async function resetPersistentDemo() {
  await db.transaction(async (tx) => {
    await tx.delete(npcKnowledge).where(sql`${npcKnowledge.factId} in (
      select id from canonical_facts where world_id = ${DEMO_IDS.world}
    )`);
    await tx.delete(canonicalFacts).where(eq(canonicalFacts.worldId, DEMO_IDS.world));
    await tx.delete(messages).where(eq(messages.sceneId, DEMO_IDS.scene));
    await tx.delete(aiUsage).where(eq(aiUsage.worldId, DEMO_IDS.world));
    await tx.delete(outboxEvents).where(sql`${outboxEvents.eventId} in (
      select id from domain_events where world_id = ${DEMO_IDS.world}
    )`);
    await tx.delete(domainEvents).where(eq(domainEvents.worldId, DEMO_IDS.world));
    await tx.delete(learnerMastery).where(and(
      eq(learnerMastery.userId, DEMO_IDS.user),
      eq(learnerMastery.learningItemId, DEMO_IDS.learningItem)
    ));
    await tx.update(relationships).set({
      trust: 28,
      affinity: 34,
      respect: 36,
      familiarity: 12,
      tension: 4,
      version: 1,
      updatedAt: new Date()
    }).where(and(
      eq(relationships.worldId, DEMO_IDS.world),
      eq(relationships.npcId, DEMO_IDS.arthur)
    ));
    await tx.update(storylines).set({
      currentStage: "arrival",
      state: { progress: 8, openQuestions: ["Can Arthur trust the new tenant?"] },
      version: 1
    }).where(eq(storylines.id, DEMO_IDS.storyline));
    await tx.update(scenes).set({
      status: "proposed",
      outcome: null,
      version: 1,
      startedAt: null,
      completedAt: null
    }).where(eq(scenes.id, DEMO_IDS.scene));
    await tx.update(worlds).set({ currentDate: new Date("2026-09-08T12:40:00.000Z") }).where(eq(worlds.id, DEMO_IDS.world));
    await tx.update(playerCharacters).set({ name: "Daniele" }).where(eq(playerCharacters.id, DEMO_IDS.player));
    await tx.update(learnerProfiles).set({
      cefrLevel: "B1",
      preferredMode: "assisted",
      preferences: {}
    }).where(eq(learnerProfiles.userId, DEMO_IDS.user));
  });
  return loadPersistentDemoState();
}
