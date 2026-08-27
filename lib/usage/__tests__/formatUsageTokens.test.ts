import { describe, expect, it } from "vitest";
import formatUsageTokens from "@/lib/usage/formatUsageTokens";

describe("formatUsageTokens", () => {
  it("lists input, cached and output tokens with thousands separators", () => {
    expect(
      formatUsageTokens({
        input_tokens: 12345,
        cached_input_tokens: 1000,
        output_tokens: 678,
        tool_call_count: 2,
      }),
    ).toBe("12,345 in · 1,000 cached · 678 out · 2 tools");
  });

  it("is a dash when nothing was metered, such as a fixed-price call", () => {
    expect(
      formatUsageTokens({
        input_tokens: 0,
        cached_input_tokens: 0,
        output_tokens: 0,
        tool_call_count: 0,
      }),
    ).toBe("-");
  });

  it("omits zero parts", () => {
    expect(
      formatUsageTokens({
        input_tokens: 10,
        cached_input_tokens: 0,
        output_tokens: 5,
        tool_call_count: 0,
      }),
    ).toBe("10 in · 5 out");
  });
});
