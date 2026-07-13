import "server-only";

import {
  DeterministicSceneAI,
  VercelGatewaySceneAI,
  type SceneAI
} from "@lifelang/ai";
import { db } from "@lifelang/db/client";
import { worlds } from "@lifelang/db/schema";
import { eq } from "drizzle-orm";
import { DEMO_IDS } from "./demo-ids";

const defaultGatewayUrl = "https://ai-gateway.vercel.sh/v1";
const defaultModel = "openai/gpt-5.4-mini";
const vercelGatewayId = "vercel-ai-gateway";

type GatewayAuthentication = "api-key" | "oidc" | "missing";
type WorldConfiguration = Record<string, unknown> & {
  ai?: {
    version?: number;
    activeGatewayId?: string;
    selectedModels?: Record<string, string>;
  };
};

type GatewayEnvironment = {
  requestedProvider: "deterministic" | "vercel-gateway";
  apiKey: string;
  authentication: GatewayAuthentication;
  defaultModel: string;
  baseUrl: string;
  timeoutMs: number;
};

type GatewayModelPayload = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  owned_by?: unknown;
  context_window?: unknown;
  max_tokens?: unknown;
  type?: unknown;
  tags?: unknown;
};

export type GatewayModelOption = {
  id: string;
  name: string;
  creator: string;
  description: string;
  contextWindow: number | null;
  maxTokens: number | null;
  tags: string[];
};

export type SafeAISettings = {
  requestedProvider: "deterministic" | "vercel-gateway";
  activeAdapter: "deterministic" | "vercel-gateway";
  activeGatewayId: string | null;
  activeModelId: string | null;
  gateways: Array<{
    id: string;
    name: string;
    baseUrl: string;
    configured: boolean;
    active: boolean;
    authentication: GatewayAuthentication;
    catalogStatus: "live" | "fallback";
    selectedModelId: string;
    activeModelId: string | null;
    models: GatewayModelOption[];
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readGatewayEnvironment(): GatewayEnvironment {
  const requestedProvider = process.env.AI_PROVIDER === "vercel-gateway"
    ? "vercel-gateway" as const
    : "deterministic" as const;
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
  const authentication = process.env.AI_GATEWAY_API_KEY
    ? "api-key" as const
    : process.env.VERCEL_OIDC_TOKEN
      ? "oidc" as const
      : "missing" as const;
  const timeout = Number(process.env.AI_GATEWAY_TIMEOUT_MS || "30000");
  return {
    requestedProvider,
    apiKey,
    authentication,
    defaultModel: process.env.AI_GATEWAY_MODEL || defaultModel,
    baseUrl: process.env.AI_GATEWAY_BASE_URL || defaultGatewayUrl,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 30000
  };
}

function fallbackModel(modelId: string): GatewayModelOption {
  const [creator = "unknown", model = modelId] = modelId.split("/");
  return {
    id: modelId,
    name: model,
    creator,
    description: "Configured language model. Live catalog details are temporarily unavailable.",
    contextWindow: null,
    maxTokens: null,
    tags: []
  };
}

function parseModel(model: GatewayModelPayload): GatewayModelOption | null {
  if (typeof model.id !== "string" || model.id.length === 0 || model.type !== "language") return null;
  const [creator = "unknown", modelName = model.id] = model.id.split("/");
  return {
    id: model.id,
    name: typeof model.name === "string" && model.name.length > 0 ? model.name : modelName,
    creator: typeof model.owned_by === "string" && model.owned_by.length > 0 ? model.owned_by : creator,
    description: typeof model.description === "string" ? model.description : "",
    contextWindow: typeof model.context_window === "number" ? model.context_window : null,
    maxTokens: typeof model.max_tokens === "number" ? model.max_tokens : null,
    tags: Array.isArray(model.tags) ? model.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6) : []
  };
}

async function loadVercelModelCatalog(baseUrl: string, requiredModelId: string, apiKey: string) {
  if (!apiKey) {
    return { models: [fallbackModel(requiredModelId)], status: "fallback" as const };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 }
    });
    if (!response.ok) throw new Error(`Model catalog returned ${response.status}.`);
    const payload = await response.json() as { data?: GatewayModelPayload[] };
    const models = (payload.data ?? [])
      .map(parseModel)
      .filter((model): model is GatewayModelOption => model !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
    if (!models.some((model) => model.id === requiredModelId)) {
      models.unshift(fallbackModel(requiredModelId));
    }
    if (models.length === 0) throw new Error("The gateway returned no language models.");
    return { models, status: "live" as const };
  } catch {
    return { models: [fallbackModel(requiredModelId)], status: "fallback" as const };
  }
}

