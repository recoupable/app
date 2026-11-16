// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import useUser from "../useUser";
const state = vi.hoisted(() => ({
  id: "actor-a",
  ready: true,
  ensure: vi.fn(),
  token: vi.fn(async () => "token"),
  update: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: state.id, email: { address: "same@example.test" } },
    ready: state.ready,
    getAccessToken: state.token,
  }),
}));
vi.mock("wagmi", () => ({ useAccount: () => ({}) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({}),
  usePathname: () => "/releases",
}));
vi.mock("../usePublicUpload", () => ({
  usePublicUpload: () => ({ isUploading: false }),
}));
vi.mock("@/lib/accounts/ensureAccount", () => ({
  ensureAccount: (...args: unknown[]) => state.ensure(...args),
}));
vi.mock("@/lib/accounts/updateAccountProfile", () => ({
  updateAccountProfile: (...args: unknown[]) => state.update(...args),
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  state.id = "actor-a";
  state.ready = true;
  state.token.mockResolvedValue("token");
});
it("hides the old account synchronously while the same-email new actor bootstraps", async () => {
  let finish!: (value: unknown) => void;
  state.ensure
    .mockResolvedValueOnce({ account_id: "account-a" })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  const { result, rerender } = renderHook(() => useUser());
  await waitFor(() =>
    expect(result.current.userData?.account_id).toBe("account-a"),
  );
  state.id = "actor-b";
  rerender();
  expect(result.current.userData).toBeNull();
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  await act(async () => {
    finish({ account_id: "account-b" });
  });
  expect(result.current.userData?.account_id).toBe("account-b");
  state.ready = false;
  rerender();
  expect(result.current.userData).toBeNull();
});
it("does not publish an old actor's late bootstrap under a new actor", async () => {
  let finish!: (value: unknown) => void;
  state.ensure
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce({ account_id: "account-b" });
  const { result, rerender } = renderHook(() => useUser());
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  state.id = "actor-b";
  rerender();
  await waitFor(() =>
    expect(result.current.userData?.account_id).toBe("account-b"),
  );
  await act(async () => {
    finish({ account_id: "account-a" });
  });
  expect(result.current.userData?.account_id).toBe("account-b");
});
it("ignores a profile-save result after switching actors", async () => {
  let finish!: (value: unknown) => void;
  state.ensure
    .mockResolvedValueOnce({ account_id: "account-a" })
    .mockResolvedValueOnce({ account_id: "account-b" });
  state.update.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { result, rerender } = renderHook(() => useUser());
  await waitFor(() =>
    expect(result.current.userData?.account_id).toBe("account-a"),
  );
  let saving!: Promise<void>;
  act(() => {
    saving = result.current.save();
  });
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  state.id = "actor-b";
  rerender();
  await waitFor(() =>
    expect(result.current.userData?.account_id).toBe("account-b"),
  );
  await act(async () => {
    finish({ account_id: "account-a" });
    await saving;
  });
  expect(result.current.userData?.account_id).toBe("account-b");
});
