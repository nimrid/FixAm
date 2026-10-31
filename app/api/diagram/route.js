import { callImageGen, isDemoMode } from "../../../lib/meta";
import { buildDiagramPrompt } from "../../../lib/diagram-prompt";
import { getDomain } from "../../../lib/domains";
import { bodyTooLarge, rateLimited } from "../../../lib/limits";

// POST { diagnosis, part, domain? } -> { imageUrl }
export async function POST(req) {
  const limited = rateLimited(req, { name: "diagram", limit: 20 });
  if (limited) return limited;
  const tooBig = bodyTooLarge(req, 64_000);
  if (tooBig) return tooBig;
  try {
    const { diagnosis = "", part = "component", domain: domainId = "gen" } = await req.json();
    const D = getDomain(domainId);
    if (isDemoMode()) {
      return Response.json({ demo: true, imageUrl: null, note: "Diagram generation skipped in demo mode." });
    }
    try {
      const prompt = buildDiagramPrompt({ domain: D.id, diagnosis, part });
      const imageUrl = await callImageGen({ prompt });
      return Response.json({ demo: false, domain: D.id, imageUrl });
    } catch (err) {
      console.error("diagram live failed:", err.message);
      return Response.json({ demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160), imageUrl: null });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
