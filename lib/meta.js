// Meta Model API client - LIVE wiring per dev.meta.ai/docs.
// Base URL: https://api.meta.ai/v1, auth: Bearer $MODEL_API_KEY
// Models: muse-spark-1.3 (chat+vision), sam-3.1 (Responses stream),
//         muse-image-1.0 (images/generations), muse-voice-transcribe-1.0 (asr/transcribe)

const BASE = process.env.META_MODEL_API_BASE || "https://api.meta.ai/v1";

export function getApiKey() {
  return process.env.MODEL_API_KEY || process.env.META_MODEL_API_KEY || "";
}

export function isDemoMode() {
  if (process.env.FIXAM_DEMO_MODE === "true") return true;
  if (process.env.FIXAM_DEMO_MODE === "false") return false;
  return !getApiKey();
}

function authHeaders() {
  const key = getApiKey();
  if (!key) throw new Error("MODEL_API_KEY missing. Add it to .env (see .env.example).");
  return { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
}

function withTimeout(ms) {
  return AbortSignal.timeout(ms);
}

// --- Muse Spark diagnosis (Chat Completions + vision + strict JSON schema) ---
const DIAGNOSIS_SCHEMA = {
  type: "object",
  properties: {
    diagnosis_en: { type: "string" },
    diagnosis_pidgin: { type: "string" },
    confidence: { type: "number" },
    steps_en: { type: "array", items: { type: "string" } },
    steps_pidgin: { type: "array", items: { type: "string" } },
    tools: { type: "array", items: { type: "string" } },
    needed_parts: { type: "array", items: { type: "string" } },
    danger_en: { type: "string" },
    danger_pidgin: { type: "string" },
    take_to_shop: { type: "boolean" },
    shop_cost_naira: { type: "number" }
  },
  required: [
    "diagnosis_en", "diagnosis_pidgin", "confidence", "steps_en",
    "steps_pidgin", "tools", "needed_parts", "danger_en", "danger_pidgin", "take_to_shop", "shop_cost_naira"
  ],
  additionalProperties: false
};

export async function callSparkDiagnosis({ system, symptom, parts, imageBase64, faultsJson }) {
  const model = process.env.META_MODEL_SPARK || "muse-spark-1.3";
  const userText = [
    `Symptom: ${symptom}`,
    `Visible parts (from SAM segmentation): ${parts?.length ? parts.map((p) => p.label).join(", ") : "unknown"}`,
    faultsJson ? `Known fault reference (use as grounding, you may go beyond it): ${faultsJson}` : "",
    "Return the diagnosis as JSON matching the schema."
  ].filter(Boolean).join("\n");

  const content = [{ type: "text", text: userText }];
  if (imageBase64) {
    content.push({ type: "image_url", image_url: { url: imageBase64 } });
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    signal: withTimeout(90000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content }
      ],
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: { name: "gen_diagnosis", strict: true, schema: DIAGNOSIS_SCHEMA }
      }
    })
  });
  if (!res.ok) throw new Error(`Spark ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Spark returned no content: " + JSON.stringify(data).slice(0, 300));
  return JSON.parse(raw);
}

// --- SAM 3.1 segmentation (Responses API, streamed special-token text) ---
// One request per noun phrase; returns boxes in 0-1 normalized coords.
const BOX_RE = /(\d+)<\|box;x1=(\d+);y1=(\d+);x2=(\d+);y2=(\d+);w=(\d+);h=(\d+)(?:;c=([\d.]+))?\|>/g;

export function parseSamLine(line) {
  const boxes = [];
  let m;
  BOX_RE.lastIndex = 0;
  while ((m = BOX_RE.exec(line)) !== null) {
    const [, id, x1, y1, x2, y2, w, h, c] = m;
    const W = Number(w), H = Number(h);
    boxes.push({
      id: Number(id),
      box: [Number(x1) / W, Number(y1) / H, Number(x2) / W, Number(y2) / H],
      confidence: c !== undefined ? Number(c) : 0.75
    });
  }
  return boxes;
}

async function samRequest({ imageBase64, concept }) {
  const res = await fetch(`${BASE}/responses`, {
    method: "POST",
    headers: authHeaders(),
    signal: withTimeout(90000),
    body: JSON.stringify({
      model: process.env.META_MODEL_SAM || "sam-3.1",
      stream: true,
      metadata: { include_confidence: "true" },
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: concept },
            { type: "input_image", image_url: imageBase64 }
          ]
        }
      ]
    })
  });
  if (!res.ok) throw new Error(`SAM ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);

  // Accumulate SSE response.output_text.delta payloads
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const chunks = buf.split("\n\n");
    buf = chunks.pop();
    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let evType = "";
      for (const ln of lines) {
        if (ln.startsWith("event:")) evType = ln.slice(6).trim();
        else if (ln.startsWith("data:")) {
          const payload = ln.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            const t = evt.type || evType;
            if (t === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
            else if (t === "response.output_text.done" && typeof evt.text === "string" && evt.text) text = evt.text;
            else if (t === "response.completed" && !text && evt.response) text = extractOutputText(evt.response);
          } catch { /* ignore partial frames */ }
        }
      }
    }
  }
  // Fallback: non-streamed JSON body (if server ignored stream flag)
  if (!text && buf.trim().startsWith("{")) {
    try {
      const data = JSON.parse(buf);
      text = extractOutputText(data);
    } catch { /* leave empty */ }
  }
  return text;
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const out = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if ((c.type === "output_text") && c.text) out.push(c.text);
    }
  }
  return out.join("\n");
}

