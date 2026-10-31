import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { modalEndpoint } from "../lib/meta.js";
import { buildDiagramPrompt } from "../lib/diagram-prompt.js";
import { healthSnapshot } from "../lib/health.js";

const ENV_KEYS = ["MODAL_VIDEO_URL", "MODAL_SUBMIT_CLIP_URL", "MODAL_CLIP_RESULT_URL", "MODAL_REPORT_PRICE_URL", "MODAL_COMMUNITY_PRICES_URL", "MODEL_API_KEY", "META_MODEL_API_KEY", "FIXAM_DEMO_MODE", "FIXAM_MODAL_SECRET"];
function withEnv(patch, fn) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, patch);
  try { return fn(); } finally {
    for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
  }
}

test("modalEndpoint derives siblings from any pasted endpoint, not just analyze-clip", () => {
  withEnv({ MODAL_VIDEO_URL: "https://ws--fixam-video-submit-clip.us-east.modal.run" }, () => {
    assert.match(modalEndpoint("clip-result"), /fixam-video-clip-result\./);
    assert.match(modalEndpoint("report-price"), /fixam-video-report-price\./);
  });
  withEnv({ MODAL_VIDEO_URL: "https://ws--fixam-video-community-prices.us-east.modal.run" }, () => {
    assert.match(modalEndpoint("submit-clip"), /fixam-video-submit-clip\./);
  });
});

test("modalEndpoint: explicit env wins and unknown hosts fail loudly", () => {
  withEnv({ MODAL_VIDEO_URL: "https://ws--fixam-video-submit-clip.us-east.modal.run", MODAL_CLIP_RESULT_URL: "https://example.com/poll" }, () => {
    assert.equal(modalEndpoint("clip-result"), "https://example.com/poll");
  });
  withEnv({ MODAL_VIDEO_URL: "https://example.com/hook" }, () => {
    assert.throws(() => modalEndpoint("submit-clip"), /Cannot derive|explicitly/);
  });
  withEnv({}, () => { assert.throws(() => modalEndpoint("submit-clip"), /missing/); });
});

test("needed_parts contract: prompts match the string-array schema", () => {
  const prompts = readFileSync(new URL("../lib/prompts.js", import.meta.url), "utf8");
  const meta = readFileSync(new URL("../lib/meta.js", import.meta.url), "utf8");
  assert.ok(!prompts.includes("array of {key}"), "prompts must not ask for {key} objects");
  assert.match(meta, /needed_parts: \{ type: "array", items: \{ type: "string" \} \}/);
});

test("diagram prompt is domain-aware, not generator-only", () => {
  assert.match(buildDiagramPrompt({ domain: "car", part: "radiator", diagnosis: "overheating" }), /car radiator/);
  assert.match(buildDiagramPrompt({ domain: "phone", part: "charging port" }), /smartphone charging port/);
  assert.ok(!buildDiagramPrompt({ domain: "car", part: "radiator" }).includes("petrol generator"));
});

