// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CreativeComparison from "../CreativeComparison";
import { audioFixtures } from "@/lib/intelligent-ui/playground/creative/audioFixtures";
import { videoFixtures } from "@/lib/intelligent-ui/playground/creative/videoFixtures";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import { getCreativeFollowUp } from "@/lib/intelligent-ui/playground/creative/getCreativeFollowUp";

const reference = () =>
  screen.queryByLabelText("Read-only local follow-up reference");
const inspect = (asset: CreativeAsset) => {
  fireEvent.click(
    screen.getByRole("button", { name: `Inspect ${asset.label}` }),
  );
  const element = screen.getByLabelText(asset.label) as HTMLMediaElement;
  fireEvent.canPlay(element);
  return element;
};
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(10000);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it.each([audioFixtures[0], videoFixtures[0]])(
  "expires $label without discarding its choice or notes, then requires fresh readiness",
  (asset) => {
    const view = render(
      <CreativeComparison
        scope="expiry"
        assets={[{ ...asset, accessExpiresAt: 11000 }]}
      />,
    );
    const oldMedia = inspect(asset);
    fireEvent.click(
      screen.getByRole("button", { name: `Choose ${asset.label}` }),
    );
    fireEvent.change(screen.getByLabelText(`Notes for ${asset.label}`), {
      target: { value: "Exact revision note" },
    });
    const original = localStorage.getItem("recoup:creative-fixture:v1:expiry");
    expect(reference()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(reference()).toBeNull();
    expect(screen.queryByLabelText(asset.label)).toBeNull();
    expect(oldMedia.pause).toHaveBeenCalled();
    expect(oldMedia.getAttribute("src")).toBeNull();
    expect(oldMedia.load).toHaveBeenCalled();
    expect(screen.getByText(/Access expired/)).toBeTruthy();
    expect(localStorage.getItem("recoup:creative-fixture:v1:expiry")).toBe(
      original,
    );
    expect(fetch).not.toHaveBeenCalled();

    view.rerender(
      <CreativeComparison
        scope="expiry"
        assets={[{ ...asset, accessExpiresAt: 15000 }]}
      />,
    );
    expect(reference()).toBeNull();
    fireEvent.canPlay(oldMedia);
    expect(reference()).toBeNull();
    const renewed = inspect(asset);
    expect(renewed.autoplay).toBe(false);
    expect(reference()).not.toBeNull();
    expect(
      (screen.getByLabelText(`Notes for ${asset.label}`) as HTMLTextAreaElement)
        .value,
    ).toBe("Exact revision note");
    expect(localStorage.getItem("recoup:creative-fixture:v1:expiry")).toBe(
      original,
    );
  },
);

it.each([9999, Number.NaN, Infinity])(
  "fails closed for an expired or invalid host deadline %s",
  (accessExpiresAt) => {
    render(
      <CreativeComparison
        scope="expired"
        assets={[{ ...audioFixtures[0], accessExpiresAt }]}
      />,
    );
    expect(screen.queryByRole("button", { name: /Inspect/ })).toBeNull();
    expect(reference()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  },
);

it("does not substitute a changed revision and cancels the prior scope's deadline", () => {
  const asset = videoFixtures[0];
  const view = render(
    <CreativeComparison
      scope="old"
      assets={[{ ...asset, accessExpiresAt: 11000 }]}
    />,
  );
  inspect(asset);
  fireEvent.click(
    screen.getByRole("button", { name: `Choose ${asset.label}` }),
  );
  view.rerender(
    <CreativeComparison
      scope="old"
      assets={[
        {
          ...asset,
          ref: { ...asset.ref, version: "f".repeat(64) },
          accessExpiresAt: 20000,
        },
      ]}
    />,
  );
  expect(screen.queryByRole("button", { name: /Inspect/ })).toBeNull();
  expect(reference()).toBeNull();
  view.rerender(
    <CreativeComparison
      scope="new"
      assets={[{ ...asset, accessExpiresAt: 20000 }]}
    />,
  );
  const media = inspect(asset);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText(asset.label)).toBe(media);
  expect(reference()).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

it("expires sequential deadlines and clears timers when deadlines are removed or the host unmounts", () => {
  const [first, second] = audioFixtures;
  const view = render(
    <CreativeComparison
      scope="two"
      assets={[
        { ...first, accessExpiresAt: 11000 },
        { ...second, accessExpiresAt: 12000 },
      ]}
    />,
  );
  act(() => vi.advanceTimersByTime(1000));
  expect(
    screen.queryByRole("button", { name: `Inspect ${first.label}` }),
  ).toBeNull();
  expect(
    screen.getByRole("button", { name: `Inspect ${second.label}` }),
  ).toBeTruthy();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole("button", { name: /Inspect/ })).toBeNull();
  view.rerender(
    <CreativeComparison
      scope="two"
      assets={[{ ...first, accessExpiresAt: 20000 }]}
    />,
  );
  expect(vi.getTimerCount()).toBe(1);
  view.rerender(<CreativeComparison scope="two" assets={[first]} />);
  expect(vi.getTimerCount()).toBe(0);
  view.rerender(
    <CreativeComparison
      scope="two"
      assets={[{ ...first, accessExpiresAt: 20000 }]}
    />,
  );
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("rechecks an elapsed deadline on foreground return without waiting for a throttled timer", () => {
  const asset = audioFixtures[0];
  render(
    <CreativeComparison
      scope="background"
      assets={[{ ...asset, accessExpiresAt: 11000 }]}
    />,
  );
  inspect(asset);
  vi.setSystemTime(15000);
  fireEvent.focus(window);
  expect(screen.queryByLabelText(asset.label)).toBeNull();
  expect(screen.getByText(/Access expired/)).toBeTruthy();
});

it("rejects a queued readiness/choice event and direct follow-up after expiry before the timer runs", () => {
  const asset = { ...audioFixtures[0], accessExpiresAt: 11000 };
  render(<CreativeComparison scope="queued" assets={[asset]} />);
  const media = inspect(asset);
  const choice = screen.getByRole("button", { name: `Choose ${asset.label}` });
  vi.setSystemTime(12000);
  fireEvent.canPlay(media);
  fireEvent.click(choice);
  expect(reference()).toBeNull();
  expect(localStorage.getItem("recoup:creative-fixture:v1:queued")).toBeNull();
  expect(getCreativeFollowUp("queued", asset.ref, [asset])).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