// Concepts come from the domain registry (lib/domains.js): per-domain
// samConcepts, optionally re-routed by Spark via callSparkConcepts.
// Tuned live 2026-10-28 on a Tiger 2.5kVA photo: "gas tank" beats "fuel tank".
export async function callSAMParts({ imageBase64, concepts }) {
  if (!Array.isArray(concepts) || concepts.length === 0) throw new Error("callSAMParts: concepts required");
  const settled = await Promise.allSettled(
    concepts.map(async ({ concept, label }) => {
      const line = await samRequest({ imageBase64, concept });
      const boxes = parseSamLine(line);
      return boxes.map((b) => ({ label, box: b.box, confidence: b.confidence }));
    })
  );
  const parts = [];
  for (const s of settled) {
    if (s.status === "fulfilled") parts.push(...s.value);
  }
  // Best-first, cap at 8
  parts.sort((a, b) => b.confidence - a.confidence);
  return parts.slice(0, 8);
}


// --- Agentic concept router: Spark decides what SAM should segment ---
// vocab is required: the per-domain conceptLabels from lib/domains.js.

export async function callSparkConcepts({ symptom, imageBase64, system, vocab }) {
  if (!vocab || typeof vocab !== "object") throw new Error("callSparkConcepts: vocab (domain conceptLabels) required");
  const labels = vocab;
  const schema = {
    type: "object",
    properties: {
      concepts: {
        type: "array",
        items: { type: "string", enum: Object.keys(labels) },
        maxItems: 5
      }
    },
    required: ["concepts"],
    additionalProperties: false
  };
  const model = process.env.META_MODEL_SPARK || "muse-spark-1.3";
  const content = [{
    type: "text",
    text: `Symptom: ${symptom}\nPick 3-5 parts from the allowed list worth segmenting to diagnose this.`
  }];
  if (imageBase64) content.push({ type: "image_url", image_url: { url: imageBase64 } });
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    signal: withTimeout(60000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system || "Pick generator parts to segment from the allowed list. Reply with JSON only." },
        { role: "user", content }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: { name: "sam_concepts", strict: true, schema }
      }
    })
  });
  if (!res.ok) throw new Error(`Spark-concepts ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{"concepts":[]}');
  const anchor = Object.keys(labels)[0];
  const phrases = [...new Set([anchor, ...(parsed.concepts || [])])].slice(0, 6);
  return phrases.filter((p) => labels[p]).map((p) => ({ concept: p, label: labels[p] }));
}

// --- Muse Image (single-shot, OpenAI-compatible) ---
export async function callImageGen({ prompt }) {
  const model = process.env.META_MODEL_IMAGE || "muse-image-1.0";
  const res = await fetch(`${BASE}/images/generations`, {
    method: "POST",
    headers: authHeaders(),
    // 55s: stays inside Vercel Hobby's 60s function cap so a slow image
    // returns a graceful fallback instead of a platform-killed request.
    signal: withTimeout(55000),
    body: JSON.stringify({ model, prompt, size: "1024x1024" })
  });
  if (!res.ok) throw new Error(`Image ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  const data = await res.json();
  const item = data.data?.[0];
  if (!item) throw new Error("Image API returned no data");
  if (item.url) return item.url;
  if (item.b64_json) return `data:${imageMimeFromB64(item.b64_json)};base64,${item.b64_json}`;
  return null;
}

