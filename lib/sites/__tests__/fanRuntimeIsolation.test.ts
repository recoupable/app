import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";

it("bounds a hostile frame flood and strips arbitrary activity fields", () => {
  const fetch = vi.fn().mockResolvedValue({});
  let height = "480px";
  let flushResize: (() => void) | undefined;
  const requestAnimationFrame = vi.fn((callback: () => void) => {
    flushResize = callback;
    return 1;
  });
  const frame = {
    contentWindow: { postMessage: vi.fn() },
    style: {
      get height() {
        return height;
      },
      set height(value: string) {
        height = value;
      },
    },
  };
  const toggle = { getAttribute: () => "false", click: vi.fn() };
  let receive: (event: { source: unknown; data: unknown }) => void = () => {};
  runInNewContext(readFileSync("public/sites-fan-runtime.js", "utf8"), {
    document: {
      body: { dataset: { activityUrl: "/activity", preview: "false" } },
      getElementById: (id: string) => (id === "experience" ? frame : toggle),
    },
    window: {
      addEventListener: (_: string, fn: typeof receive) => {
        receive = fn;
      },
    },
    location: { pathname: "/fixture" },
    sessionStorage: { getItem: () => null, setItem: vi.fn() },
    crypto: { randomUUID: () => "synthetic-id" },
    fetch,
    requestAnimationFrame,
  });
  for (const data of [
    null,
    "invalid",
    {},
    { type: "recoup:activity", event: "charge" },
    { type: "recoup:resize", height: Infinity },
    { type: "recoup:resize", height: "9999" },
  ]) {
    receive({ source: frame.contentWindow, data });
  }
  for (const type of ["recoup:activity", "recoup:resize", "recoup:join"]) {
    receive({ source: {}, data: { type, event: "complete", height: 9999 } });
  }
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(frame.style.height).toBe("480px");
  expect(toggle.click).not.toHaveBeenCalled();
  for (let i = 0; i < 100; i++)
    for (const event of ["visit", "start", "complete", "replay", "share"]) {
      receive({
        source: frame.contentWindow,
        data: {
          type: "recoup:activity",
          event,
          secret: "must-not-leave-frame",
        },
      });
    }
  const bodies = fetch.mock.calls.map((call) => JSON.parse(call[1].body));
  expect(bodies).toHaveLength(23);
  expect(bodies.filter((body) => body.event === "complete")).toHaveLength(1);
  expect(bodies.filter((body) => body.event === "replay")).toHaveLength(10);
  expect(
    bodies.every(
      (body) => Object.keys(body).sort().join() === "event,id,visitId",
    ),
  ).toBe(true);
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 1e9 },
  });
  flushResize?.();
  expect(frame.style.height).toBe("12000px");
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: -1 },
  });
  flushResize?.();
  expect(frame.style.height).toBe("480px");
  const writeHeight = vi.spyOn(frame.style, "height", "set");
  requestAnimationFrame.mockClear();
  for (let i = 0; i < 1000; i++)
    receive({
      source: frame.contentWindow,
      data: { type: "recoup:resize", height: 1000 + i },
    });
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 1234.2 },
  });
  receive({ source: {}, data: { type: "recoup:resize", height: 9000 } });
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: NaN },
  });
  expect(requestAnimationFrame).toHaveBeenCalledOnce();
  expect(writeHeight).not.toHaveBeenCalled();
  flushResize?.();
  expect(frame.style.height).toBe("1235px");
  expect(writeHeight).toHaveBeenCalledTimes(1);
  requestAnimationFrame.mockClear();
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 1234.5 },
  });
  expect(requestAnimationFrame).not.toHaveBeenCalled();
  expect(writeHeight).toHaveBeenCalledTimes(1);
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 5000 },
  });
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 1235 },
  });
  expect(requestAnimationFrame).toHaveBeenCalledOnce();
  flushResize?.();
  expect(frame.style.height).toBe("1235px");
  expect(writeHeight).toHaveBeenCalledTimes(1);
});
