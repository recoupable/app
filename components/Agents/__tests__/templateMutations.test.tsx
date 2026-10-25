// @vitest-environment jsdom
import {
  state,
  token,
  fetchMock,
  wrapper,
  response,
  deferred,
  client,
  template,
} from "./templateScope.fixture";
import React from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAgentToggleFavorite } from "../useAgentToggleFavorite";
import { useAgentTemplateMutation } from "../useAgentTemplateMutation";
import CreateAgentDialog from "../CreateAgentDialog";
import AgentEditDialog from "../AgentEditDialog";
import AgentDeleteButton from "../AgentDeleteButton";
import AgentCard from "../AgentCard";
import AgentCreator from "../AgentCreator";

const { success, failure } = vi.hoisted(() => ({
  success: vi.fn(),
  failure: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success, error: failure } }));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  AvatarImage: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: () => null,
  AlertDialogAction: ({
    onClick,
    disabled,
  }: {
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      Confirm delete
    </button>
  ),
}));
vi.mock("../CreateAgentForm", () => ({
  default: ({
    onSubmit,
    onExistingEmailsChange,
    existingSharedEmails = [],
  }: {
    onSubmit: (values: unknown) => void;
    onExistingEmailsChange?: (emails: string[]) => void;
    existingSharedEmails?: string[];
  }) => (
    <div>
      <span>{existingSharedEmails.join(",")}</span>
      <button onClick={() => onExistingEmailsChange?.([])}>
        Remove shares
      </button>
      <button
        onClick={() =>
          onSubmit({
            title: "Template",
            description: "Template description",
            prompt: "A prompt for template testing",
            tags: ["Marketing"],
            isPrivate: true,
            shareEmails: ["new@example.test"],
          })
        }
      >
        Save private
      </button>
      <button
        onClick={() =>
          onSubmit({
            title: "Template",
            description: "Template description",
            prompt: "A prompt for template testing",
            tags: [],
            isPrivate: false,
            shareEmails: [],
          })
        }
      >
        Save public
      </button>
      <button
        onClick={() =>
          onSubmit({
            title: "Template",
            description: "Template description",
            prompt: "A prompt for template testing",
            tags: [],
            isPrivate: true,
            shareEmails: [],
          })
        }
      >
        Save without new shares
      </button>
    </div>
  ),
}));
beforeEach(() => vi.stubGlobal("React", React));
const body = () => JSON.parse(fetchMock.mock.calls.at(-1)![1].body);

