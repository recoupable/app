interface TokenCounts {
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  tool_call_count: number;
}

/** "12,345 in · 1,000 cached · 678 out · 2 tools"; zero parts dropped; a dash when nothing was metered. */
const formatUsageTokens = (counts: TokenCounts): string => {
  const parts = [
    [counts.input_tokens, "in"],
    [counts.cached_input_tokens, "cached"],
    [counts.output_tokens, "out"],
    [counts.tool_call_count, "tools"],
  ] as const;
  const shown = parts
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${n.toLocaleString("en-US")} ${label}`);
  return shown.length ? shown.join(" · ") : "-";
};

export default formatUsageTokens;
