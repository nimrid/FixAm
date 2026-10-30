import { systemPrompt } from "../../../lib/prompts";
import { getDomain } from "../../../lib/domains";
import { callModalCommunity, callSparkDiagnosis, isDemoMode } from "../../../lib/meta";

// POST { imageBase64, symptom, lang, parts, domain? } -> strict-JSON diagnosis
export async function POST(req) {
  try {
    const body = await req.json();
    const { symptom = "", lang = "pidgin", parts = [], imageBase64 = null, domain: domainId = "gen" } = body;
    if (!symptom.trim()) return Response.json({ error: "symptom required" }, { status: 400 });
    const D = getDomain(domainId);
    const faults = D.faults;
    const prices = D.prices;

    if (isDemoMode()) {
      return Response.json(mockDiagnosis(symptom, lang, D));
    }

    // Ground Spark in live community medians so returned prices track reality.
    // Best-effort: diagnosis must never fail because of this fetch.
    let communityLine = "";
    try {
      const comm = await callModalCommunity({ domain: D.id });
      const entries = Object.entries(comm).map(([k, v]) => `${k} ₦${v.median} (${v.count} reports)`);
      if (entries.length) {
        communityLine = `\nLive community prices (medians of user reports, prefer over your own estimates): ${entries.join("; ")}.`;
      }
    } catch {
      communityLine = "";
    }

    const system = systemPrompt(D.id, lang) + (lang === "pidgin"
      ? "\nIf live community prices dey, use dem take set shop_cost_naira correct - no contradict dem."
      : "\nIf live community prices are provided, calibrate shop_cost_naira against them - never contradict them.");
    let parsed;
    try {
      parsed = await callSparkDiagnosis({
        system,
        symptom,
        parts,
        imageBase64,
        faultsJson: JSON.stringify(faults) + communityLine
      });
    } catch (err) {
      console.error("diagnose live failed, falling back:", err.message);
      return Response.json({ ...mockDiagnosis(symptom, lang, D), demo: false, fallback: true, fallback_reason: String(err.message).slice(0, 160) });
    }

    const needed = (parsed.needed_parts || []).map((raw) => {
      if (typeof raw !== "string") return raw;
      const norm = raw.toLowerCase().trim().replace(/[\s_]+/g, "-");
      const key = prices[norm] ? norm : (D.aliases[norm] || null);
      if (key && prices[key]) return { key, ...prices[key] };
      return { key: norm, name: raw, price_naira: null, market: "Ask market / Jiji" };
    });
    return Response.json({ ...parsed, needed_parts: needed, demo: false, domain: D.id });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

function mockDiagnosis(symptom, lang, D) {
  const s = (symptom || "").toLowerCase();
  const faults = D.faults;
  const prices = D.prices;
  // keyword router tuned per domain, falls back to first fault
  const rules = {
    gen: [
      ["white smoke", "white-smoke"], ["white smok", "white-smoke"],
      ["black smoke", "black-smoke"], ["black smok", "black-smoke"],
      ["no output", "no-output"], ["no light", "no-output"], ["no current", "no-output"],
      ["trip", "overload-trip"], ["overload", "overload-trip"], ["cut", "overload-trip"],
      ["silent", "no-start-silent"], ["nothing happen", "no-start-silent"], ["rope", "no-start-silent"]
    ],
    okada: [
      ["chain", "chain-noise"], ["noise", "chain-noise"], ["drag", "chain-noise"],
      ["brake", "brake-weak"], ["no catch brake", "brake-weak"],
      ["hot", "overheat-oil"], ["overheat", "overheat-oil"], ["oil", "overheat-oil"],
      ["flat", "flat-tube"], ["puncture", "flat-tube"], ["air dey comot", "flat-tube"],
      ["light", "no-light-okada"], ["lamp", "no-light-okada"], ["bulb", "no-light-okada"]
    ],
    solar: [
      ["beep", "beep-cutoff"], ["cut", "beep-cutoff"],
      ["no output", "no-output-solar"], ["no light", "no-output-solar"], ["fault", "no-output-solar"],
      ["drain", "battery-fast-drain"], ["quick finish", "battery-fast-drain"],
      ["no charge", "no-charge"], ["no dey charge", "no-charge"], ["shade", "no-charge"],
      ["hot", "inverter-hot"], ["overheat", "inverter-hot"], ["fan", "inverter-hot"],
      ["morning", "low-pv-morning"]
    ],
    phone: [
      ["charge", "no-charge-phone"], ["charging", "no-charge-phone"], ["cable", "no-charge-phone"],
      ["crack", "cracked-screen"], ["break", "cracked-screen"], ["screen", "cracked-screen"],
      ["hot", "overheat-phone"], ["heat", "overheat-phone"], ["swell", "overheat-phone"],
      ["full", "storage-full"], ["memory", "storage-full"], ["slow", "storage-full"],
      ["network", "no-network"], ["service", "no-network"], ["sim", "no-network"]
    ],
    car: [
      ["hot", "overheat-car"], ["temperature", "overheat-car"], ["red gauge", "overheat-car"], ["overheat", "overheat-car"],
      ["no start", "no-start-car"], ["no gree start", "no-start-car"], ["click", "no-start-car"], ["battery", "no-start-car"],
      ["brake", "brake-car"], ["grind", "brake-car"], ["pedal", "brake-car"],
      ["flat", "flat-tyre-car"], ["tyre", "flat-tyre-car"], ["puncture", "flat-tyre-car"], ["burst", "flat-tyre-car"],
      ["light", "dash-light"], ["dashboard", "dash-light"], ["warning", "dash-light"],
      ["noise", "noise-vibration"], ["shake", "noise-vibration"], ["vibrat", "noise-vibration"]
    ]
  };
  let fault = faults[0];
  for (const [kw, id] of (rules[D.id] || [])) {
    if (s.includes(kw)) {
      const hit = faults.find((f) => f.id === id);
      if (hit) { fault = hit; break; }
    }
  }
  const pidgin = lang === "pidgin";
  return {
    demo: true,
    domain: D.id,
    diagnosis_en: fault.diagnosis_en,
    diagnosis_pidgin: fault.diagnosis_pidgin,
    confidence: 0.8,
    steps_en: fault.steps_en,
    steps_pidgin: fault.steps_pidgin,
    tools: fault.tools,
    danger_en: fault.danger_en,
    danger_pidgin: fault.danger_pidgin,
    take_to_shop: fault.take_to_shop,
    shop_cost_naira: fault.typical_shop_cost_naira || 20000,
    needed_parts: (fault.needed_parts || []).map((key) => ({ key, ...prices[key] })),
    display_diagnosis: pidgin ? fault.diagnosis_pidgin : fault.diagnosis_en,
    display_steps: pidgin ? fault.steps_pidgin : fault.steps_en,
    display_danger: pidgin ? fault.danger_pidgin : fault.danger_en
  };
}
