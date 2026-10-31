import { mockMotion } from "../../../lib/motion-mock";
import { isMotionDomain, normalizeMotionDomain } from "../../../lib/motion";
import { callModalSubmit, isDemoMode } from "../../../lib/meta";
import { CAPS, bodyTooLarge, fieldTooLarge, rateLimited } from "../../../lib/limits";

// POST { clipBase64, domain? } -> { call_id, domain } (client polls /api/motion-status).
// Motion is supported for gen, okada, and car. Other domains are rejected
// explicitly instead of silently analyzing the clip as a generator.
export async function POST(req) {
  const limited = rateLimited(req, { name: "analyze-video", limit: 10 });
  if (limited) return limited;
  const tooBig = bodyTooLarge(req, 17_000_000);
  if (tooBig) return tooBig;
  try {
    const { clipBase64, domain: rawDomain = "gen" } = await req.json();
    if (!clipBase64) return Response.json({ error: "clipBase64 required" }, { status: 400 });
    const clipErr = fieldTooLarge(clipBase64, CAPS.clipChars, "Clip");
    if (clipErr) return Response.json({ error: clipErr }, { status: 413 });
    if (!isMotionDomain(rawDomain)) {
      return Response.json({ error: `Motion check is not available for ${rawDomain}. Use gen, okada, or car.` }, { status: 400 });
    }
    const domain = normalizeMotionDomain(rawDomain);

    if (isDemoMode()) {
      return Response.json({ ...mockMotion(domain), demo: true, done: true });
    }

    try {
      const call_id = await callModalSubmit({ clipBase64, domain });
      return Response.json({ demo: false, done: false, call_id, domain });
    } catch (err) {
      console.error("analyze-video submit failed, falling back:", err.message);
      return Response.json({ ...mockMotion(domain), demo: false, done: true, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
