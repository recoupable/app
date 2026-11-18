import { afterEach, expect, it, vi } from "vitest";
import { createConsentClient } from "../createConsentClient";

afterEach(() => vi.unstubAllGlobals());
const issuer = "https://api.example.test/api/oauth";
it("rejects untrusted configuration and query-supplied paths before sending credentials", () => {
  for (const value of [
    "http://api.example.test/api/oauth",
    `${issuer}?host=evil`,
    "https://user@api.example.test/api/oauth",
    `${issuer}/extra`,
  ])
    expect(() => createConsentClient(value, "id")).toThrow();
  expect(() => createConsentClient(issuer, "../token")).toThrow();
});
it("sends credentials only to the configured interaction and accepts only issuer resumption", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ redirectUrl: `${issuer}/auth/resume` }));
  vi.stubGlobal("fetch", fetcher);
  expect(
    await createConsentClient(issuer, "id").decide(
      "private-token",
      "nonce",
      "deny",
    ),
  ).toBe(`${issuer}/auth/resume`);
  expect(fetcher).toHaveBeenCalledWith(
    `${issuer}/interaction/id`,
    expect.objectContaining({
      credentials: "include",
      redirect: "error",
      body: JSON.stringify({ csrf: "nonce", decision: "deny" }),
    }),
  );
  for (const redirectUrl of [
    "https://evil.example/auth/resume",
    `${issuer}/token`,
    `${issuer}/auth/resume#token`,
    "https://user@api.example.test/api/oauth/auth/resume",
  ]) {
    fetcher.mockResolvedValue(Response.json({ redirectUrl }));
    await expect(
      createConsentClient(issuer, "id").decide("token", "nonce", "approve"),
    ).rejects.toThrow();
  }
});

it.each([30, null])(
  "accepts the server's approved duration %s during rollout",
  async (accessDurationDays) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          csrf: "a".repeat(43),
          clientId: "client",
          clientName: "Agent",
          clientVerified: false,
          accountId: "00000000-0000-4000-8000-000000000001",
          context: "personal",
          accessDurationDays,
          expiresIn: 300,
          permissions: [{ scope: "mcp:read", description: "Read" }],
        }),
      ),
    );
    expect(
      (await createConsentClient(issuer, "id").load("token"))
        .accessDurationDays,
    ).toBe(accessDurationDays);
  },
);

it("requires a versioned selected preview and sends the same explicit selection for approval", async () => {
  const selectedContext = {
    version: 1,
    capabilityVersion: "context-workspace-v1",
    mode: "selected_context",
    kind: "personal",
    ownerId: "00000000-0000-4000-8000-000000000001",
    organizationId: null,
  };
  const metadata = {
    csrf: "a".repeat(43),
    clientId: "client",
    clientName: "Agent",
    clientVerified: false,
    accountId: selectedContext.ownerId,
    context: "personal",
    accessDurationDays: null,
    expiresIn: 300,
    permissions: [{ scope: "mcp:tools", description: "Context tools" }],
    consent_version: 2,
    selectedContext,
    workspaces: [
      { kind: "personal", organizationId: null, name: "Personal workspace" },
    ],
  };
  const fetcher = vi.fn().mockResolvedValue(Response.json(metadata));
  vi.stubGlobal("fetch", fetcher);
  const client = createConsentClient(issuer, "id");
  const selection = { workspace_kind: "personal" } as const;
  expect(await client.loadSelected("token", selection)).toMatchObject({
    selectedContext,
  });
  expect(fetcher.mock.calls[0][0]).toBe(
    `${issuer}/interaction/id?consent_version=2&workspace_kind=personal`,
  );
  fetcher.mockResolvedValue(
    Response.json({ redirectUrl: `${issuer}/auth/resume` }),
  );
  await client.decide("token", metadata.csrf, "approve", selection);
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
    csrf: metadata.csrf,
    decision: "approve",
    consent_version: 2,
    workspace_kind: "personal",
  });
  fetcher.mockResolvedValue(
    Response.json({ ...metadata, consent_version: undefined }),
  );
  await expect(client.loadSelected("token", selection)).rejects.toThrow();
});
