import { describe, expect, it } from "vitest";
import { DeterministicSceneAI } from "@lifelang/ai";
import { completeOnboarding, completeScene, correctMemory, createDemoState, startScene, submitTurn } from "./index";

describe("LifeLang vertical slice", () => {
  it("turns a supported promise into memory, consequence and learning", async () => {
    let state = completeOnboarding(createDemoState(), { name: "Luca", level: "B1", mode: "assisted" });
    state = startScene(state);
    state = await submitTurn(state, "The journey was fine. I have moved here for my startup.", new DeterministicSceneAI());
    state = await submitTurn(state, "You can count on me. I will respect the quiet hours.", new DeterministicSceneAI());
    state = completeScene(state);

    expect(state.scene.status).toBe("completed");
    expect(state.memories.filter((memory) => memory.status === "active")).toHaveLength(1);
    expect(state.relationship.trust).toBe(32);
    expect(state.storyline.stage).toBe("settled_in");
    expect(state.learning.productionScore).toBe(26);
    expect(state.events.some((event) => event.type === "STORYLINE_ADVANCED")).toBe(true);
    expect(state.usage.calls).toBe(2);
  });

  it("does not create a fact without direct evidence", async () => {
    let state = startScene(createDemoState());
    state = await submitTurn(state, "It was a long journey.", new DeterministicSceneAI());
    expect(state.memories).toHaveLength(0);
    expect(completeScene(state).scene.status).toBe("active");
  });

  it("supersedes a corrected memory and exposes only the replacement", async () => {
    let state = startScene(createDemoState());
    state = await submitTurn(state, "I promise I will respect the quiet hours.", new DeterministicSceneAI());
    const original = state.memories[0];
    expect(original).toBeDefined();
    if (!original) throw new Error("Expected memory");
    state = correctMemory(state, original.id, "You told Arthur you usually work late, but agreed to use headphones.");
    expect(state.memories.find((memory) => memory.id === original.id)?.status).toBe("superseded");
    expect(state.memories.filter((memory) => memory.status === "active")[0]?.version).toBe(2);
  });
});
