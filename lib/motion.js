// Motion check config — the single JS source of truth for which domains
// support motion, what SAM tracks, and how the clip should be filmed.
// modal_app.py mirrors MOTION_TRACKS (Python boundary; keep them in sync).
export const MOTION_DOMAINS = ["gen", "okada", "car"];

export const MOTION_CONFIG = {
  gen: {
    subjectLabel: "generator engine",
    samSubject: "engine",
    samSubjectFallback: "generator",
    samExhaust: "exhaust pipe",
    filmEn: "Film the gen from the side, engine and exhaust in frame, hold steady.",
    filmPg: "Film gen from side, make engine and exhaust show, hold am steady.",
    hintEn: "Record 3 seconds of the running gen to check shake and smoke.",
    hintPg: "Record 3 seconds of gen wey dey run, make we check shake and smoke."
  },
  okada: {
    subjectLabel: "motorcycle engine",
    samSubject: "motorcycle engine",
    samSubjectFallback: "motorcycle",
    samExhaust: "exhaust pipe",
    filmEn: "Film the bike from the side at idle, engine and exhaust in frame, hold steady. Do not record while riding.",
    filmPg: "Film bike from side as e dey idle, make engine and exhaust show, hold am steady. No record while you dey ride.",
    hintEn: "Record 3 seconds of the bike idling (not riding) to check shake and smoke.",
    hintPg: "Record 3 seconds as bike dey idle (no be for road), make we check shake and smoke."
  },
  car: {
    subjectLabel: "car engine",
    samSubject: "car engine",
    samSubjectFallback: "car",
    samExhaust: "exhaust pipe",
    filmEn: "Park safely, handbrake on. Film the open engine bay or the exhaust at idle, hold steady.",
    filmPg: "Park well, put handbrake. Film open engine or exhaust as e dey idle, hold am steady.",
    hintEn: "Record 3 seconds of the car idling (parked) to check shake and smoke.",
    hintPg: "Record 3 seconds as motor dey idle (park am), make we check shake and smoke."
  }
};

export function isMotionDomain(id) {
  return MOTION_DOMAINS.includes(id);
}

export function normalizeMotionDomain(id) {
  return isMotionDomain(id) ? id : "gen";
}

export function motionConfig(id) {
  return MOTION_CONFIG[normalizeMotionDomain(id)];
}
