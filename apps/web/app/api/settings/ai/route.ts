import { getSafeAISettings } from "@/lib/server/ai-settings";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(getSafeAISettings());
}
