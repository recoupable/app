import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { trackUpgradePromptShown } from "@/lib/upgrade/trackUpgradePromptShown";
import { trackUpgradeClicked } from "@/lib/upgrade/trackUpgradeClicked";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));

describe("upgrade prompt events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upgrade_prompt_shown carries the trigger only", () => {
    trackUpgradePromptShown({ trigger: "credits_low" });
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "credits_low" });
  });

  it("upgrade_clicked carries the trigger and the account id, never an email", () => {
    trackUpgradeClicked({ trigger: "credits_exhausted", accountId: "acc-1" });
    expect(trackEvent).toHaveBeenCalledWith("upgrade_clicked", {
      trigger: "credits_exhausted",
      account_id: "acc-1",
    });
  });
});
