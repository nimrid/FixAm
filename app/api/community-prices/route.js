import { callModalCommunity, isDemoMode } from "../../../lib/meta";
import { mergeCommunityPrices, seedPrices } from "../../../lib/community";
import { getDomain } from "../../../lib/domains";
import { rateLimited } from "../../../lib/limits";

// GET /api/community-prices?domain=gen
// -> { prices: { part: { median, count, source } }, seeded: bool }
// Book prices seed the response so it is never empty on a cold start;
// live Modal medians (3+ reports) override seeds and are the only entries
// marked source:"community".
export async function GET(req) {
  const limited = rateLimited(req, { name: "community-prices", limit: 60 });
  if (limited) return limited;
  try {
    const D = getDomain(new URL(req.url).searchParams.get("domain") || "gen");
    const domain = D.id;
    const seeds = seedPrices(D.prices);
    if (isDemoMode()) return Response.json({ prices: seeds, seeded: true, domain });
    try {
      const live = await callModalCommunity({ domain });
      const prices = mergeCommunityPrices(seeds, live);
      return Response.json({ prices, seeded: Object.keys(live || {}).length === 0, domain });
    } catch (err) {
      console.error("community-prices failed, serving book seeds:", err.message);
      return Response.json({ prices: seeds, seeded: true, domain });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
