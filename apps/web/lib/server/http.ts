import "server-only";

import { IdempotencyKeySchema } from "@lifelang/contracts";

export const noStoreHeaders = { "Cache-Control": "no-store" };

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { ...noStoreHeaders, ...init?.headers }
  });
}

export function readIdempotencyKey(request: Request) {
  return IdempotencyKeySchema.safeParse(request.headers.get("idempotency-key"));
}

export function internalError() {
  return json({ error: "The request could not be completed." }, { status: 500 });
}
