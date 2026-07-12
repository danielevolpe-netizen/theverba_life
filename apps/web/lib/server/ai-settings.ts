import "server-only";

import {
  DeterministicSceneAI,
  VercelGatewaySceneAI,
  type SceneAI
} from "@lifelang/ai";

const defaultGatewayUrl = "https://ai-gateway.vercel.sh/v1";
const defaultModel = "openai/gpt-5.4-mini";

export type SafeAISettings = {
  requestedProvider: "deterministic" | "vercel-gateway";
  activeAdapter: "deterministic" | "vercel-gateway";
  selectedModel: {
    id: string;
    creator: string;
    purpose: string;
  };
  gateways: Array<{
    id: "vercel-ai-gateway";
    name: string;
    baseUrl: string;
    configured: boolean;
    authentication: "api-key" | "oidc" | "missing";
    modelCount: string;
  }>;
};

function readGatewayEnvironment() {
  const requestedProvider = process.env.AI_PROVIDER === "vercel-gateway"
    ? "vercel-gateway" as const
    : "deterministic" as const;
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
  const authentication = process.env.AI_GATEWAY_API_KEY
    ? "api-key" as const
    : process.env.VERCEL_OIDC_TOKEN
      ? "oidc" as const
      : "missing" as const;
  const model = process.env.AI_GATEWAY_MODEL || defaultModel;
  const baseUrl = process.env.AI_GATEWAY_BASE_URL || defaultGatewayUrl;
  const timeout = Number(process.env.AI_GATEWAY_TIMEOUT_MS || "30000");
  return {
    requestedProvider,
    apiKey,
    authentication,
    model,
    baseUrl,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 30000
  };
}

export function getSafeAISettings(): SafeAISettings {
  const env = readGatewayEnvironment();
  const configured = env.apiKey.length > 0;
  return {
    requestedProvider: env.requestedProvider,
    activeAdapter: env.requestedProvider === "vercel-gateway" && configured
      ? "vercel-gateway"
      : "deterministic",
    selectedModel: {
      id: env.model,
      creator: env.model.split("/")[0] || "unknown",
      purpose: "NPC dialogue and structured scene commands"
    },
    gateways: [{
      id: "vercel-ai-gateway",
      name: "Vercel AI Gateway",
      baseUrl: env.baseUrl,
      configured,
      authentication: env.authentication,
      modelCount: "200+ models"
    }]
  };
}

export function createConfiguredSceneAI(): SceneAI {
  const env = readGatewayEnvironment();
  if (env.requestedProvider === "vercel-gateway" && env.apiKey) {
    return new VercelGatewaySceneAI({
      apiKey: env.apiKey,
      baseUrl: env.baseUrl,
      model: env.model,
      timeoutMs: env.timeoutMs
    });
  }
  return new DeterministicSceneAI();
}
