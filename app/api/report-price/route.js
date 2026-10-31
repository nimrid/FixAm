import { callModalReportPrice, isDemoMode } from "../../../lib/meta";
import { bodyTooLarge, rateLimited } from "../../../lib/limits";

// POST { domain, part, price_naira, market? } -> { ok, count }
export async function POST(req) {
  const limited = rateLimited(req, { name: "report-price", limit: 30 });
  if (limited) return limited;
  const tooBig = bodyTooLarge(req, 16_000);
  if (tooBig) return tooBig;
  try {
    const { domain, part, price_naira, market = "" } = await req.json();
    if (!domain || !part || !Number.isInteger(price_naira)) {
      return Response.json({ error: "domain, part, price_naira (int) required" }, { status: 400 });
    }
    if (isDemoMode()) return Response.json({ ok: true, count: 1, demo: true });
    try {
      const data = await callModalReportPrice({ domain, part, price_naira, market });
      return Response.json({ ok: true, count: data.count });
    } catch (err) {
      return Response.json({ error: String(err.message).slice(0, 200) }, { status: 502 });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