describe("template mutation contract", () => {
  it("creates with snake-case fields and no claimed identity", async () => {
    render(
      <CreateAgentDialog>
        <button>Create</button>
      </CreateAgentDialog>,
      { wrapper },
    );
    fireEvent.click(screen.getByText("Save private"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/agents/templates",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(body()).toEqual({
      title: "Template",
      description: "Template description",
      prompt: "A prompt for template testing",
      tags: ["Marketing"],
      is_private: true,
      share_emails: ["new@example.test"],
    });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer fresh-token",
    );
  });
  it.each(["Save private", "Save without new shares", "Save public"])(
    "replaces shares after removals (%s)",
    async (label) => {
      render(
        <AgentEditDialog
          agent={{ ...template(), shared_emails: ["old@example.test"] }}
        />,
        { wrapper },
      );
      fireEvent.click(screen.getByText("Remove shares"));
      fireEvent.click(screen.getByText(label));
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://api.example.test/api/agents/templates/template-a",
      );
      expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
      expect(body().share_emails).toEqual(
        label === "Save private" ? ["new@example.test"] : [],
      );
      expect(body()).not.toHaveProperty("userId");
      expect(body()).not.toHaveProperty("id");
    },
  );
  it("preserves retained shares when adding a recipient", async () => {
    render(
      <AgentEditDialog
        agent={{ ...template(), shared_emails: ["old@example.test"] }}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText("Save private"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(body().share_emails).toEqual([
      "old@example.test",
      "new@example.test",
    ]);
  });
  it("deletes by URL only as owner; different profile row id is not used", async () => {
    render(<AgentDeleteButton id="template-a" creatorId="account-a" />, {
      wrapper,
    });
    fireEvent.click(screen.getByText("Confirm delete"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/agents/templates/template-a",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });
  it("uses PUT favorite with only is_favourite and invalidates the actor list", async () => {
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(useAgentToggleFavorite, { wrapper });
    await act(async () =>
      result.current.handleToggleFavorite("template-a", true),
    );
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/agents/templates/template-a/favorite",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(body()).toEqual({ is_favourite: true });
    expect(invalidate).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith("Added to favorites");
  });
});

describe("mutation session boundary", () => {
  it.each(["actor", "origin", "authenticated"] as const)(
    "never sends a late token after %s changes",
    async (field) => {
      const pending = deferred<string>();
      token.mockReturnValueOnce(pending.promise);
      const { result, rerender } = renderHook(useAgentToggleFavorite, {
        wrapper,
      });
      let work!: Promise<void>;
      act(() => {
        work = result.current.handleToggleFavorite("template-a", true);
      });
      await waitFor(() => expect(token).toHaveBeenCalled());
      if (field === "authenticated") state.authenticated = false;
      else
        state[field] =
          field === "origin" ? "https://other.example.test" : "actor-b";
      rerender();
      await act(async () => {
        pending.resolve("new-actor-token");
        await work;
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      expect(failure).not.toHaveBeenCalled();
    },
  );
  it("ignores a late response and callback after same-user logout/login", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const onSuccess = vi.fn();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result, rerender } = renderHook(useAgentTemplateMutation, {
      wrapper,
    });
    let work!: Promise<void>;
    act(() => {
      work = result.current.mutate({ method: "POST", body: {} }, onSuccess);
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const signal = fetchMock.mock.calls[0][1].signal;
    state.authenticated = false;
    rerender();
    state.authenticated = true;
    rerender();
    await act(async () => {
      pending.resolve(response());
      await work;
    });
    expect(signal.aborted).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
  it("does not toast or invalidate for a favorite response from the prior actor", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result, rerender } = renderHook(useAgentToggleFavorite, {
      wrapper,
    });
    let work!: Promise<void>;
    act(() => {
      work = result.current.handleToggleFavorite("template-a", true);
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    state.actor = "actor-b";
    rerender();
    await act(async () => {
      pending.resolve(response());
      await work;
    });
    expect(success).not.toHaveBeenCalled();
    expect(failure).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
  it("does not mark denied mutations successful or invalidate cached data", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ status: "error", error: "Forbidden" }),
    });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(useAgentToggleFavorite, { wrapper });
    await act(async () =>
      result.current.handleToggleFavorite("template-a", true),
    );
    expect(success).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(failure).toHaveBeenCalledWith("Forbidden");
  });
  it("does not send without a token and surfaces failure", async () => {
    token.mockResolvedValue(null);
    const { result } = renderHook(useAgentToggleFavorite, { wrapper });
    await act(async () =>
      result.current.handleToggleFavorite("template-a", false),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(failure).toHaveBeenCalledWith("Please sign in to manage agents.");
  });
});

describe("creator and ownership presentation", () => {
  it("renders the embedded admin badge without a creator request", () => {
    render(
      <AgentCreator creator={{ ...template().creator, is_admin: true }} />,
      { wrapper },
    );
    expect(screen.getByText("Recoup")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("renders embedded creator avatar and name without a creator request", () => {
    render(
      <AgentCreator
        creator={{
          ...template().creator,
          image: "https://image.example.test/avatar",
        }}
      />,
      { wrapper },
    );
    expect(screen.getAllByText("Creator").length).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("uses creator.id/account_id for owner edit/delete", () => {
    render(<AgentCard agent={template()} onClick={() => {}} />, { wrapper });
    expect(screen.getByLabelText("Edit")).toBeTruthy();
    expect(screen.getByLabelText("Delete")).toBeTruthy();
    expect(screen.queryByText("Shared")).toBeNull();
  });
  it("shows Shared to a nonowner despite privacy-filtered empty shared_emails", () => {
    state.account = "recipient-account";
    render(<AgentCard agent={template()} onClick={() => {}} />, { wrapper });
    expect(screen.queryByLabelText("Edit")).toBeNull();
    expect(screen.queryByLabelText("Delete")).toBeNull();
    expect(screen.getByText("Shared")).toBeTruthy();
    expect(screen.getAllByText("Creator").length).toBeGreaterThan(0);
  });
});