// Muse Image may return WebP bytes regardless of the requested format;
// label the data URL from the actual magic bytes, not an assumed PNG.
export function imageMimeFromB64(b64) {
  if (b64.startsWith("UklGR")) return "image/webp";
  if (b64.startsWith("/9j/")) return "image/jpeg";
  if (b64.startsWith("iVBOR")) return "image/png";
  return "image/png";
}

// --- Modal video pipeline (async: submit -> poll, Vercel-safe) ---
// Each Modal fastapi_endpoint gets its own URL, e.g.
//   https://<ws>--fixam-video-submit-clip.us-east.modal.run
// Prefer an explicit per-endpoint env var. Otherwise derive the sibling URL
// from MODAL_VIDEO_URL no matter which endpoint was pasted, by swapping the
// function slug (the segment after the last "--<app>-" prefix, or any known
// endpoint name anywhere in the host). Never return the pasted URL unchanged
// for a different kind — that silently called the wrong endpoint.
const MODAL_KINDS = ["submit-clip", "clip-result", "analyze-clip", "report-price", "community-prices", "clear-price"];
const MODAL_ENV_BY_KIND = {
  "submit-clip": "MODAL_SUBMIT_CLIP_URL",
  "clip-result": "MODAL_CLIP_RESULT_URL",
  "analyze-clip": "MODAL_ANALYZE_CLIP_URL",
  "report-price": "MODAL_REPORT_PRICE_URL",
  "community-prices": "MODAL_COMMUNITY_PRICES_URL",
  "clear-price": "MODAL_CLEAR_PRICE_URL"
};

export function modalEndpoint(kind) {
  if (!MODAL_KINDS.includes(kind)) throw new Error(`Unknown Modal endpoint kind: ${kind}`);
  const explicit = process.env[MODAL_ENV_BY_KIND[kind]];
  if (explicit) return explicit;
  const raw = process.env.MODAL_VIDEO_URL || "";
  if (!raw) {
    throw new Error(
      `Modal endpoint ${kind} missing. Set ${MODAL_ENV_BY_KIND[kind]} or MODAL_VIDEO_URL (any one deployed Modal endpoint URL) in .env. See .env.example.`
    );
  }
  let url;
  try { url = new URL(raw); } catch { throw new Error(`MODAL_VIDEO_URL is not a valid URL: ${raw.slice(0, 80)}`); }
  if (url.hostname.includes(kind)) return url.toString();
  for (const known of MODAL_KINDS) {
    if (url.hostname.includes(known)) {
      url.hostname = url.hostname.replace(known, kind);
      return url.toString();
    }
  }
  // Host like <ws>--fixam-video.<region>.modal.run (app slug, no function):
  // Modal function hosts are <ws>--<app>-<function>.<region>.modal.run.
  const m = url.hostname.match(/^(.+--[a-z0-9-]+?)(\.[a-z0-9-]+\.modal\.run)$/i);
  if (m) {
    url.hostname = `${m[1]}-${kind}${m[2]}`;
    return url.toString();
  }
  throw new Error(
    `Cannot derive Modal endpoint ${kind} from MODAL_VIDEO_URL (${url.hostname}). Set ${MODAL_ENV_BY_KIND[kind]} explicitly.`
  );
}

export function modalConfigured() {
  return Boolean(
    process.env.MODAL_VIDEO_URL ||
    MODAL_KINDS.some((k) => process.env[MODAL_ENV_BY_KIND[k]])
  );
}

function modalCreds() {
  const secret = process.env.FIXAM_MODAL_SECRET;
  if (!secret) throw new Error("FIXAM_MODAL_SECRET missing in .env.");
  const key = getApiKey();
  if (!key) throw new Error("MODEL_API_KEY missing. Add it to .env.");
  return { secret, key };
}

