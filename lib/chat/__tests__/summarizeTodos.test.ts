import { describe, expect, it } from "vitest";
import { summarizeTodos } from "@/lib/chat/summarizeTodos";

describe("summarizeTodos", () => {
  it("counts completed against total and names the active item", () => {
    expect(
      summarizeTodos([
        { content: "Generate the song", status: "completed" },
        { content: "Transcribe", status: "completed" },
        { content: "Mux the audio", activeForm: "Muxing audio", status: "in_progress" },
        { content: "Analyze the render", status: "pending" },
      ]),
    ).toEqual({ completed: 2, total: 4, current: "Muxing audio" });
  });

  it("falls back to content when activeForm is absent", () => {
    expect(summarizeTodos([{ content: "Mux the audio", status: "in_progress" }]).current).toBe(
      "Mux the audio",
    );
  });

  it("reports no current item when nothing is in progress", () => {
    expect(summarizeTodos([{ content: "a", status: "completed" }])).toEqual({
      completed: 1,
      total: 1,
      current: undefined,
    });
  });

  it("handles an empty list", () => {
    expect(summarizeTodos([])).toEqual({ completed: 0, total: 0, current: undefined });
  });
});
