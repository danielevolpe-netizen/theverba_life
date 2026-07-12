import { getDatabaseStatus } from "@lifelang/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getDatabaseStatus();
    return Response.json(status, { status: 200 });
  } catch {
    return Response.json(
      { connected: false, error: "Database connection unavailable." },
      { status: 503 }
    );
  }
}
