import { MOTION_SYSTEM } from "../../../lib/prompts";
import { mockMotion } from "../../../lib/motion-mock";
import { callModalResult, callSparkMotion, isDemoMode } from "../../../lib/meta";

// GET /api/motion-status?id=<call_id> -> {done:false} | {done:true, metrics, verdict, keyframes}
export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    if (isDemoMode()) {
      return Response.json({ ...mockMotion(), demo: true, done: true });
    }

    try {
      const poll = await callModalResult({ callId: id });
      if (!poll.done) return Response.json({ demo: false, done: false });
      const pipe = poll.result;
      if (!pipe || !pipe.ok) throw new Error(pipe?.error || "Modal job failed");
      const metrics = {
        duration_s: pipe.duration_s,
        frames_seen: pipe.frames_seen,
        engine: { frames_tracked: pipe.engine.frames_tracked, present_ratio: pipe.engine.present_ratio, vibration: pipe.engine.vibration },
        exhaust: { frames_tracked: pipe.exhaust.frames_tracked, present_ratio: pipe.exhaust.present_ratio }
      };
      const verdict = await callSparkMotion({ system: MOTION_SYSTEM, metrics, keyframes: pipe.keyframes });
      return Response.json({ demo: false, done: true, metrics, verdict, keyframes: pipe.keyframes, warnings: pipe.warnings || [] });
    } catch (err) {
      console.error("motion-status failed, falling back:", err.message);
      return Response.json({ ...mockMotion(), demo: false, done: true, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
