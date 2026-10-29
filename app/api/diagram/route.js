import { callImageGen, isDemoMode } from "../../../lib/meta";

// POST { diagnosis, part } -> { imageUrl }
export async function POST(req) {
  try {
    const { diagnosis = "generator carburetor", part = "carburetor" } = await req.json();
    if (isDemoMode()) {
      return Response.json({ demo: true, imageUrl: null, note: "Diagram generation skipped in demo mode. Wire Muse Image here." });
    }
    try {
      const imageUrl = await callImageGen({ prompt: `Simple clean line diagram of a small petrol generator ${part}, labeled with arrow, educational poster style. Fault: ${diagnosis}.` });
      return Response.json({ demo: false, imageUrl });
    } catch (err) {
      console.error("diagram live failed:", err.message);
      return Response.json({ demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160), imageUrl: null });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
