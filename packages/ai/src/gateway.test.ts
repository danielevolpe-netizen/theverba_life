import { describe, expect, it } from "vitest";
import { VercelGatewaySceneAI } from "./index";

describe("VercelGatewaySceneAI", () => {
  it("validates structured gateway output and records usage", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    let callCount = 0;
    const fetcher: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      callCount += 1;
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              utterance: "You can count on me.",
              emotion: { label: "warm", intensity: 0.5 },
              sceneSignals: ["promise_acknowledged"],
              memoryCandidates: [],
              proposedCommands: [],
              sceneStatus: "continue"
            })
          }
        }],
        usage: { prompt_tokens: 120, completion_tokens: 35 }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    };
    const adapter = new VercelGatewaySceneAI({
      apiKey: "test-key",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      model: "openai/gpt-5.4-mini",
      timeoutMs: 1000,
      fetch: fetcher
    });

    const result = await adapter.respond({
      content: "I promise.",
      turnNumber: 2,
      npcId: "npc-arthur",
      authorizedFacts: []
    });

    expect(result.turn.utterance).toBe("You can count on me.");
    expect(result.usage).toMatchObject({
      provider: "vercel-ai-gateway",
      model: "openai/gpt-5.4-mini",
      inputTokens: 120,
      outputTokens: 35
    });
    expect(callCount).toBe(1);
    expect(capturedUrl).toBe("https://ai-gateway.vercel.sh/v1/chat/completions");
    expect(capturedInit?.headers).toMatchObject({ Authorization: "Bearer test-key" });
  });

  it("rejects invalid model output before it reaches the domain", async () => {
    const adapter = new VercelGatewaySceneAI({
      apiKey: "test-key",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      model: "openai/gpt-5.4-mini",
      timeoutMs: 1000,
      fetch: async () => new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ utterance: "Missing contract fields" }) } }]
      }), { status: 200 })
    });

    await expect(adapter.respond({
      content: "Hello",
      turnNumber: 1,
      npcId: "npc-arthur",
      authorizedFacts: []
    })).rejects.toThrow();
  });
});
