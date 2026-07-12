import { z } from "zod";

export const EntityRefSchema = z.object({
  type: z.enum(["player", "npc", "location", "storyline"]),
  id: z.string().min(1)
});

export const ProposedCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("record_fact"),
    predicate: z.enum(["promised_respect_quiet_hours", "business_name", "coffee_preference"]),
    value: z.string().min(1),
    confidence: z.number().min(0).max(1),
    evidence: z.string().min(1)
  }),
  z.object({
    type: z.literal("adjust_relationship"),
    dimension: z.enum(["trust", "affinity", "respect", "familiarity", "tension"]),
    delta: z.number().min(-5).max(5),
    reason: z.string().min(1)
  }),
  z.object({
    type: z.literal("advance_storyline"),
    toStage: z.enum(["arrival", "settled_in", "cafe_invitation", "network_event"]),
    evidence: z.string().min(1)
  })
]);

export const NPCTurnSchema = z.object({
  utterance: z.string().min(1).max(700),
  action: z.string().max(200).optional(),
  emotion: z.object({
    label: z.enum(["neutral", "warm", "curious", "concerned", "pleased"]),
    intensity: z.number().min(0).max(1)
  }),
  sceneSignals: z.array(z.string()).max(5),
  memoryCandidates: z.array(z.object({
    type: z.enum(["fact", "preference", "promise", "opinion"]),
    content: z.string().min(1),
    confidence: z.number().min(0).max(1),
    evidence: z.string().min(1)
  })).max(3),
  proposedCommands: z.array(ProposedCommandSchema).max(4),
  sceneStatus: z.enum(["continue", "ready_to_close"])
});

export type NPCTurn = z.infer<typeof NPCTurnSchema>;
export type ProposedCommand = z.infer<typeof ProposedCommandSchema>;

export const DomainEventSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  type: z.enum([
    "SCENE_STARTED",
    "USER_SPOKE",
    "NPC_RESPONDED",
    "SCENE_COMPLETED",
    "FACT_DISCOVERED",
    "MEMORY_CREATED",
    "MEMORY_CORRECTED",
    "RELATIONSHIP_CHANGED",
    "STORYLINE_ADVANCED",
    "LEARNING_OBJECTIVE_UPDATED",
    "MESSAGE_RECEIVED",
    "LOCATION_VISITED"
  ]),
  schemaVersion: z.literal(1),
  actor: z.union([EntityRefSchema, z.object({ type: z.literal("system") })]),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: z.string(),
  correlationId: z.string(),
  causationId: z.string().optional(),
  idempotencyKey: z.string()
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;

export const IdempotencyKeySchema = z.string().min(8).max(100);

export const SceneTurnRequestSchema = z.object({
  content: z.string().trim().min(1).max(2000)
});

export const ProfileUpdateRequestSchema = z.object({
  name: z.string().trim().min(1).max(30),
  level: z.enum(["A2", "B1", "B2"]),
  mode: z.enum(["assisted", "immersive"])
});

export const MemoryCorrectionRequestSchema = z.object({
  content: z.string().trim().min(1).max(1000)
});
