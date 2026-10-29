import { callTranscribe, isDemoMode } from "../../../lib/meta";

// POST { audioBase64, domain? } - 16kHz mono WAV data URL (browser converts via Web Audio).
const DEMO_TEXT = {
  gen: "My gen dey cough but e no catch, black smoke dey come out",
  okada: "Chain dey make noise, bike dey drag",
  solar: "Inverter dey beep then e cut light",
  phone: "Battery dey quick finish, e no dey charge",
  car: "Temperature don red, motor don overheat"
};

export async function POST(req) {
  try {
    const { audioBase64, domain = "gen" } = await req.json();
    if (!audioBase64) return Response.json({ error: "audioBase64 required" }, { status: 400 });
    if (isDemoMode()) {
      return Response.json({ demo: true, text: DEMO_TEXT[domain] || DEMO_TEXT.gen });
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
