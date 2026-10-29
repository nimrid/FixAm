import { mockMotion } from "../../../lib/motion-mock";
import { callModalSubmit, isDemoMode } from "../../../lib/meta";

// POST { clipBase64 } -> { call_id } (fast submit; client polls /api/motion-status).
// Submit failures fall back to an offline mock with fallback:true.
export async function POST(req) {
  try {
    const { clipBase64 } = await req.json();
    if (!clipBase64) return Response.json({ error: "clipBase64 required" }, { status: 400 });

    if (isDemoMode()) {
      return Response.json({ ...mockMotion(), demo: true, done: true });
    }

    try {
      const call_id = await callModalSubmit({ clipBase64 });
      return Response.json({ demo: false, done: false, call_id });
    } catch (err) {
      console.error("analyze-video submit failed, falling back:", err.message);
      return Response.json({ ...mockMotion(), demo: false, done: true, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