test("motion supports gen, okada, car — with domain-specific SAM subjects", async () => {
  const { MOTION_DOMAINS, isMotionDomain, motionConfig } = await import("../lib/motion.js");
  assert.deepEqual(MOTION_DOMAINS, ["gen", "okada", "car"]);
  assert.equal(isMotionDomain("solar"), false);
  assert.equal(isMotionDomain("phone"), false);
  assert.equal(motionConfig("okada").samSubject, "motorcycle engine");
  assert.equal(motionConfig("car").samSubject, "car engine");
  assert.equal(motionConfig("gen").samSubject, "engine");
  // Python pipeline must mirror the JS config
  const py = readFileSync(new URL("../modal_app.py", import.meta.url), "utf8");
  for (const phrase of ["motorcycle engine", "car engine", "exhaust pipe"]) assert.ok(py.includes(phrase), `modal_app.py missing ${phrase}`);
  assert.match(py, /payload\.get\("domain"/);
});

test("motion verdict prompt and mock are domain-aware", async () => {
  const { motionSystem } = await import("../lib/prompts.js");
  const { mockMotion } = await import("../lib/motion-mock.js");
  assert.match(motionSystem("car"), /car engine/);
  assert.match(motionSystem("car"), /do-not-drive/);
  assert.match(motionSystem("okada"), /do-not-ride/);
  assert.ok(!motionSystem("car").includes("generator clip"));
  assert.equal(mockMotion("okada").domain, "okada");
  assert.match(mockMotion("car").verdict.advice_en, /do not drive/i);
  assert.match(mockMotion("okada").verdict.advice_en, /do not ride/i);
});

test("community prices: book seeds fill gaps, live medians win, seeds are not community", async () => {
  const { mergeCommunityPrices, seedPrices, isCommunityPrice } = await import("../lib/community.js");
  const book = { "spark-plug": { price_naira: 3500 }, "carburetor": { price_naira: 25000 } };
  const seeds = seedPrices(book);
  assert.equal(seeds["spark-plug"].source, "book");
  assert.equal(seeds["spark-plug"].count, 0);
  assert.equal(isCommunityPrice(seeds["spark-plug"]), false);
  const merged = mergeCommunityPrices(seeds, { "spark-plug": { median: 4200, count: 5 } });
  assert.equal(merged["spark-plug"].median, 4200);
  assert.equal(merged["spark-plug"].source, "community");
  assert.equal(isCommunityPrice(merged["spark-plug"]), true);
  assert.equal(merged["carburetor"].source, "book"); // untouched seed remains
});

test("rate limiter allows up to the limit then returns 429 with Retry-After", async () => {
  const { rateLimited, resetRateLimits } = await import("../lib/limits.js");
  resetRateLimits();
  const req = () => ({ headers: { get: (h) => (h === "x-forwarded-for" ? "1.2.3.4" : null) } });
  for (let i = 0; i < 3; i++) assert.equal(rateLimited(req(), { name: "t", limit: 3 }), null);
  const blocked = rateLimited(req(), { name: "t", limit: 3 });
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get("Retry-After"));
  resetRateLimits();
  assert.equal(rateLimited(req(), { name: "t", limit: 3 }), null);
});

test("input caps reject oversized fields", async () => {
  const { CAPS, fieldTooLarge } = await import("../lib/limits.js");
  assert.match(fieldTooLarge("x".repeat(CAPS.symptomChars + 1), CAPS.symptomChars, "Symptom"), /too large/);
  assert.equal(fieldTooLarge("ok", CAPS.symptomChars, "Symptom"), null);
});

test("dead exports stay removed", () => {
  const meta = readFileSync(new URL("../lib/meta.js", import.meta.url), "utf8");
  for (const dead of ["SAM_CONCEPTS", "CONCEPT_LABELS", "callModalVideo", "export async function callSAM("]) {
    assert.ok(!meta.includes(dead), `lib/meta.js still contains ${dead}`);
  }
});

test("image data URLs use the real format (Muse Image returns WebP bytes)", async () => {
  const { imageMimeFromB64 } = await import("../lib/meta.js");
  assert.equal(imageMimeFromB64("UklGRlbjBQBXRUJQVlA4WAoAAAAEAAAAPwYA"), "image/webp");
  assert.equal(imageMimeFromB64("/9j/4AAQSkZJRgABAQAAAQABAAD"), "image/jpeg");
  assert.equal(imageMimeFromB64("iVBORw0KGgoAAAANSUhEUgAAAAEA"), "image/png");
});

test("health snapshot never leaks secrets and reports demo without a key", () => {
  withEnv({ MODEL_API_KEY: "sk-secret-value", FIXAM_DEMO_MODE: "true", FIXAM_MODAL_SECRET: "modal-secret" }, () => {
    const h = healthSnapshot(process.env);
    assert.equal(h.status, "demo");
    assert.equal(h.api_key.present, true);
    assert.ok(!JSON.stringify(h).includes("sk-secret-value"));
    assert.ok(!JSON.stringify(h).includes("modal-secret"));
  });
  withEnv({}, () => { assert.equal(healthSnapshot(process.env).status, "demo"); });
});
