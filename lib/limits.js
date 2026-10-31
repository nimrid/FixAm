// Input caps + in-memory per-IP rate limiting for API routes.
// Note: the limiter is per serverless instance (best-effort abuse brake,
// not a distributed quota). Caps fail closed with 413/400 before any
// model or Modal call is made.

export const CAPS = {
  imageChars: 6_000_000,   // downscaled 1280px JPEG is well under 1M chars
  clipChars: 16_000_000,   // ~10MB clip as base64 (~13.3M chars) + margin
  audioChars: 6_000_000,
  symptomChars: 600,
  textChars: 500
};

const buckets = new Map(); // key -> { count, resetAt }

export function clientKey(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

// Returns a 429 Response when over the limit, otherwise null.
export function rateLimited(req, { name, limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const key = `${name}:${clientKey(req)}`;
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  if (buckets.size > 5000) buckets.clear(); // crude memory bound
  if (b.count > limit) {
    const retry = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return Response.json(
      { error: "Too many requests. Please wait a bit and try again." },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }
  return null;
}

export function resetRateLimits() { buckets.clear(); }

// Early reject on declared body size, before parsing JSON.
export function bodyTooLarge(req, maxBytes) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) {
    return Response.json({ error: "Request too large." }, { status: 413 });
  }
  return null;
}

// Validate a base64/data-URL string field. Returns an error string or null.
export function fieldTooLarge(value, maxChars, label) {
  if (typeof value !== "string") return null;
  if (value.length > maxChars) return `${label} too large.`;
  return null;
}
