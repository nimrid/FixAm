import { callTranscribe, isDemoMode } from "../../../lib/meta";

// POST { audioBase64 } - 16kHz mono WAV data URL (browser converts via Web Audio).
// Accepts legacy { audioBase64 } as raw recording only in demo mode.
export async function POST(req) {
  try {
    const { audioBase64 } = await req.json();
    if (!audioBase64) return Response.json({ error: "audioBase64 required" }, { status: 400 });
    if (isDemoMode()) {
      return Response.json({ demo: true, text: "My gen dey cough but e no catch, black smoke dey come out" });
    }
    try {
      const text = await callTranscribe({ audioWavBase64: audioBase64 });
      return Response.json({ demo: false, text });
    } catch (err) {
      console.error("transcribe live failed:", err.message);
      return Response.json({ demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160), text: "" });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
