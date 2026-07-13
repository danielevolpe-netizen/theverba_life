import { SceneTurnRequestSchema } from "@lifelang/contracts";
import { internalError, json, readIdempotencyKey } from "@/lib/server/http";
import { DEMO_IDS, submitPersistentTurn } from "@/lib/server/demo-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ sceneId: string }> }) {
  const { sceneId } = await context.params;
  if (sceneId !== DEMO_IDS.scene) return json({ error: "Scene not found." }, { status: 404 });
  const key = readIdempotencyKey(request);
  if (!key.success) return json({ error: "A valid Idempotency-Key is required." }, { status: 400 });
  const body = SceneTurnRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return json({ error: "Invalid scene turn." }, { status: 400 });
  try {
    return json(await submitPersistentTurn(body.data.content, key.data));
  } catch (error) {
    console.error("Scene turn failed.", error);
    return internalError();
  }
}
