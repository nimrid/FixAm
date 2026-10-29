// Shared offline mock for the motion check (used by analyze-video + motion-status).
export function mockMotion() {
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
