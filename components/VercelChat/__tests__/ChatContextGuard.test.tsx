// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatContextGuard from "@/components/VercelChat/ChatContextGuard";
import { requestContextSwitch } from "@/lib/chat/requestContextSwitch";
const context = vi.hoisted(() => ({
  input: "",
  attachments: [] as unknown[],
  textAttachments: [] as unknown[],
  hasPendingUploads: false,
  status: "ready",
  setInput: vi.fn(),
  clearAttachments: vi.fn(),
  setTextAttachments: vi.fn(),
}));
vi.mock("@/providers/VercelChatProvider", () => ({
  useVercelChatContext: () => context,
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => {
  context.input = "";
  context.textAttachments = [];
  context.status = "ready";
  vi.clearAllMocks();
});
describe("context switch draft protection", () => {
  it("lets an empty composer switch immediately", () => {
    render(<ChatContextGuard />);
    const action = vi.fn();
    act(() => requestContextSwitch(action));
    expect(action).toHaveBeenCalledOnce();
  });
  it("keeps a draft on cancel and only clears it after confirmation", () => {
    context.input = "My release plan";
    render(<ChatContextGuard />);
    const action = vi.fn();
    act(() => requestContextSwitch(action));
    fireEvent.click(screen.getByText("Keep writing"));
    expect(action).not.toHaveBeenCalled();
    expect(context.setInput).not.toHaveBeenCalled();
    act(() => requestContextSwitch(action));
    fireEvent.click(screen.getByText("Discard and switch"));
    expect(context.setInput).toHaveBeenCalledWith("");
    expect(context.clearAttachments).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledOnce();
  });
  it("protects text-only attachments and blocks a running response", () => {
    context.textAttachments = [{ text: "notes" }];
    const { rerender } = render(<ChatContextGuard />);
    const action = vi.fn();
    act(() => requestContextSwitch(action));
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Keep writing"));
    context.status = "streaming";
    rerender(<ChatContextGuard />);
    act(() => requestContextSwitch(action));
    expect(action).not.toHaveBeenCalled();
  });
});
