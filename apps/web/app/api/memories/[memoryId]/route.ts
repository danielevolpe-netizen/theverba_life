import { MemoryCorrectionRequestSchema } from "@lifelang/contracts";
import { correctPersistentMemory } from "@/lib/server/demo-service";
import { internalError, json, readIdempotencyKey } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ memoryId: string }> }) {
  const { memoryId } = await context.params;
  const key = readIdempotencyKey(request);
  if (!key.success) return json({ error: "A valid Idempotency-Key is required." }, { status: 400 });
  const body = MemoryCorrectionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return json({ error: "Invalid memory correction." }, { status: 400 });
  try {
    return json(await correctPersistentMemory(memoryId, body.data.content, key.data));
  } catch {
    return internalError();
  }
}
