// Config health snapshot. Never returns secret values — only booleans,
// model ids, and Modal hostnames. Does not call any model (no spend).
import { getApiKey, isDemoMode, modalConfigured, modalEndpoint } from "./meta.js";

const MODAL_KINDS = ["submit-clip", "clip-result", "report-price", "community-prices"];

function hostOf(kind) {
  try { return new URL(modalEndpoint(kind)).hostname; } catch { return null; }
}

export function healthSnapshot(env = process.env) {
  const demo = isDemoMode();
  const hasKey = Boolean(getApiKey());
  const keyVar = env.MODEL_API_KEY ? "MODEL_API_KEY" : env.META_MODEL_API_KEY ? "META_MODEL_API_KEY" : null;
  const modalHosts = {};
  for (const k of MODAL_KINDS) modalHosts[k] = hostOf(k);
  const modalOk = modalConfigured() && Boolean(env.FIXAM_MODAL_SECRET) && Object.values(modalHosts).every(Boolean);
  return {
    ok: true,
    status: demo ? "demo" : hasKey ? "configured" : "missing_key",
    demo_mode: demo,
    demo_mode_source: env.FIXAM_DEMO_MODE === "true" ? "FIXAM_DEMO_MODE=true"
      : env.FIXAM_DEMO_MODE === "false" ? "FIXAM_DEMO_MODE=false"
      : hasKey ? "implicit (key present)" : "implicit (no API key)",
    api_key: { present: hasKey, env_var: keyVar },
    models: {
      spark: env.META_MODEL_SPARK || "muse-spark-1.3",
      sam: env.META_MODEL_SAM || "sam-3.1",
      image: env.META_MODEL_IMAGE || "muse-image-1.0",
      transcribe: env.META_MODEL_TRANSCRIBE || "muse-voice-transcribe-1.0",
      base: env.META_MODEL_API_BASE || "https://api.meta.ai/v1"
    },
    modal: {
      configured: modalOk,
      secret_present: Boolean(env.FIXAM_MODAL_SECRET),
      hosts: modalHosts
    },
    note: demo
      ? "Demo mode: every route serves local mocks. Set FIXAM_DEMO_MODE=false and add the API key to go live."
      : "Configured does not prove live: models are not probed (no spend). Watch for fallback:true in route responses."
  };
}
