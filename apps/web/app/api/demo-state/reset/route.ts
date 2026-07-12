import { internalError, json, readIdempotencyKey } from "@/lib/server/http";
import { resetPersistentDemo } from "@/lib/server/demo-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const key = readIdempotencyKey(request);
  if (!key.success) return json({ error: "A valid Idempotency-Key is required." }, { status: 400 });
  try {
    return json(await resetPersistentDemo());
  } catch {
    return internalError();
  }
}
