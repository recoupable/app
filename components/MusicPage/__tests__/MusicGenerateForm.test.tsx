// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MusicGenerateForm from "@/components/MusicPage/MusicGenerateForm";
import { useCreateMusicGeneration } from "@/hooks/useCreateMusicGeneration";

vi.mock("@/hooks/useCreateMusicGeneration", () => ({
  useCreateMusicGeneration: vi.fn(),
}));

const generate = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useCreateMusicGeneration).mockReturnValue({ generate, isPending });
  render(<MusicGenerateForm />);
};

const fill = () => {
  fireEvent.change(screen.getByLabelText("Prompt"), {
    target: { value: "Genre: acoustic pop." },
  });
  fireEvent.change(screen.getByLabelText("Lyrics"), {
    target: { value: "[verse]\nMorning light" },
  });
};

describe("MusicGenerateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cannot generate until both prompt and lyrics are filled", () => {
    setup();

    const button = screen.getByRole("button", { name: "Generate" });
    expect(button.hasAttribute("disabled")).toBe(true);

    fill();

    expect(screen.getByRole("button", { name: "Generate" }).hasAttribute("disabled")).toBe(
      false,
    );
  });

  it("quotes the price as an upper bound, in dollars only", () => {
    // "Up to", because the API charges for the audio fal actually produced and
    // the model routinely stops short (recoupable/api#853). A fixed "Costs"
    // would overstate what most generations are billed.
    setup();

    expect(screen.getByText(/Up to \$0\.12 for 60s\./)).toBeDefined();
    expect(screen.getByText(/charged for the audio actually generated/i)).toBeDefined();
  });

  it("sends the documented defaults and omits a blank seed", () => {
    setup();
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(generate).toHaveBeenCalledWith({
      prompt: "Genre: acoustic pop.",
      lyrics: "[verse]\nMorning light",
      duration: 60,
      num_inference_steps: 30,
      guidance_scale: 1.7,
    });
  });

  it("keeps Additional Settings collapsed until asked", () => {
    setup();

    expect(screen.queryByLabelText("Duration")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Additional Settings/i }));

    expect(screen.getByLabelText("Duration")).toBeDefined();
    expect(screen.getByLabelText("Seed")).toBeDefined();
    expect(screen.getByLabelText("Num Inference Steps")).toBeDefined();
    expect(screen.getByLabelText("Guidance Scale")).toBeDefined();
  });

  it("reprices when the duration slider moves", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Additional Settings/i }));

    fireEvent.change(screen.getByLabelText("Duration"), { target: { value: "120" } });

    expect(screen.getByText(/Up to \$0\.24 for 120s\./)).toBeDefined();
  });

  it("fills the seed from the randomize button", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Additional Settings/i }));

    fireEvent.click(screen.getByRole("button", { name: "Randomize seed" }));

    expect((screen.getByLabelText("Seed") as HTMLInputElement).value).not.toBe("");
  });

  it("returns a slider to its documented default via reset", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Additional Settings/i }));

    fireEvent.change(screen.getByLabelText("Duration"), { target: { value: "200" } });
    fireEvent.click(screen.getByRole("button", { name: /Reset Duration to default/i }));

    expect((screen.getByLabelText("Duration") as HTMLInputElement).value).toBe("60");
  });

  it("disables Generate while one is already in flight", () => {
    setup(true);
    fill();

    expect(screen.getByRole("button", { name: "Generating" }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});
