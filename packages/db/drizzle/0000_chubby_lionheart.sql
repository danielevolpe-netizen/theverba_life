CREATE TYPE "public"."memory_status" AS ENUM('active', 'contested', 'superseded', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."scene_status" AS ENUM('proposed', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"scene_id" uuid,
	"purpose" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer NOT NULL,
	"estimated_cost_usd" numeric(12, 8) DEFAULT '0' NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canonical_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"subject" jsonb NOT NULL,
	"predicate" text NOT NULL,
	"object" jsonb NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"status" "memory_status" DEFAULT 'active' NOT NULL,
	"source_event_id" uuid NOT NULL,
	"supersedes_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"world_id" uuid NOT NULL,
	"type" text NOT NULL,
	"schema_version" integer NOT NULL,
	"actor" jsonb NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"correlation_id" text NOT NULL,
	"causation_id" uuid,
	"idempotency_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_mastery" (
	"user_id" uuid NOT NULL,
	"learning_item_id" uuid NOT NULL,
	"recognition_score" integer DEFAULT 0 NOT NULL,
	"production_score" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_mastery_user_id_learning_item_id_pk" PRIMARY KEY("user_id","learning_item_id")
);
--> statement-breakpoint
CREATE TABLE "learner_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"native_language" text NOT NULL,
	"target_language" text NOT NULL,
	"cefr_level" text NOT NULL,
	"preferred_mode" text NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" text NOT NULL,
	"type" text NOT NULL,
	"phrase" text NOT NULL,
	"cefr_level" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"scene_id" uuid NOT NULL,
	"speaker_type" text NOT NULL,
	"speaker_id" uuid NOT NULL,
	"content" text NOT NULL,
	"analysis" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npc_knowledge" (
	"npc_id" uuid NOT NULL,
	"fact_id" uuid NOT NULL,
	"source" text NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"learned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"forgotten_at" timestamp with time zone,
	CONSTRAINT "npc_knowledge_npc_id_fact_id_pk" PRIMARY KEY("npc_id","fact_id")
);
--> statement-breakpoint
CREATE TABLE "npcs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"profession" text NOT NULL,
	"biography" text NOT NULL,
	"personality" jsonb NOT NULL,
	"goals" jsonb NOT NULL,
	"current_location_id" uuid
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "player_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"profession" text NOT NULL,
	"biography" text NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "player_characters_world_id_unique" UNIQUE("world_id")
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"npc_id" uuid NOT NULL,
	"trust" integer DEFAULT 0 NOT NULL,
	"affinity" integer DEFAULT 0 NOT NULL,
	"respect" integer DEFAULT 0 NOT NULL,
	"familiarity" integer DEFAULT 0 NOT NULL,
	"tension" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"storyline_id" uuid,
	"title" text NOT NULL,
	"brief" jsonb NOT NULL,
	"status" "scene_status" DEFAULT 'proposed' NOT NULL,
	"outcome" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "storylines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"title" text NOT NULL,
	"state" jsonb NOT NULL,
	"current_stage" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"locale" text DEFAULT 'it-IT' NOT NULL,
	"timezone" text DEFAULT 'Europe/Rome' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"mode" text DEFAULT 'realistic' NOT NULL,
	"current_date" timestamp with time zone NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canonical_facts" ADD CONSTRAINT "canonical_facts_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_mastery" ADD CONSTRAINT "learner_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_mastery" ADD CONSTRAINT "learner_mastery_learning_item_id_learning_items_id_fk" FOREIGN KEY ("learning_item_id") REFERENCES "public"."learning_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_knowledge" ADD CONSTRAINT "npc_knowledge_npc_id_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_knowledge" ADD CONSTRAINT "npc_knowledge_fact_id_canonical_facts_id_fk" FOREIGN KEY ("fact_id") REFERENCES "public"."canonical_facts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_current_location_id_locations_id_fk" FOREIGN KEY ("current_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_event_id_domain_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."domain_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_characters" ADD CONSTRAINT "player_characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_characters" ADD CONSTRAINT "player_characters_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_player_id_player_characters_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_npc_id_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_storyline_id_storylines_id_fk" FOREIGN KEY ("storyline_id") REFERENCES "public"."storylines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storylines" ADD CONSTRAINT "storylines_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worlds" ADD CONSTRAINT "worlds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "facts_world_predicate_idx" ON "canonical_facts" USING btree ("world_id","predicate");--> statement-breakpoint
CREATE UNIQUE INDEX "events_world_idempotency_idx" ON "domain_events" USING btree ("world_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "locations_world_idx" ON "locations" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "messages_scene_time_idx" ON "messages" USING btree ("scene_id","created_at");--> statement-breakpoint
CREATE INDEX "npcs_world_idx" ON "npcs" USING btree ("world_id");--> statement-breakpoint
CREATE UNIQUE INDEX "relationships_pair_idx" ON "relationships" USING btree ("world_id","player_id","npc_id");--> statement-breakpoint
CREATE INDEX "worlds_user_idx" ON "worlds" USING btree ("user_id");