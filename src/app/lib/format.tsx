export const fmt = {
  addr(a?: string) {
    if (!a) return "-";
    return a.slice(0, 6) + "…" + a.slice(-4);
  },
  eth(x: bigint) {
    return Number(x) / 1e18;
  }
};
