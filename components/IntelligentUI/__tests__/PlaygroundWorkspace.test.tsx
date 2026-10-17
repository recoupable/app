// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { playgroundScenarios } from "@/lib/intelligent-ui/playground/scenarios";
import { conversationExamples } from "@/lib/intelligent-ui/playground/conversationExamples";
import { getCompletedExample } from "@/lib/intelligent-ui/playground/getCompletedExample";
import type { Surface } from "@/lib/intelligent-ui/schema";
import PlaygroundWorkspace from "../PlaygroundWorkspace";
import AnswerRenderer from "../AnswerRenderer";

const fetchMock = vi.fn();
const play = vi.fn().mockResolvedValue(undefined);
const pause = vi.fn();
const scenario = (id: string) =>
  playgroundScenarios.find((item) => item.id === id)!;
const example = (id: string) =>
  conversationExamples.find((item) => item.scenarioId === id)!;

function mount(id: string) {
  return render(
    <PlaygroundWorkspace scenario={scenario(id)} example={example(id)} />,
  );
}
function readyAudio() {
  const audio = screen.getByLabelText(
    "Original instrumental demo · 48 seconds",
  ) as HTMLAudioElement;
  Object.defineProperty(audio, "duration", { configurable: true, value: 48 });
  Object.defineProperty(audio, "readyState", { configurable: true, value: 1 });
  fireEvent.loadedMetadata(audio);
  return audio;
}
function response(surface: Surface) {
  return {
    ok: true,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `${JSON.stringify({ type: "surface.snapshot", surface })}\n${JSON.stringify({ type: "surface.complete", surfaceId: surface.id, revision: surface.revision })}\n`,
          ),
        );
        controller.close();
      },
    }),
  };
}

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  play.mockClear();
  pause.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("composed responses", () => {
  it("keeps the supplier answer as ordinary Markdown without a generated comparison or action", () => {
    mount("supplier");
    const answer = screen.getByRole("article", { name: "Recoup response" });
    const table = within(answer).getByRole("table");
    expect(within(table).getByText("Common Ground")).toBeTruthy();
    expect(within(table).getByText("$2,650")).toBeTruthy();
    expect(within(table).getByText("14 days")).toBeTruthy();
    expect(
      within(answer).getByText(/Material certification hasn’t been supplied/),
    ).toBeTruthy();
    expect(within(answer).queryByRole("figure")).toBeNull();
    expect(within(answer).queryByRole("region")).toBeNull();
    expect(within(answer).queryByRole("textbox")).toBeNull();
    expect(within(answer).getAllByRole("button")).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("interleaves a derived insight, static distribution, interpretation and sources", () => {
    mount("listening");
    const answer = screen.getByRole("article", { name: "Recoup response" });
    const insight = within(answer).getByText(/account for 72%/);
    const figure = within(answer).getByRole("figure", {
      name: "Where the plays go",
    });
    const interpretation = within(answer).getByText(/These counts show/);
    expect(
      insight.compareDocumentPosition(figure) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      figure.compareDocumentPosition(interpretation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(within(figure).getByText("420,000").textContent).toBe(
      "420,000 plays",
    );
    expect(within(figure).getAllByRole("listitem")).toHaveLength(8);
    expect(within(figure).queryByRole("button")).toBeNull();
    expect(within(figure).queryByRole("slider")).toBeNull();
    expect(
      within(figure).getByText(/Complete supplied selection/),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates calculated prose and visual values together after a coherent changed replay", async () => {
    const changed = structuredClone(getCompletedExample(scenario("listening")));
    const component = changed.components[0];
    if (component.type !== "distribution")
      throw new Error("Expected distribution");
    component.items[0].value = 0;
    changed.evidence[0].text =
      "SYNTHETIC EXAMPLE. Revised observations: Glasshouse 0; Low Tide 300,000; After Hours 160,000; Daybreak 60,000; Night Drive 30,000; Stillwater 15,000; Blue Hour 10,000; Home 5,000. Total 580,000 plays over the same September window.";
    fetchMock.mockResolvedValueOnce(response(changed));
    mount("listening");
    fireEvent.click(screen.getByText("About this example"));
    fireEvent.click(screen.getByRole("button", { name: "Replay updates" }));
    expect(
      await within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).findByText(/Low Tide and After Hours account for 79.3%/),
    ).toBeTruthy();
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).queryByText(/account for 72%/),
    ).toBeNull();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText(/580,000 supplied plays/)).toBeTruthy();
  });

  it("rejects an answer/data revision mismatch and preserves the complete prior response", async () => {
    const changed = structuredClone(getCompletedExample(scenario("listening")));
    changed.revision = 3;
    fetchMock.mockResolvedValueOnce(response(changed));
    mount("listening");
    fireEvent.click(screen.getByText("About this example"));
    fireEvent.click(screen.getByRole("button", { name: "Replay updates" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).getByText(/account for 72%/),
    ).toBeTruthy();
    expect(screen.getByText("420,000")).toBeTruthy();
  });

  it("exposes equivalent data when the host cannot render a representation", () => {
    const surface = getCompletedExample(scenario("listening"));
    render(
      <AnswerRenderer
        surface={surface}
        capabilities={{ distribution: false, timeline: false }}
        onInspectEvidence={vi.fn()}
      />,
    );
    expect(screen.queryByRole("figure")).toBeNull();
    expect(screen.getByText(/Total supplied: 1,000,000 plays/)).toBeTruthy();
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).getByText(/account for 72%/),
    ).toBeTruthy();
  });

  it("opens evidence only on request and restores focus after closing", async () => {
    mount("listening");
    expect(screen.queryByRole("dialog")).toBeNull();
    const trigger = screen.getByRole("button", {
      name: "September play observations",
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: "Source details",
    });
    expect(within(dialog).getByText(/SYNTHETIC EXAMPLE/)).toBeTruthy();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("reuses the same distribution and calculation for a non-music subject", () => {
    const surface = structuredClone(getCompletedExample(scenario("listening")));
    const distribution = surface.components[0];
    if (distribution.type !== "distribution")
      throw new Error("Expected distribution");
    surface.context = {
      workspaceId: "example-support",
      subject: { kind: "queue", id: "support", label: "Support queues" },
    };
    distribution.title = "Where support time goes";
    distribution.measure = {
      ...distribution.measure,
      label: "Resolution time",
      unit: "minutes",
      population: "Three supplied queues",
    };
    distribution.items = [
      { id: "billing", label: "Billing", value: 600, evidenceIds: [] },
      { id: "accounts", label: "Accounts", value: 300, evidenceIds: [] },
      { id: "other", label: "Other", value: 100, evidenceIds: [] },
    ];
    distribution.totalCount = 3;
    surface.answer!.parts = surface.answer!.parts.slice(0, 2);
    render(<AnswerRenderer surface={surface} onInspectEvidence={vi.fn()} />);
    expect(
      screen.getByRole("figure", { name: "Where support time goes" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Billing and Accounts account for 90% of the minutes/),
    ).toBeTruthy();
    expect(screen.getByText("600")).toBeTruthy();
    expect(screen.queryByText("Spotify plays")).toBeNull();
  });
});

describe("linked time state", () => {
  it("seeks from section selection without starting audio, and follows the actual playhead", () => {
    mount("song");
    const audio = readyAudio();
    expect(audio.autoplay).toBe(false);
    const chorus = screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" });
    chorus.focus();
    fireEvent.click(chorus);
    expect(audio.currentTime).toBe(28);
    expect(chorus.getAttribute("aria-current")).toBe("true");
    expect(
      within(screen.getByRole("region", { name: "Chorus" })).getByText(
        /The motif moves up an octave/,
      ),
    ).toBeTruthy();
    expect(document.activeElement).toBe(chorus);
    expect(play).not.toHaveBeenCalled();
    audio.currentTime = 9;
    fireEvent.timeUpdate(audio);
    expect(
      screen
        .getByRole("button", { name: "Verse, 0:08 to 0:20" })
        .getAttribute("aria-current"),
    ).toBe("true");
    expect(
      within(screen.getByRole("region", { name: "Verse" })).getByText(
        /The motif stays familiar/,
      ),
    ).toBeTruthy();
    expect(document.activeElement).toBe(chorus);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("restores position on return, never restores playback, and pauses an unmounted player", () => {
    const first = mount("song");
    const audio = readyAudio();
    fireEvent.click(
      screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" }),
    );
    expect(audio.currentTime).toBe(28);
    first.unmount();
    expect(pause).toHaveBeenCalled();
    mount("song");
    const restored = readyAudio();
    expect(restored.currentTime).toBe(28);
    expect(
      screen
        .getByRole("button", { name: "Chorus, 0:28 to 0:40" })
        .getAttribute("aria-current"),
    ).toBe("true");
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps the player and current position stable during a valid replay", async () => {
    const first = getCompletedExample(scenario("song"));
    fetchMock.mockResolvedValueOnce(response(first));
    mount("song");
    const audio = readyAudio();
    fireEvent.click(screen.getByRole("button", { name: "Lift, 0:20 to 0:28" }));
    fireEvent.click(screen.getByText("About this example"));
    fireEvent.click(screen.getByRole("button", { name: "Replay updates" }));
    await screen.findByText("Replay complete");
    expect(
      screen.getByLabelText("Original instrumental demo · 48 seconds"),
    ).toBe(audio);
    expect(audio.currentTime).toBe(20);
    expect(play).not.toHaveBeenCalled();
  });

  it("preserves meaningful section exploration when audio fails or has the wrong duration", () => {
    mount("song");
    const audio = screen.getByLabelText(
      "Original instrumental demo · 48 seconds",
    ) as HTMLAudioElement;
    Object.defineProperty(audio, "duration", { configurable: true, value: 60 });
    fireEvent.loadedMetadata(audio);
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).getByRole("status").textContent,
    ).toContain("Audio is unavailable");
    expect(screen.queryByText(/press play/)).toBeNull();
    expect(
      screen.getByText("Choose a section to read its notes."),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" }),
    );
    expect(
      within(screen.getByRole("region", { name: "Chorus" })).getByText(
        /The motif moves up an octave/,
      ),
    ).toBeTruthy();
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps section notes usable if the browser rejects a seek", () => {
    mount("song");
    const audio = readyAudio();
    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      get: () => 0,
      set: () => {
        throw new DOMException("Cannot seek", "InvalidStateError");
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" }),
    );
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).getByRole("status").textContent,
    ).toContain("Audio is unavailable");
    expect(
      within(screen.getByRole("region", { name: "Chorus" })).getByText(
        /The motif moves up an octave/,
      ),
    ).toBeTruthy();
    expect(play).not.toHaveBeenCalled();
  });

  it("does not attach an arbitrary asset URL and still offers all supplied notes", () => {
    const surface = structuredClone(getCompletedExample(scenario("song")));
    const timeline = surface.components[0];
    if (timeline.type !== "timeline") throw new Error("Expected timeline");
    timeline.media!.assetId = "unrecognized";
    render(
      <AnswerRenderer
        surface={surface}
        resolveAudioAsset={() => undefined}
        onInspectEvidence={vi.fn()}
      />,
    );
    expect(
      screen.queryByLabelText("Original instrumental demo · 48 seconds"),
    ).toBeNull();
    expect(
      within(
        screen.getByRole("article", { name: "Recoup response" }),
      ).getByRole("status").textContent,
    ).toContain("Audio is unavailable");
    fireEvent.click(screen.getByText("Read all section notes"));
    expect(screen.getByText(/0:28–0:40 · Chorus/)).toBeTruthy();
  });

  it("presents a notes-only timeline without claiming that audio failed", () => {
    const surface = structuredClone(getCompletedExample(scenario("song")));
    const timeline = surface.components[0];
    if (timeline.type !== "timeline") throw new Error("Expected timeline");
    delete timeline.media;
    render(<AnswerRenderer surface={surface} onInspectEvidence={vi.fn()} />);
    expect(screen.queryByText(/Audio is unavailable/)).toBeNull();
    expect(screen.queryByText(/press play/)).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" }),
    );
    expect(screen.getByRole("region", { name: "Chorus" })).toBeTruthy();
  });
});
