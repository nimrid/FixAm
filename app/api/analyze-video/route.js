import { MOTION_SYSTEM } from "../../../lib/prompts";
import { callModalVideo, callSparkMotion, isDemoMode } from "../../../lib/meta";

// POST { clipBase64 } -> { metrics, verdict, keyframes }
// Modal runs the heavy video pipeline; Spark gives the final verdict.
// Any failure falls back to an offline mock with fallback:true.
export async function POST(req) {
  try {
    const { clipBase64 } = await req.json();
    if (!clipBase64) return Response.json({ error: "clipBase64 required" }, { status: 400 });

    if (isDemoMode()) {
      return Response.json({ ...mockMotion(), demo: true });
    }

    try {
      const pipe = await callModalVideo({ clipBase64 });
      const metrics = {
        duration_s: pipe.duration_s,
        frames_seen: pipe.frames_seen,
        engine: { frames_tracked: pipe.engine.frames_tracked, present_ratio: pipe.engine.present_ratio, vibration: pipe.engine.vibration },
        exhaust: { frames_tracked: pipe.exhaust.frames_tracked, present_ratio: pipe.exhaust.present_ratio }
      };
      const verdict = await callSparkMotion({ system: MOTION_SYSTEM, metrics, keyframes: pipe.keyframes });
      return Response.json({ demo: false, metrics, verdict, keyframes: pipe.keyframes, warnings: pipe.warnings || [] });
    } catch (err) {
      console.error("analyze-video live failed, falling back:", err.message);
      return Response.json({ ...mockMotion(), demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

function mockMotion() {
  return {
    metrics: {
      duration_s: 3.0,
      frames_seen: 30,
      engine: { frames_tracked: 28, present_ratio: 0.93, vibration: { frames_tracked: 28, index: 0.031, verdict: "high", series: [0.012, 0.009, 0.028, 0.011, 0.01, 0.045, 0.013, 0.009, 0.012, 0.052, 0.014, 0.011, 0.01, 0.038, 0.012, 0.009, 0.015, 0.061, 0.013, 0.01, 0.011, 0.042, 0.014, 0.009, 0.012, 0.055, 0.013, 0.011, 0.01] } },
      exhaust: { frames_tracked: 22, present_ratio: 0.73 }
    },
    verdict: {
      vibration_en: "Engine shake is higher than a healthy idle. Suspect loose mounting bolts or a misfire.",
      vibration_pidgin: "Engine dey shake pass normal. Mount bolt fit don loose, or fire no dey complete.",
      vibration_level: "high",
      smoke_en: "Light grey haze at the exhaust, consistent with slightly rich fuel mixture.",
      smoke_pidgin: "Small grey smoke for exhaust, fuel small pass air.",
      smoke_level: "light",
      confidence: 0.78,
      advice_en: "Switch off, check the 4 mounting bolts and the rubber feet. Then clean the air filter.",
      advice_pidgin: "Off am, check the 4 mount bolts and rubber leg. Then clean air filter."
    },
    keyframes: [],
    warnings: []
  };
}
