// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CreativeComparison from "../CreativeComparison";
import VideoComparisonLab from "../VideoComparisonLab";
import Playground from "../Playground";
import { videoFixtures } from "@/lib/intelligent-ui/playground/creative/videoFixtures";
import { audioFixtures } from "@/lib/intelligent-ui/playground/creative/audioFixtures";
import { creativeFixtures } from "@/lib/intelligent-ui/playground/creative/creativeFixtures";
const [square, circle] = videoFixtures;
const reference = () =>
  screen.queryByRole("textbox", {
    name: "Read-only local follow-up reference",
  }) as HTMLTextAreaElement | null;
const inspect = (label = square.label) => {
  fireEvent.click(screen.getByRole("button", { name: `Inspect ${label}` }));
  return screen.getByLabelText(label) as HTMLVideoElement;
};
const choose = (label = square.label) =>
  fireEvent.click(screen.getByRole("button", { name: `Choose ${label}` }));
const notes = (label = square.label) =>
  screen.getByRole("textbox", {
    name: `Notes for ${label}`,
  }) as HTMLTextAreaElement;
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("mounts accessible native controls only on Inspect, never autoplays or chooses on loading/play, and restores an explicit exact choice after reinspection", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const view = render(
    <CreativeComparison scope="video" assets={videoFixtures} />,
  );
  expect(document.querySelector("video")).toBeNull();
  const video = inspect();
  expect(video.controls).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.querySelector("track")).toBeNull();
  expect(
    document.getElementById(video.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toContain("No speech, music or sound");
  expect(video.autoplay).toBe(false);
  expect(video.getAttribute("preload")).toBe("metadata");
  const choice = screen.getByRole("button", {
    name: `Choose ${square.label}`,
  }) as HTMLButtonElement;
  expect(choice.disabled).toBe(true);
  fireEvent.loadedMetadata(video);
  expect(choice.disabled).toBe(true);
  fireEvent.canPlay(video);
  fireEvent.play(video);
  expect(reference()).toBeNull();
  expect(choice.getAttribute("aria-pressed")).toBe("false");
  choose();
  fireEvent.change(notes(), { target: { value: "Square note only" } });
  fireEvent.change(notes(circle.label), {
    target: { value: "Circle note only" },
  });
  const saved = JSON.parse(reference()!.value);
  expect(saved).toEqual({
    kind: "local-creative-reference",
    scope: "video",
    selection: square.ref,
  });
  expect(reference()!.value).not.toContain("/api/");
  view.unmount();
  render(<CreativeComparison scope="video" assets={videoFixtures} />);
  expect(document.querySelector("video")).toBeNull();
  expect(notes().value).toBe("Square note only");
  expect(notes(circle.label).value).toBe("Circle note only");
  expect(reference()).toBeNull();
  fireEvent.canPlay(inspect());
  expect(JSON.parse(reference()!.value)).toEqual(saved);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["processing", "unavailable", "withdrawn"] as const)(
  "invalidates %s video and requires fresh inspection on return",
  (status) => {
    const view = render(
      <CreativeComparison scope="video" assets={videoFixtures} />,
    );
    fireEvent.canPlay(inspect());
    choose();
    fireEvent.change(notes(), { target: { value: "Exact square" } });
    view.rerender(
      <CreativeComparison
        scope="video"
        assets={[{ ...square, status }, circle]}
      />,
    );
    expect(reference()).toBeNull();
    expect(document.querySelector("video")).toBeNull();
    expect(notes().value).toBe("Exact square");
    view.rerender(<CreativeComparison scope="video" assets={videoFixtures} />);
    expect(reference()).toBeNull();
    fireEvent.canPlay(inspect());
    expect(reference()).not.toBeNull();
  },
);
it("invalidates an actual media error and never transfers notes or selection to replacement bytes", () => {
  const view = render(
    <CreativeComparison scope="video" assets={videoFixtures} />,
  );
  fireEvent.canPlay(inspect());
  choose();
  fireEvent.change(notes(), { target: { value: "Original bytes" } });
  fireEvent.error(screen.getByLabelText(square.label));
  expect(reference()).toBeNull();
  expect(document.querySelector("video")).toBeNull();
  view.rerender(
    <CreativeComparison
      scope="video"
      assets={[
        { ...square, ref: { ...square.ref, version: "e".repeat(64) } },
        circle,
      ]}
    />,
  );
  expect(notes().value).toBe("");
  expect(reference()).toBeNull();
  expect(
    screen.queryByRole("button", { name: `Inspect ${square.label}` }),
  ).toBeNull();
});
it("isolates existing image and audio v1 drafts from the separate video scope", () => {
  const original = {
    version: 1,
    selection: creativeFixtures[0].ref,
    notes: [{ ref: creativeFixtures[0].ref, text: "Image note" }],
  };
  localStorage.setItem(
    "recoup:creative-fixture:v1:owned-wordmark-comparison",
    JSON.stringify(original),
  );
  const audioDraft = {
    version: 1,
    selection: audioFixtures[0].ref,
    notes: [{ ref: audioFixtures[0].ref, text: "Audio only" }],
  };
  localStorage.setItem(
    "recoup:creative-fixture:v1:original-section-study-comparison",
    JSON.stringify(audioDraft),
  );
  render(
    <CreativeComparison
      scope="original-motion-study-comparison"
      assets={videoFixtures}
    />,
  );
  fireEvent.canPlay(inspect());
  choose();
  expect(
    JSON.parse(
      localStorage.getItem(
        "recoup:creative-fixture:v1:owned-wordmark-comparison",
      )!,
    ),
  ).toEqual(original);
  expect(notes().value).toBe("");
  expect(
    JSON.parse(
      localStorage.getItem(
        "recoup:creative-fixture:v1:original-section-study-comparison",
      )!,
    ),
  ).toEqual(audioDraft);
});
it("gates the separate entry and host in production and without opt-in", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  const view = render(<Playground />);
  expect(screen.queryByRole("option", { name: "Video comparison" })).toBeNull();
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  view.rerender(<Playground />);
  fireEvent.change(screen.getByRole("combobox", { name: "Example" }), {
    target: { value: "video-comparison" },
  });
  expect(
    screen.getByRole("heading", {
      name: "Compare two original silent motion studies",
    }),
  ).toBeTruthy();
  expect(document.querySelector("video")).toBeNull();
  vi.stubEnv("NODE_ENV", "production");
  view.rerender(<VideoComparisonLab />);
  expect(screen.queryByRole("heading")).toBeNull();
});
