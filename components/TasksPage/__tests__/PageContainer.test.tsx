// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageContainer from "@/components/TasksPage/PageContainer";

describe("PageContainer", () => {
  it("centers its content at the 2xl width with horizontal padding (app#2016 item 3)", () => {
    render(
      <PageContainer>
        <p>body</p>
      </PageContainer>,
    );
    const el = screen.getByText("body").parentElement as HTMLElement;
    for (const cls of ["mx-auto", "w-full", "max-w-2xl", "px-6"]) {
      expect(el.className).toContain(cls);
    }
  });

  it("merges extra classes so a page can keep its own height rule", () => {
    render(
      <PageContainer className="h-screen">
        <p>body</p>
      </PageContainer>,
    );
    const el = screen.getByText("body").parentElement as HTMLElement;
    expect(el.className).toContain("h-screen");
    expect(el.className).toContain("mx-auto");
  });
});
