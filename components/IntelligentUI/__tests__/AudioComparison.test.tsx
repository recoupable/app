// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CreativeComparison from "../CreativeComparison";
import AudioComparisonLab from "../AudioComparisonLab";
import Playground from "../Playground";
import { audioFixtures } from "@/lib/intelligent-ui/playground/creative/audioFixtures";
import { creativeFixtures } from "@/lib/intelligent-ui/playground/creative/creativeFixtures";
const [intro, chorus] = audioFixtures;
const reference = () =>
  screen.queryByRole("textbox", {
    name: "Read-only local follow-up reference",
  }) as HTMLTextAreaElement | null;
const inspect = (label = intro.label) => {
  fireEvent.click(screen.getByRole("button", { name: `Inspect ${label}` }));
  return screen.getByLabelText(label) as HTMLAudioElement;
};
const choose = (label = intro.label) =>
  fireEvent.click(screen.getByRole("button", { name: `Choose ${label}` }));
const notes = (label = intro.label) =>
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
    <CreativeComparison scope="audio" assets={audioFixtures} />,
  );
  expect(document.querySelector("audio")).toBeNull();
  const audio = inspect();
  expect(audio.controls).toBe(true);
  expect(audio.autoplay).toBe(false);
  expect(audio.getAttribute("preload")).toBe("metadata");
  const choice = screen.getByRole("button", {
    name: `Choose ${intro.label}`,
  }) as HTMLButtonElement;
  expect(choice.disabled).toBe(true);
  fireEvent.loadedMetadata(audio);
  expect(choice.disabled).toBe(true);
  fireEvent.canPlay(audio);
  fireEvent.play(audio);
  expect(reference()).toBeNull();
  expect(choice.getAttribute("aria-pressed")).toBe("false");
  choose();
  fireEvent.change(notes(), { target: { value: "Intro note only" } });
  fireEvent.change(notes(chorus.label), {
    target: { value: "Chorus note only" },
  });
  const saved = JSON.parse(reference()!.value);
  expect(saved).toEqual({
    kind: "local-creative-reference",
    scope: "audio",
    selection: intro.ref,
  });
  expect(reference()!.value).not.toContain("/api/");
  view.unmount();
  render(<CreativeComparison scope="audio" assets={audioFixtures} />);
  expect(document.querySelector("audio")).toBeNull();
  expect(notes().value).toBe("Intro note only");
  expect(notes(chorus.label).value).toBe("Chorus note only");
  expect(reference()).toBeNull();
  fireEvent.canPlay(inspect());
  expect(JSON.parse(reference()!.value)).toEqual(saved);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["processing", "unavailable", "withdrawn"] as const)(
  "invalidates %s audio and requires fresh inspection on return",
  (status) => {
    const view = render(
      <CreativeComparison scope="audio" assets={audioFixtures} />,
    );
    fireEvent.canPlay(inspect());
    choose();
    fireEvent.change(notes(), { target: { value: "Exact intro" } });
    view.rerender(
      <CreativeComparison
        scope="audio"
        assets={[{ ...intro, status }, chorus]}
      />,
    );
    expect(reference()).toBeNull();
    expect(document.querySelector("audio")).toBeNull();
    expect(notes().value).toBe("Exact intro");
    view.rerender(<CreativeComparison scope="audio" assets={audioFixtures} />);
    expect(reference()).toBeNull();
    fireEvent.canPlay(inspect());
    expect(reference()).not.toBeNull();
  },
);
it("invalidates an actual media error and never transfers notes or selection to replacement bytes", () => {
  const view = render(
    <CreativeComparison scope="audio" assets={audioFixtures} />,
  );
  fireEvent.canPlay(inspect());
  choose();
  fireEvent.change(notes(), { target: { value: "Original bytes" } });
  fireEvent.error(screen.getByLabelText(intro.label));
  expect(reference()).toBeNull();
  expect(document.querySelector("audio")).toBeNull();
  view.rerender(
    <CreativeComparison
      scope="audio"
      assets={[
        { ...intro, ref: { ...intro.ref, version: "e".repeat(64) } },
        chorus,
      ]}
    />,
  );
  expect(notes().value).toBe("");
  expect(reference()).toBeNull();
  expect(
    screen.queryByRole("button", { name: `Inspect ${intro.label}` }),
  ).toBeNull();
});
it("isolates existing image v1 drafts from the separate audio scope", () => {
  const original = {
    version: 1,
    selection: creativeFixtures[0].ref,
    notes: [{ ref: creativeFixtures[0].ref, text: "Image note" }],
  };
  localStorage.setItem(
    "recoup:creative-fixture:v1:owned-wordmark-comparison",
    JSON.stringify(original),
  );
  render(
    <CreativeComparison
      scope="original-section-study-comparison"
      assets={audioFixtures}
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
});
it("gates the separate entry and host in production and without opt-in", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  const view = render(<Playground />);
  expect(screen.queryByRole("option", { name: "Audio comparison" })).toBeNull();
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  view.rerender(<Playground />);
  fireEvent.change(screen.getByRole("combobox", { name: "Example" }), {
    target: { value: "audio-comparison" },
  });
  expect(
    screen.getByRole("heading", {
      name: "Compare two sections of an original audio study",
    }),
  ).toBeTruthy();
  expect(document.querySelector("audio")).toBeNull();
  vi.stubEnv("NODE_ENV", "production");
  view.rerender(<AudioComparisonLab />);
  expect(screen.queryByRole("heading")).toBeNull();
});
