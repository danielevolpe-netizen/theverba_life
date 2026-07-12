import { describe, expect, it } from "vitest";
import {
  IdempotencyKeySchema,
  MemoryCorrectionRequestSchema,
  ProfileUpdateRequestSchema,
  SceneTurnRequestSchema
} from "./index";

describe("LifeLang API contracts", () => {
  it("accepts bounded scene turns and rejects blank content", () => {
    expect(SceneTurnRequestSchema.parse({ content: "  You can count on me.  " }).content)
      .toBe("You can count on me.");
    expect(SceneTurnRequestSchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("requires useful idempotency keys", () => {
    expect(IdempotencyKeySchema.safeParse("turn-123456").success).toBe(true);
    expect(IdempotencyKeySchema.safeParse("short").success).toBe(false);
  });

  it("bounds profile and memory writes", () => {
    expect(ProfileUpdateRequestSchema.safeParse({ name: "Luca", level: "B1", mode: "assisted" }).success).toBe(true);
    expect(ProfileUpdateRequestSchema.safeParse({ name: "", level: "C2", mode: "school" }).success).toBe(false);
    expect(MemoryCorrectionRequestSchema.safeParse({ content: "Arthur knows I use headphones." }).success).toBe(true);
  });
});
