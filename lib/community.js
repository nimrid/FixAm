// Community price merging: live Modal medians sit on top of the static
// price book. Seeds are honest — they are the book prices, labeled
// source:"book" with count 0, never presented as user reports. A part only
// becomes "community" once Modal has 3+ real reports (see modal_app.py).
// Pure functions (no domain-registry import) so they stay unit-testable;
// callers pass the domain's price book in.

export function seedPrices(pricesBook = {}) {
  const out = {};
  for (const [key, p] of Object.entries(pricesBook)) {
    if (p && typeof p.price_naira === "number") {
      out[key] = { median: p.price_naira, count: 0, source: "book" };
    }
  }
  return out;
}

// Live entries from Modal always win over book seeds.
export function mergeCommunityPrices(seeds = {}, live = {}) {
  const merged = { ...seeds };
  for (const [key, v] of Object.entries(live || {})) {
    if (v && typeof v.median === "number") {
      merged[key] = { median: v.median, count: v.count || 0, source: "community" };
    }
  }
  return merged;
}

export function isCommunityPrice(entry) {
  return Boolean(entry && entry.source === "community" && entry.count >= 3 && typeof entry.median === "number");
}
