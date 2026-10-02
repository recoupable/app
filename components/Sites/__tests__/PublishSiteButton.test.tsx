// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PublishSiteButton } from "../PublishSiteButton";
afterEach(cleanup);
it("allows a working preview to publish without review approval", () => {
  const publish = vi.fn();
  render(
    <PublishSiteButton
      available
      publishing={false}
      published={false}
      onPublish={publish}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  expect(publish).toHaveBeenCalledOnce();
});
it("keeps Publish visible before a preview exists", () => {
  render(
    <PublishSiteButton
      available={false}
      publishing={false}
      published={false}
      onPublish={() => {}}
    />,
  );
  expect(
    (screen.getByRole("button", { name: "Publish" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
it("prevents duplicate publication requests", () => {
  render(
    <PublishSiteButton available publishing published onPublish={() => {}} />,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Publish changes",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
