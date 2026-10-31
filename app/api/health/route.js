import { healthSnapshot } from "../../../lib/health";

export const dynamic = "force-dynamic";

// GET /api/health -> live-vs-mock config snapshot (no secrets, no model calls).
export async function GET() {
  return Response.json(healthSnapshot());
}
