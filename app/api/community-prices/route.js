import { callModalCommunity, isDemoMode } from "../../../lib/meta";

// GET /api/community-prices?domain=gen -> { prices: { part: { median, count } } }
export async function GET(req) {
  try {
    const domain = new URL(req.url).searchParams.get("domain") || "gen";
    if (isDemoMode()) return Response.json({ prices: {} });
    try {
      const prices = await callModalCommunity({ domain });
      return Response.json({ prices });
    } catch (err) {
      console.error("community-prices failed:", err.message);
      return Response.json({ prices: {} });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
