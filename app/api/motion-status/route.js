import { motionSystem } from "../../../lib/prompts";
import { mockMotion } from "../../../lib/motion-mock";
import { motionConfig, normalizeMotionDomain } from "../../../lib/motion";
import { callModalResult, callSparkMotion, isDemoMode } from "../../../lib/meta";
import { rateLimited } from "../../../lib/limits";

// GET /api/motion-status?id=<call_id>&domain=<gen|okada|car>
// The Modal result carries the domain it actually tracked; the query param
// is the fallback for jobs submitted before domain threading existed.
export async function GET(req) {
  const limited = rateLimited(req, { name: "motion-status", limit: 180 });
  if (limited) return limited;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const domain = normalizeMotionDomain(url.searchParams.get("domain") || "gen");
  try {
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    if (isDemoMode()) {
      return Response.json({ ...mockMotion(domain), demo: true, done: true });
    }

    try {
      const poll = await callModalResult({ callId: id });
      if (!poll.done) return Response.json({ demo: false, done: false, domain });
      const pipe = poll.result;
      if (!pipe || !pipe.ok) throw new Error(pipe?.error || "Modal job failed");
      const trackedDomain = normalizeMotionDomain(pipe.domain || domain);
      const metrics = {
        duration_s: pipe.duration_s,
        frames_seen: pipe.frames_seen,
        subject: pipe.subject || motionConfig(trackedDomain).subjectLabel,
        subject_concept: pipe.subject_concept || null,
        engine: { frames_tracked: pipe.engine.frames_tracked, present_ratio: pipe.engine.present_ratio, vibration: pipe.engine.vibration },
        exhaust: { frames_tracked: pipe.exhaust.frames_tracked, present_ratio: pipe.exhaust.present_ratio }
      };
      const verdict = await callSparkMotion({ system: motionSystem(trackedDomain), metrics, keyframes: pipe.keyframes });
      return Response.json({ demo: false, done: true, domain: trackedDomain, metrics, verdict, keyframes: pipe.keyframes, warnings: pipe.warnings || [] });
    } catch (err) {
      console.error("motion-status failed, falling back:", err.message);
      return Response.json({ ...mockMotion(domain), demo: false, done: true, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
