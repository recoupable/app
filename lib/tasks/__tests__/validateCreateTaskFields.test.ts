import { describe, expect, it } from "vitest";
import { validateCreateTaskFields } from "@/lib/tasks/validateCreateTaskFields";

describe("validateCreateTaskFields", () => {
  it("returns empty object when all fields valid", () => {
    expect(
      validateCreateTaskFields({
        title: "T",
        prompt: "P",
        schedule: "0 9 * * *",
        artistAccountId: "a1",
      }),
    ).toEqual({});
  });

  it("collects multiple field errors", () => {
    const err = validateCreateTaskFields({
      title: "  ",
      prompt: "",
      schedule: "bad",
      artistAccountId: "",
    });
    expect(err.title).toBeTruthy();
    expect(err.prompt).toBeTruthy();
    expect(err.schedule).toBeTruthy();
    expect(err.artist).toBeTruthy();
  });
});
