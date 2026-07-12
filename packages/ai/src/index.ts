import { NPCTurnSchema, type NPCTurn } from "@lifelang/contracts";

export type SceneTurnInput = {
  content: string;
  turnNumber: number;
  npcId: string;
  authorizedFacts: string[];
};

export type MeasuredTurn = {
  turn: NPCTurn;
  usage: {
    provider: "deterministic" | "vercel-ai-gateway";
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    estimatedCostUsd: number;
  };
};

export interface SceneAI {
  respond(input: SceneTurnInput): Promise<MeasuredTurn>;
}

export type VercelGatewayConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  fetch?: typeof fetch;
};

type GatewayResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

const gatewaySystemPrompt = `You are the Scene AI for LifeLang, a persistent English-learning world.
Return exactly one JSON object matching NPCTurn@1. Never write canonical state directly.
The NPC may only use the authorized facts provided. Keep language appropriate for B1.
Allowed proposed command types are record_fact, adjust_relationship, and advance_storyline.
Only record a fact when the user's exact message is direct evidence. Maximum three memory candidates.`;

export class VercelGatewaySceneAI implements SceneAI {
  readonly config: VercelGatewayConfig;

  constructor(config: VercelGatewayConfig) {
    this.config = config;
  }

  async respond(input: SceneTurnInput): Promise<MeasuredTurn> {
    const startedAt = performance.now();
    const fetcher = this.config.fetch ?? fetch;
    const response = await fetcher(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: gatewaySystemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              npcId: input.npcId,
              turnNumber: input.turnNumber,
              authorizedFacts: input.authorizedFacts.slice(0, 5),
              userMessage: input.content
            })
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 700
      }),
      signal: AbortSignal.timeout(this.config.timeoutMs)
    });
    if (!response.ok) {
      throw new Error(`Vercel AI Gateway returned ${response.status}.`);
    }
    const payload = await response.json() as GatewayResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Vercel AI Gateway returned no message content.");
    const turn = NPCTurnSchema.parse(JSON.parse(content) as unknown);

    return {
      turn,
      usage: {
        provider: "vercel-ai-gateway",
        model: this.config.model,
        inputTokens: payload.usage?.prompt_tokens ?? 0,
        outputTokens: payload.usage?.completion_tokens ?? 0,
        latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
        estimatedCostUsd: 0
      }
    };
  }
}

const includesAny = (content: string, terms: string[]) =>
  terms.some((term) => content.toLowerCase().includes(term));

export class DeterministicSceneAI implements SceneAI {
  async respond(input: SceneTurnInput): Promise<MeasuredTurn> {
    const startedAt = performance.now();
    const promise = includesAny(input.content, ["i promise", "i will", "quiet", "keep it down"]);
    const business = includesAny(input.content, ["business", "company", "startup", "studio"]);

    const candidate: unknown = promise
      ? {
          utterance:
            "I appreciate that. The building is lively, but people look out for one another. If anything in the apartment gives you trouble, call me before it becomes a problem.",
          action: "Arthur relaxes his shoulders and hands you the spare key.",
          emotion: { label: "pleased", intensity: 0.74 },
          sceneSignals: ["quiet_hours_acknowledged", "spare_key_received"],
          memoryCandidates: [{
            type: "promise",
            content: "The player promised Arthur to respect the building's quiet hours.",
            confidence: 0.97,
            evidence: input.content
          }],
          proposedCommands: [
            {
              type: "record_fact",
              predicate: "promised_respect_quiet_hours",
              value: "true",
              confidence: 0.97,
              evidence: input.content
            },
            {
              type: "adjust_relationship",
              dimension: "trust",
              delta: 4,
              reason: "The player clearly acknowledged an important house rule."
            },
            {
              type: "advance_storyline",
              toStage: "settled_in",
              evidence: input.content
            }
          ],
          sceneStatus: "ready_to_close"
        }
      : business
        ? {
            utterance:
              "A new business? That's brave — and very New York. What kind of place are you hoping to build here?",
            action: "Arthur leans against the doorframe, genuinely curious.",
            emotion: { label: "curious", intensity: 0.66 },
            sceneSignals: ["business_topic_opened"],
            memoryCandidates: [],
            proposedCommands: [{
              type: "adjust_relationship",
              dimension: "familiarity",
              delta: 2,
              reason: "The player shared why they moved to New York."
            }],
            sceneStatus: "continue"
          }
        : {
            utterance:
              input.turnNumber === 1
                ? "Good. Before I leave you to unpack, there is one house rule: quiet hours start at ten. Can I count on you?"
                : "Take your time — it has been a long day. Is there anything about the apartment you want me to explain?",
            action: "Arthur taps the small house-rules card beside the door.",
            emotion: { label: "warm", intensity: 0.52 },
            sceneSignals: ["quiet_hours_prompted"],
            memoryCandidates: [],
            proposedCommands: [],
            sceneStatus: "continue"
          };

    const turn = NPCTurnSchema.parse(candidate);
    const inputTokens = Math.ceil((input.content.length + input.authorizedFacts.join(" ").length) / 4);
    const outputTokens = Math.ceil(turn.utterance.length / 4);

    return {
      turn,
      usage: {
        provider: "deterministic",
        model: "lifelang-golden-v1",
        inputTokens,
        outputTokens,
        latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
        estimatedCostUsd: 0
      }
    };
  }
}
