import { internalError, json } from "@/lib/server/http";
import { loadPersistentDemoState } from "@/lib/server/demo-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json(await loadPersistentDemoState());
  } catch {
    return internalError();
  }
}
