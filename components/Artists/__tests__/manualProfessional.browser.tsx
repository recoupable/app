import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import ManualProfessionalForm from "../ManualProfessionalForm";
import "@/app/globals.css";
const fixture = vi.hoisted(() => ({ fetch: vi.fn() }));
const actor = "10000000-0000-4000-8000-000000000001";
const org = "10000000-0000-4000-8000-000000000002";
const other = "10000000-0000-4000-8000-000000000004";
const id = "10000000-0000-4000-8000-000000000003";
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    getAccessToken: async () => "fixture-token",
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({
    userData: { account_id: "10000000-0000-4000-8000-000000000001" },
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "http://fixture.invalid",
}));
const professional = {
  id,
  organization_id: org,
  name: "Test Writer",
  roles: ["producer", "songwriter"],
  confirmation_basis: "operator_confirmed",
  created_at: "2026-10-08T00:00:00Z",
};
let client: QueryClient;
let saved = vi.fn<() => void>();
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const form = (organizationId = org) => (
  <QueryClientProvider client={client}>
    <ManualProfessionalForm
      key={organizationId}
      organizationId={organizationId}
      organizationName="Fixture organization"
      actorId={actor}
      onSaved={saved}
    />
  </QueryClientProvider>
);
beforeEach(() => {
  sessionStorage.clear();
  saved = vi.fn();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  fixture.fetch.mockReset();
  vi.stubGlobal("fetch", fixture.fetch);
  fixture.fetch.mockImplementation(
    async (_url: string, options: RequestInit) =>
      options.method === "POST"
        ? response({ professional, created: true }, 201)
        : response({ professionals: [], next_cursor: null }),
  );
});
afterEach(() => {
  cleanup();
  client.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});
const enter = async () => {
  await userEvent.fill(
    screen.getByLabelText("Professional name"),
    "Test Writer",
  );
  await userEvent.click(
    screen.getByRole("checkbox", { name: /^songwriter$/i }),
  );
  await userEvent.click(screen.getByRole("checkbox", { name: /^producer$/i }));
  await userEvent.click(
    screen.getByRole("checkbox", { name: /I confirm this is a new person/ }),
  );
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Confirm roster addition" })
        .hasAttribute("disabled"),
    ).toBe(false),
  );
};
it.each([
  [1280, 900],
  [390, 844],
])(
  "requires explicit roles and confirmation at %sx%s",
  async (width, height) => {
    await page.viewport(width, height);
    render(form());
    expect(
      screen
        .getByRole("button", { name: "Confirm roster addition" })
        .hasAttribute("disabled"),
    ).toBe(true);
    await enter();
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm roster addition" }),
    );
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    const post = fixture.fetch.mock.calls.find(([, o]) => o.method === "POST")!;
    const body = JSON.parse(post[1].body);
    expect(body).toMatchObject({
      organization_id: org,
      mode: "new",
      name: "Test Writer",
      roles: ["songwriter", "producer"],
      confirmed: true,
      roster_intent: "add",
    });
    expect(body.idempotency_key).toMatch(/^[0-9a-f-]{36}$/);
    expect(
      fixture.fetch.mock.calls.every(([url]) =>
        String(url).includes("/api/organizations/professionals"),
      ),
    ).toBe(true);
    expect(sessionStorage.length).toBe(0);
  },
);
it("same-name candidates require explicit record selection", async () => {
  fixture.fetch.mockImplementation(
    async (_url: string, options: RequestInit) =>
      options.method === "POST"
        ? response({
            professional: { ...professional, id: other },
            created: false,
          })
        : response({
            professionals: [professional, { ...professional, id: other }],
            next_cursor: null,
          }),
  );
  render(form());
  await enter();
  expect(screen.getByRole("status").textContent).toContain("2 record(s)");
  await userEvent.click(
    screen.getByRole("radio", { name: "Use an existing professional record" }),
  );
  await userEvent.selectOptions(
    screen.getByLabelText("Existing professional"),
    other,
  );
  await userEvent.click(
    screen.getByRole("checkbox", { name: /I confirm the selected record/ }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm roster addition" }),
  );
  await waitFor(() => expect(saved).toHaveBeenCalled());
  const body = JSON.parse(
    fixture.fetch.mock.calls.find(([, o]) => o.method === "POST")![1].body,
  );
  expect(body.professional_id).toBe(other);
  expect(body.mode).toBe("existing");
  expect(body.name).toBeUndefined();
});
it("lost response and remount retry the same committed request", async () => {
  const keys: string[] = [];
  fixture.fetch.mockImplementation(
    async (_url: string, options: RequestInit) => {
      if (options.method !== "POST")
        return response({ professionals: [], next_cursor: null });
      keys.push(JSON.parse(options.body as string).idempotency_key);
      if (keys.length === 1) throw new TypeError("Network response lost");
      return response({ professional, created: true });
    },
  );
  const view = render(form());
  await enter();
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm roster addition" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain(
      "Network response lost",
    ),
  );
  view.unmount();
  render(form());
  await userEvent.click(
    screen.getByRole("button", { name: "Retry saved request" }),
  );
  await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  expect(sessionStorage.length).toBe(0);
});
it("does not permit creation when existing-record lookup is denied", async () => {
  fixture.fetch.mockResolvedValue(response({ error: "denied" }, 403));
  render(form());
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain(
      "Could not load existing records",
    ),
  );
  expect(
    screen
      .getByRole("button", { name: "Confirm roster addition" })
      .hasAttribute("disabled"),
  ).toBe(true);
  expect(fixture.fetch.mock.calls.some(([, o]) => o.method === "POST")).toBe(
    false,
  );
});
it("revoked write access reports failure without a success callback", async () => {
  fixture.fetch.mockImplementation(
    async (_url: string, options: RequestInit) =>
      options.method === "POST"
        ? response({ error: "denied" }, 403)
        : response({ professionals: [], next_cursor: null }),
  );
  render(form());
  await enter();
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm roster addition" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain(
      "no longer have access",
    ),
  );
  expect(saved).not.toHaveBeenCalled();
  expect(sessionStorage.length).toBe(0);
});
it("a completed old-workspace request cannot close the new-workspace form", async () => {
  let finish: (value: Response) => void = () => {};
  fixture.fetch.mockImplementation(
    async (_url: string, options: RequestInit) =>
      options.method === "POST"
        ? new Promise<Response>((resolve) => {
            finish = resolve;
          })
        : response({ professionals: [], next_cursor: null }),
  );
  const view = render(form());
  await enter();
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm roster addition" }),
  );
  await waitFor(() =>
    expect(fixture.fetch.mock.calls.some(([, o]) => o.method === "POST")).toBe(
      true,
    ),
  );
  view.rerender(form(other));
  finish(response({ professional, created: true }));
  await waitFor(() => expect(sessionStorage.length).toBe(0));
  expect(saved).not.toHaveBeenCalled();
  expect(
    (screen.getByLabelText("Professional name") as HTMLInputElement).value,
  ).toBe("");
});
