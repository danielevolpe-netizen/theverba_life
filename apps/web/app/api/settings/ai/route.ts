import { AISettingsUpdateRequestSchema } from "@lifelang/contracts";
import { getSafeAISettings, selectGatewayModel } from "@/lib/server/ai-settings";
import { internalError, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(await getSafeAISettings());
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const input = AISettingsUpdateRequestSchema.safeParse(body);
    if (!input.success) return json({ error: "Invalid gateway model selection." }, { status: 400 });
    return json(await selectGatewayModel(input.data.gatewayId, input.data.modelId));
  } catch (error) {
    if (error instanceof Error && (
      error.message === "Unknown AI gateway."
      || error.message === "The selected model is not available for this gateway."
    )) {
      return json({ error: error.message }, { status: 400 });
    }
    return internalError();
  }
}