export async function callModalSubmit({ clipBase64, domain = "gen" }) {
  const { secret, key } = modalCreds();
  const res = await fetch(modalEndpoint("submit-clip"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: withTimeout(90000),
    body: JSON.stringify({ secret, video_b64: clipBase64, model_api_key: key, meta_base: BASE, domain })
  });
  if (!res.ok) throw new Error(`Modal submit ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  const data = await res.json();
  if (!data.ok || !data.call_id) throw new Error(`Modal submit: ${data.error || "no call_id"}`);
  return data.call_id;
}

export async function callModalResult({ callId }) {
  const { secret } = modalCreds();
  const res = await fetch(modalEndpoint("clip-result"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: withTimeout(30000),
    body: JSON.stringify({ secret, call_id: callId })
  });
  if (!res.ok) throw new Error(`Modal poll ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  const data = await res.json();
  if (!data.ok) throw new Error(`Modal poll: ${data.error || "unknown error"}`);
  return data; // {done:false} or {done:true, result}
}

// --- Community price learning (Modal Dict backend) ---
export async function callModalReportPrice({ domain, part, price_naira, market }) {
  const { secret } = modalCreds();
  const res = await fetch(modalEndpoint("report-price"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: withTimeout(30000),
    body: JSON.stringify({ secret, domain, part, price_naira, market: market || "" })
  });
  if (!res.ok) throw new Error(`Modal report ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  const data = await res.json();
  if (!data.ok) throw new Error(`Modal report: ${data.error || "unknown error"}`);
  return data; // {ok, count}
}

export async function callModalCommunity({ domain }) {
  const { secret } = modalCreds();
  const res = await fetch(modalEndpoint("community-prices"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: withTimeout(30000),
    body: JSON.stringify({ secret, domain })
  });
  if (!res.ok) throw new Error(`Modal community ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  const data = await res.json();
  if (!data.ok) throw new Error(`Modal community: ${data.error || "unknown error"}`);
  return data.prices || {};
}


// --- Spark motion verdict (keyframes + numeric tracks -> strict JSON) ---
const MOTION_SCHEMA = {
  type: "object",
  properties: {
    vibration_en: { type: "string" },
    vibration_pidgin: { type: "string" },
    vibration_level: { type: "string", enum: ["low", "normal", "high"] },
    smoke_en: { type: "string" },
    smoke_pidgin: { type: "string" },
    smoke_level: { type: "string", enum: ["none", "light", "heavy"] },
    confidence: { type: "number" },
    advice_en: { type: "string" },
    advice_pidgin: { type: "string" }
  },
  required: ["vibration_en", "vibration_pidgin", "vibration_level", "smoke_en", "smoke_pidgin", "smoke_level", "confidence", "advice_en", "advice_pidgin"],
  additionalProperties: false
};

export async function callSparkMotion({ system, metrics, keyframes }) {
  const model = process.env.META_MODEL_SPARK || "muse-spark-1.3";
  const content = [{
    type: "text",
    text: `SAM 3.1 video tracking metrics (JSON): ${JSON.stringify(metrics)}\nKeyframes attached. Judge vibration + exhaust smoke and return the verdict as JSON matching the schema.`
  }];
  for (const kf of (keyframes || []).slice(0, 3)) {
    content.push({ type: "image_url", image_url: { url: kf } });
  }
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    signal: withTimeout(90000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content }
      ],
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: { name: "motion_verdict", strict: true, schema: MOTION_SCHEMA }
      }
    })
  });
  if (!res.ok) throw new Error(`Spark-motion ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

// --- Muse Voice Transcribe (multipart, WAV 16kHz mono required) ---
// audioWavBase64: data URL or raw base64 of a 16-bit PCM WAV (browser converts first).
export async function callTranscribe({ audioWavBase64 }) {
  const key = getApiKey();
  if (!key) throw new Error("MODEL_API_KEY missing. Add it to .env.");
  const b64 = audioWavBase64.includes(",") ? audioWavBase64.split(",").pop() : audioWavBase64;
  const wavBuf = Buffer.from(b64, "base64");

  const form = new FormData();
  form.append(
    "request",
    new Blob(
      [JSON.stringify({ mode: "PUSH_TO_TALK", model: process.env.META_MODEL_TRANSCRIBE || "muse-voice-transcribe-1.0", audioEncoding: "WAV" })],
      { type: "application/json" }
    )
  );
  form.append("audio", new Blob([wavBuf], { type: "audio/wav" }), "speech.wav");

  const res = await fetch(`${BASE}/asr/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    signal: withTimeout(60000),
    body: form
  });
  if (!res.ok) throw new Error(`Transcribe ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  const data = await res.json();
  return data.transcript || "";
}
