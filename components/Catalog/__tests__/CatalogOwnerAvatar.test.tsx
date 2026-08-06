// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CatalogOwnerAvatar from "@/components/Catalog/CatalogOwnerAvatar";

const person = {
  id: "fb678396-a68f-4294-ae50-b8cacf9ce77b",
  name: "Sweetman.eth",
  image: "https://img/person.png",
  is_organization: false,
};

describe("CatalogOwnerAvatar", () => {
  it("exposes the owner as an image with an accessible name", () => {
    render(<CatalogOwnerAvatar owner={person} />);

    // role="img" carries the name: the Radix root is a plain span, and
    // HTML-AAM ignores aria-label on a role-less element.
    expect(
      screen.getByRole("img", { name: "Owned by Sweetman.eth" }),
    ).toBeDefined();
  });

  it("marks an organization's catalog as the organization's", () => {
    render(
      <CatalogOwnerAvatar
        owner={{
          id: "org",
          name: "Duetti",
          image: null,
          is_organization: true,
        }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Owned by Duetti (organization)" }),
    ).toBeDefined();
  });

  it("uses the organization glyph for a named organization with no image", () => {
    const { container } = render(
      <CatalogOwnerAvatar
        owner={{
          id: "org",
          name: "Duetti",
          image: null,
          is_organization: true,
        }}
      />,
    );

    // Not an initial: an org is what the glyph is there to signal.
    expect(screen.queryByText("D")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back to a personal owner's initial", () => {
    render(<CatalogOwnerAvatar owner={{ ...person, image: null }} />);

    expect(screen.getByText("S")).toBeDefined();
  });

  it("takes the initial by code point so an emoji name is not cut in half", () => {
    render(
      <CatalogOwnerAvatar
        owner={{ ...person, name: "🎧 Studio", image: null }}
      />,
    );

    expect(screen.getByText("🎧")).toBeDefined();
  });

  it("falls back to ? for a personal owner with no name", () => {
    render(
      <CatalogOwnerAvatar owner={{ ...person, name: null, image: null }} />,
    );

    expect(screen.getByText("?")).toBeDefined();
    expect(
      screen.getByRole("img", { name: "Owned by this account" }),
    ).toBeDefined();
  });
});