async function readWorldConfiguration(): Promise<WorldConfiguration> {
  const rows = await db.select({ configuration: worlds.configuration })
    .from(worlds)
    .where(eq(worlds.id, DEMO_IDS.world))
    .limit(1);
  const configuration = rows[0]?.configuration;
  return isRecord(configuration) ? configuration as WorldConfiguration : {};
}

async function readWorldConfigurationSafely(): Promise<WorldConfiguration> {
  try {
    return await readWorldConfiguration();
  } catch {
    return {};
  }
}

function selectedModelFor(configuration: WorldConfiguration, environment: GatewayEnvironment) {
  return configuration.ai?.selectedModels?.[vercelGatewayId] || environment.defaultModel;
}

function activeGatewayFor(configuration: WorldConfiguration, environment: GatewayEnvironment) {
  return configuration.ai?.activeGatewayId
    || (environment.requestedProvider === "vercel-gateway" ? vercelGatewayId : null);
}

export async function getSafeAISettings(): Promise<SafeAISettings> {
  const environment = readGatewayEnvironment();
  const configuration = await readWorldConfigurationSafely();
  const selectedModelId = selectedModelFor(configuration, environment);
  const activeGatewayId = activeGatewayFor(configuration, environment);
  const configured = environment.apiKey.length > 0;
  const active = configured
    && environment.requestedProvider === "vercel-gateway"
    && activeGatewayId === vercelGatewayId;
  const catalog = await loadVercelModelCatalog(
    environment.baseUrl,
    selectedModelId,
    environment.apiKey
  );

  return {
    requestedProvider: environment.requestedProvider,
    activeAdapter: active ? "vercel-gateway" : "deterministic",
    activeGatewayId: active ? vercelGatewayId : null,
    activeModelId: active ? selectedModelId : null,
    gateways: [{
      id: vercelGatewayId,
      name: "Vercel AI Gateway",
      baseUrl: environment.baseUrl,
      configured,
      active,
      authentication: environment.authentication,
      catalogStatus: catalog.status,
      selectedModelId,
      activeModelId: active ? selectedModelId : null,
      models: catalog.models
    }]
  };
}

export async function selectGatewayModel(gatewayId: string, modelId: string) {
  if (gatewayId !== vercelGatewayId) throw new Error("Unknown AI gateway.");
  const environment = readGatewayEnvironment();
  const catalog = await loadVercelModelCatalog(
    environment.baseUrl,
    environment.defaultModel,
    environment.apiKey
  );
  if (!catalog.models.some((model) => model.id === modelId)) {
    throw new Error("The selected model is not available for this gateway.");
  }

  const configuration = await readWorldConfiguration();
  const previousAI = configuration.ai ?? {};
  const nextConfiguration: WorldConfiguration = {
    ...configuration,
    ai: {
      ...previousAI,
      version: 1,
      activeGatewayId: gatewayId,
      selectedModels: {
        ...previousAI.selectedModels,
        [gatewayId]: modelId
      }
    }
  };
  await db.update(worlds)
    .set({ configuration: nextConfiguration })
    .where(eq(worlds.id, DEMO_IDS.world));
  return getSafeAISettings();
}

export async function createConfiguredSceneAI(): Promise<SceneAI> {
  const environment = readGatewayEnvironment();
  const configuration = await readWorldConfigurationSafely();
  const selectedModelId = selectedModelFor(configuration, environment);
  const activeGatewayId = activeGatewayFor(configuration, environment);
  if (
    environment.requestedProvider === "vercel-gateway"
    && activeGatewayId === vercelGatewayId
    && environment.apiKey
  ) {
    return new VercelGatewaySceneAI({
      apiKey: environment.apiKey,
      baseUrl: environment.baseUrl,
      model: selectedModelId,
      timeoutMs: environment.timeoutMs
    });
  }
  return new DeterministicSceneAI();
}
