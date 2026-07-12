import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const memoryStatus = pgEnum("memory_status", ["active", "contested", "superseded", "deleted"]);
export const sceneStatus = pgEnum("scene_status", ["proposed", "active", "completed", "cancelled"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull().default("it-IT"),
  timezone: text("timezone").notNull().default("Europe/Rome"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const learnerProfiles = pgTable("learner_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  nativeLanguage: text("native_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  preferredMode: text("preferred_mode").notNull(),
  preferences: jsonb("preferences").notNull().default({})
});

export const worlds = pgTable("worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  mode: text("mode").notNull().default("realistic"),
  currentDate: timestamp("current_date", { withTimezone: true }).notNull(),
  configuration: jsonb("configuration").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("worlds_user_idx").on(table.userId)]);

export const playerCharacters = pgTable("player_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  worldId: uuid("world_id").notNull().unique().references(() => worlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  profession: text("profession").notNull(),
  biography: text("biography").notNull(),
  reputation: integer("reputation").notNull().default(0),
  goals: jsonb("goals").notNull().default([])
});

export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  metadata: jsonb("metadata").notNull().default({})
}, (table) => [index("locations_world_idx").on(table.worldId)]);

export const npcs = pgTable("npcs", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  profession: text("profession").notNull(),
  biography: text("biography").notNull(),
  personality: jsonb("personality").notNull(),
  goals: jsonb("goals").notNull(),
  currentLocationId: uuid("current_location_id").references(() => locations.id)
}, (table) => [index("npcs_world_idx").on(table.worldId)]);

export const relationships = pgTable("relationships", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => playerCharacters.id, { onDelete: "cascade" }),
  npcId: uuid("npc_id").notNull().references(() => npcs.id, { onDelete: "cascade" }),
  trust: integer("trust").notNull().default(0),
  affinity: integer("affinity").notNull().default(0),
  respect: integer("respect").notNull().default(0),
  familiarity: integer("familiarity").notNull().default(0),
  tension: integer("tension").notNull().default(0),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [uniqueIndex("relationships_pair_idx").on(table.worldId, table.playerId, table.npcId)]);

export const storylines = pgTable("storylines", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  state: jsonb("state").notNull(),
  currentStage: text("current_stage").notNull(),
  status: text("status").notNull().default("active"),
  version: integer("version").notNull().default(1)
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  storylineId: uuid("storyline_id").references(() => storylines.id),
  title: text("title").notNull(),
  brief: jsonb("brief").notNull(),
  status: sceneStatus("status").notNull().default("proposed"),
  outcome: jsonb("outcome"),
  version: integer("version").notNull().default(1),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  sceneId: uuid("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  speakerType: text("speaker_type").notNull(),
  speakerId: uuid("speaker_id").notNull(),
  content: text("content").notNull(),
  analysis: jsonb("analysis").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [index("messages_scene_time_idx").on(table.sceneId, table.createdAt)]);

export const canonicalFacts = pgTable("canonical_facts", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  subject: jsonb("subject").notNull(),
  predicate: text("predicate").notNull(),
  object: jsonb("object").notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
  status: memoryStatus("status").notNull().default("active"),
  sourceEventId: uuid("source_event_id").notNull(),
  supersedesId: uuid("supersedes_id"),
  version: integer("version").notNull().default(1),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull().defaultNow(),
  validTo: timestamp("valid_to", { withTimezone: true })
}, (table) => [index("facts_world_predicate_idx").on(table.worldId, table.predicate)]);

export const npcKnowledge = pgTable("npc_knowledge", {
  npcId: uuid("npc_id").notNull().references(() => npcs.id, { onDelete: "cascade" }),
  factId: uuid("fact_id").notNull().references(() => canonicalFacts.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
  learnedAt: timestamp("learned_at", { withTimezone: true }).notNull().defaultNow(),
  forgottenAt: timestamp("forgotten_at", { withTimezone: true })
}, (table) => [primaryKey({ columns: [table.npcId, table.factId] })]);

export const domainEvents = pgTable("domain_events", {
  id: uuid("id").primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  actor: jsonb("actor").notNull(),
  payload: jsonb("payload").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  correlationId: text("correlation_id").notNull(),
  causationId: uuid("causation_id"),
  idempotencyKey: text("idempotency_key").notNull()
}, (table) => [uniqueIndex("events_world_idempotency_idx").on(table.worldId, table.idempotencyKey)]);

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().unique().references(() => domainEvents.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  payload: jsonb("payload").notNull(),
  processed: boolean("processed").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow()
});

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  sceneId: uuid("scene_id").references(() => scenes.id),
  purpose: text("purpose").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptVersion: text("prompt_version").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  latencyMs: integer("latency_ms").notNull(),
  estimatedCostUsd: numeric("estimated_cost_usd", { precision: 12, scale: 8 }).notNull().default("0"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const learningItems = pgTable("learning_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  language: text("language").notNull(),
  type: text("type").notNull(),
  phrase: text("phrase").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  metadata: jsonb("metadata").notNull().default({})
});

export const learnerMastery = pgTable("learner_mastery", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  learningItemId: uuid("learning_item_id").notNull().references(() => learningItems.id, { onDelete: "cascade" }),
  recognitionScore: integer("recognition_score").notNull().default(0),
  productionScore: integer("production_score").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  nextReview: timestamp("next_review", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [primaryKey({ columns: [table.userId, table.learningItemId] })]);

export const schemaHealth = sql`select 1`;
