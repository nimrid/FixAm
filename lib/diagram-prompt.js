// Domain-aware Muse Image prompt for the repair diagram.
// Kept separate from the route so the wording is unit-testable.
const SUBJECT = {
  gen: "small petrol generator",
  okada: "motorcycle (okada)",
  solar: "solar inverter and battery setup",
  phone: "smartphone",
  car: "car"
};

export function buildDiagramPrompt({ domain = "gen", diagnosis = "", part = "" } = {}) {
  const subject = SUBJECT[domain] || SUBJECT.gen;
  const cleanPart = String(part || "component").replace(/\s+/g, " ").trim().slice(0, 80) || "component";
  const cleanDiagnosis = String(diagnosis || "").replace(/\s+/g, " ").trim().slice(0, 200);
  const fault = cleanDiagnosis ? ` Fault: ${cleanDiagnosis}.` : "";
  return `Simple clean line diagram of a ${subject} ${cleanPart}, labeled with arrows, educational poster style.${fault}`;
}
