import { callSAMParts, callSparkConcepts, isDemoMode } from "../../../lib/meta";
import { conceptSystem } from "../../../lib/prompts";
import { getDomain } from "../../../lib/domains";
import { CAPS, bodyTooLarge, fieldTooLarge, rateLimited } from "../../../lib/limits";

// POST { imageBase64, symptom?, domain? } -> { parts, agentic, domain }
export async function POST(req) {
  const limited = rateLimited(req, { name: "segment", limit: 30 });
  if (limited) return limited;
  const tooBig = bodyTooLarge(req, 7_000_000);
  if (tooBig) return tooBig;
  try {
    const { imageBase64, symptom = "", domain: domainId = "gen" } = await req.json();
    if (!imageBase64) return Response.json({ error: "imageBase64 required" }, { status: 400 });
    const imgErr = fieldTooLarge(imageBase64, CAPS.imageChars, "Photo");
    if (imgErr) return Response.json({ error: imgErr }, { status: 413 });
    const D = getDomain(domainId);

    if (isDemoMode()) {
      return Response.json({ demo: true, agentic: false, domain: D.id, parts: mockParts(D.id) });
    }

    try {
      let concepts = D.samConcepts;
      let agentic = false;
      if (symptom.trim()) {
        try {
          concepts = await callSparkConcepts({ symptom, imageBase64, system: conceptSystem(D.id), vocab: D.conceptLabels });
          agentic = true;
        } catch (e) {
          console.error("concept router failed, using defaults:", e.message);
        }
      }
      const parts = await callSAMParts({ imageBase64, concepts });
      return Response.json({ demo: false, agentic, domain: D.id, parts });
    } catch (err) {
      console.error("segment live failed, falling back:", err.message);
      return Response.json({ demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160), agentic: false, domain: D.id, parts: mockParts(D.id) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

function mockParts(domainId) {
  if (domainId === "okada") {
    return [
      { label: "bike", box: [0.08, 0.2, 0.92, 0.85], confidence: 0.9 },
      { label: "engine", box: [0.35, 0.5, 0.6, 0.75], confidence: 0.72 },
      { label: "front wheel", box: [0.65, 0.45, 0.9, 0.85], confidence: 0.8 }
    ];
  }
  if (domainId === "solar") {
    return [
      { label: "panel", box: [0.1, 0.1, 0.9, 0.45], confidence: 0.88 },
      { label: "inverter", box: [0.15, 0.55, 0.5, 0.9], confidence: 0.7 },
      { label: "battery", box: [0.55, 0.55, 0.9, 0.9], confidence: 0.66 }
    ];
  }
  if (domainId === "phone") {
    return [
      { label: "phone", box: [0.2, 0.05, 0.8, 0.95], confidence: 0.92 },
      { label: "screen", box: [0.24, 0.1, 0.76, 0.8], confidence: 0.85 },
      { label: "port", box: [0.4, 0.88, 0.6, 0.95], confidence: 0.6 }
    ];
  }
  if (domainId === "car") {
    return [
      { label: "car", box: [0.05, 0.3, 0.95, 0.8], confidence: 0.9 },
      { label: "tyre", box: [0.1, 0.55, 0.3, 0.8], confidence: 0.78 },
      { label: "engine", box: [0.3, 0.35, 0.7, 0.6], confidence: 0.62 }
    ];
  }
  return [
    { label: "generator", box: [0.1, 0.11, 0.87, 0.92], confidence: 0.91 },
    { label: "fuel tank", box: [0.17, 0.18, 0.53, 0.48], confidence: 0.62 },
    { label: "control panel", box: [0.53, 0.27, 0.84, 0.58], confidence: 0.75 },
    { label: "engine", box: [0.17, 0.18, 0.83, 0.83], confidence: 0.74 }
  ];
}
