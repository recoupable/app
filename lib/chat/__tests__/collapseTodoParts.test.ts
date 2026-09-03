import { describe, expect, it } from "vitest";
import { collapseTodoParts } from "@/lib/chat/collapseTodoParts";

const todo = (n: number) => ({ type: "tool-todo_write", toolCallId: `t${n}` });
const bash = (n: number) => ({ type: "tool-bash", toolCallId: `b${n}` });

describe("collapseTodoParts", () => {
  it("passes a message with no todo_write through unchanged", () => {
    const parts = [bash(1), { type: "text" }];
    expect(collapseTodoParts(parts)).toBe(parts);
  });

  it("keeps the first todo_write position with the latest todo_write content", () => {
    expect(
      collapseTodoParts([todo(1), bash(1), todo(2), bash(2), todo(3)]),
    ).toEqual([todo(3), bash(1), bash(2)]);
  });

  it("leaves a single todo_write where it is", () => {
    expect(collapseTodoParts([bash(1), todo(1)])).toEqual([bash(1), todo(1)]);
  });
});
