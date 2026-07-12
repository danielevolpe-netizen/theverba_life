import postgres from "postgres";
import { loadEnvFile } from "node:process";

if (!process.env.DATABASE_URL) {
  try {
    loadEnvFile("../../.env");
  } catch {
    // CI and production inject DATABASE_URL directly.
  }
}

const connectionString = process.env.DATABASE_URL ?? "postgresql://lifelang:lifelang@localhost:5432/lifelang";
const sql = postgres(connectionString, { max: 1 });

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  world: "20000000-0000-4000-8000-000000000001",
  player: "30000000-0000-4000-8000-000000000001",
  apartment: "40000000-0000-4000-8000-000000000001",
  cafe: "40000000-0000-4000-8000-000000000002",
  workspace: "40000000-0000-4000-8000-000000000003",
  park: "40000000-0000-4000-8000-000000000004",
  arthur: "50000000-0000-4000-8000-000000000001",
  maya: "50000000-0000-4000-8000-000000000002",
  marcus: "50000000-0000-4000-8000-000000000003",
  storyline: "60000000-0000-4000-8000-000000000001",
  scene: "70000000-0000-4000-8000-000000000001",
  learningItem: "80000000-0000-4000-8000-000000000001"
};

await sql.begin(async (tx) => {
  await tx`insert into users (id, email) values (${ids.user}, 'demo@lifelang.local') on conflict do nothing`;
  await tx`insert into learner_profiles (user_id, native_language, target_language, cefr_level, preferred_mode)
    values (${ids.user}, 'it', 'en', 'B1', 'assisted') on conflict do nothing`;
  await tx`insert into worlds (id, user_id, name, city, "current_date")
    values (${ids.world}, ${ids.user}, 'New Beginnings', 'New York', '2026-09-08T08:40:00-04:00') on conflict do nothing`;
  await tx`insert into player_characters (id, user_id, world_id, name, profession, biography)
    values (${ids.player}, ${ids.user}, ${ids.world}, 'Daniele', 'Founder', 'An Italian founder opening a new business in New York.') on conflict do nothing`;

  await tx`insert into locations (id, world_id, name, category, description, address) values
    (${ids.apartment}, ${ids.world}, 'Hudson House', 'home', 'A warm brownstone apartment in the West Village.', '18 Hudson Lane'),
    (${ids.cafe}, ${ids.world}, 'Northstar Café', 'cafe', 'A neighborhood café where founders and artists cross paths.', '42 Perry Street'),
    (${ids.workspace}, ${ids.world}, 'Canal Works', 'workspace', 'A converted warehouse with flexible studios.', '217 Canal Street'),
    (${ids.park}, ${ids.world}, 'Riverside Green', 'park', 'A narrow green space along the Hudson.', 'Hudson River Greenway')
    on conflict do nothing`;

  await tx`insert into npcs (id, world_id, name, profession, biography, personality, goals, current_location_id) values
    (${ids.arthur}, ${ids.world}, 'Arthur Bennett', 'Landlord', 'A lifelong New Yorker who protects his tenants and his building.', ${sql.json({ warmth: 0.68, directness: 0.76 })}, ${sql.json(["keep the building peaceful"])}, ${ids.apartment}),
    (${ids.maya}, ${ids.world}, 'Maya Chen', 'Barista and photographer', 'A curious connector who knows the neighborhood.', ${sql.json({ curiosity: 0.86, humor: 0.62 })}, ${sql.json(["build a photography portfolio"])}, ${ids.cafe}),
    (${ids.marcus}, ${ids.world}, 'Marcus Reed', 'Retail founder', 'A possible client with exacting standards.', ${sql.json({ assertiveness: 0.78, patience: 0.41 })}, ${sql.json(["open a second retail concept"])}, ${ids.workspace})
    on conflict do nothing`;

  await tx`insert into relationships (world_id, player_id, npc_id, trust, affinity, respect, familiarity, tension)
    values (${ids.world}, ${ids.player}, ${ids.arthur}, 28, 34, 36, 12, 4) on conflict do nothing`;
  await tx`insert into storylines (id, world_id, title, state, current_stage)
    values (${ids.storyline}, ${ids.world}, 'New Beginnings', ${sql.json({ progress: 8, openQuestions: ["Can Arthur trust the new tenant?"] })}, 'arrival') on conflict do nothing`;
  await tx`insert into scenes (id, world_id, location_id, storyline_id, title, brief, status)
    values (
      ${ids.scene},
      ${ids.world},
      ${ids.apartment},
      ${ids.storyline},
      'The house rules',
      ${sql.json({
        npcId: ids.arthur,
        narrativeObjective: "Establish trust with the landlord.",
        primaryLearningObjectiveId: ids.learningItem,
        function: "Make a clear promise",
        targetPhrase: "Can I count on you?"
      })},
      'proposed'
    ) on conflict do nothing`;
  await tx`insert into learning_items (id, language, type, phrase, cefr_level, metadata)
    values (${ids.learningItem}, 'en', 'conversation_function', 'Can I count on you?', 'B1', ${sql.json({ response: "You can count on me." })})
    on conflict do nothing`;
});

await sql.end();
console.log("LifeLang vertical-slice seed applied.");
