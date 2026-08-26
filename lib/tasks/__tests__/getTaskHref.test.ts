import { describe, expect, it } from "vitest";
import { getTaskHref } from "@/lib/tasks/getTaskHref";

describe("getTaskHref", () => {
  it("points at the task page (chat#2006 item 8)", () => {
    expect(getTaskHref("4bed3d04-5334-4476-b4cd-5a670ab6afed")).toBe(
      "/tasks/4bed3d04-5334-4476-b4cd-5a670ab6afed",
    );
  });
});
