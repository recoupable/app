import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
it("tracks real frame messages once and ignores messages from other windows", () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(new Response(null, { status: 200 }));
  let receive: (event: unknown) => void = () => {};
  const frame = {
    contentWindow: { postMessage: vi.fn() },
    style: { height: "" },
  };
  const toggle = { getAttribute: () => "false", click: vi.fn() };
  const document = {
    body: { dataset: { activityUrl: "/s/site/activity", preview: "false" } },
    getElementById: (id: string) => (id === "experience" ? frame : toggle),
  };
  runInNewContext(readFileSync("public/sites-fan-runtime.js", "utf8"), {
    document,
    window: {
      addEventListener: (_name: string, fn: typeof receive) => (receive = fn),
    },
    location: { pathname: "/s/site" },
    sessionStorage: { getItem: () => null, setItem: vi.fn() },
    crypto: { randomUUID: () => "event-uuid" },
    fetch,
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  receive({
    source: {},
    data: { type: "recoup:activity", event: "complete", email: "private" },
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:activity", event: "complete", email: "private" },
  });
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:activity", event: "complete" },
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(JSON.parse(String(fetch.mock.calls[1][1]?.body))).toEqual({
    id: "event-uuid",
    visitId: "event-uuid",
    event: "complete",
  });
  receive({ source: frame.contentWindow, data: { type: "recoup:join" } });
  expect(toggle.click).toHaveBeenCalledOnce();
  receive({ source: {}, data: { type: "recoup:resize", height: 900 } });
  expect(frame.style.height).toBe("");
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 900 },
  });
  expect(frame.style.height).toBe("900px");
  receive({
    source: frame.contentWindow,
    data: { type: "recoup:resize", height: 1000000 },
  });
  expect(frame.style.height).toBe("12000px");
});
