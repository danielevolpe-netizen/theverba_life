import { ProfileUpdateRequestSchema } from "@lifelang/contracts";
import { internalError, json, readIdempotencyKey } from "@/lib/server/http";
import { updatePersistentProfile } from "@/lib/server/demo-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const key = readIdempotencyKey(request);
  if (!key.success) return json({ error: "A valid Idempotency-Key is required." }, { status: 400 });
  const body = ProfileUpdateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return json({ error: "Invalid profile payload." }, { status: 400 });
  try {
    return json(await updatePersistentProfile(body.data));
  } catch {
    return internalError();
  }
}
