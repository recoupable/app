// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CatalogCsvUploadButton from "../CatalogCsvUploadButton";
import CatalogSongsResult from "../CatalogSongsResult";

const selections = vi.hoisted(
  () => new Map<string | undefined, ReturnType<typeof vi.fn>>(),
);
vi.mock("@/hooks/useCatalogSongsFileSelect", () => ({
  useCatalogSongsFileSelect: (catalogId?: string) => {
    if (!selections.has(catalogId)) selections.set(catalogId, vi.fn());
    return {
      isUploading: false,
      uploadResult: null,
      uploadError: null,
      uploadProgress: { current: 0, total: 0 },
      handleFileSelect: selections.get(catalogId),
    };
  },
}));

const network = vi.fn(() => {
  throw new Error("Upload-control tests must not request the network");
});
beforeEach(() => {
  selections.clear();
  vi.stubGlobal("fetch", network);
});
afterEach(() => {
  try {
    cleanup();
    expect(network).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    network.mockClear();
  }
});

function renderPair(firstSelected = true) {
  const firstSelect = vi.fn();
  const secondSelect = vi.fn();
  const view = render(
    <>
      <CatalogCsvUploadButton
        key="first"
        onFileSelect={firstSelect}
        hasCatalogId={firstSelected}
      />
      <CatalogCsvUploadButton key="second" onFileSelect={secondSelect} />
    </>,
  );
  const inputs =
    view.container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  expect(inputs).toHaveLength(2);
  const firstPicker = vi.spyOn(inputs[0], "click").mockImplementation(() => {});
  const secondPicker = vi
    .spyOn(inputs[1], "click")
    .mockImplementation(() => {});
  return {
    ...view,
    inputs,
    firstSelect,
    secondSelect,
    firstPicker,
    secondPicker,
  };
}

describe("catalog upload controls in repeated results", () => {
  it("activates the second result's own picker", () => {
    const { firstPicker, secondPicker, firstSelect, secondSelect } =
      renderPair();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Upload CSV File" })[1],
    );
    expect(secondPicker).toHaveBeenCalledTimes(1);
    expect(firstPicker).not.toHaveBeenCalled();
    expect(firstSelect).not.toHaveBeenCalled();
    expect(secondSelect).not.toHaveBeenCalled();
  });

  it("keeps a preceding unselected catalog from capturing the enabled picker", () => {
    const { firstPicker, secondPicker } = renderPair(false);
    const buttons = screen.getAllByRole("button", { name: "Upload CSV File" });
    expect(buttons[0]).toHaveProperty("disabled", true);
    expect(buttons[1]).toHaveProperty("disabled", false);
    fireEvent.click(buttons[1]);
    expect(secondPicker).toHaveBeenCalledTimes(1);
    expect(firstPicker).not.toHaveBeenCalled();
  });

  it("gives each input its own accessible label association", () => {
    const { container, inputs } = renderPair();
    const buttons = screen.getAllByRole("button", { name: "Upload CSV File" });
    for (const [index, input] of Array.from(inputs).entries()) {
      expect(buttons[index].getAttribute("aria-controls")).toBe(input.id);
      expect(input.getAttribute("aria-labelledby")).toBe(buttons[index].id);
      expect(buttons[index].id).not.toBe("");
    }
    expect(buttons[0].id).not.toBe(buttons[1].id);
    expect(inputs[0].id).not.toBe("");
    expect(inputs[1].id).not.toBe(inputs[0].id);
    expect(
      screen.getAllByLabelText("Upload CSV File", { selector: "input" }),
    ).toHaveLength(2);
    expect(container.querySelector("label button")).toBeNull();
  });

  it("keeps picker ownership when keyed results are reordered", () => {
    const {
      rerender,
      inputs,
      firstSelect,
      secondSelect,
      firstPicker,
      secondPicker,
    } = renderPair();
    const originalIds = Array.from(inputs, (input) => input.id);
    rerender(
      <>
        <CatalogCsvUploadButton key="second" onFileSelect={secondSelect} />
        <CatalogCsvUploadButton key="first" onFileSelect={firstSelect} />
      </>,
    );
    expect(inputs[0].id).toBe(originalIds[0]);
    expect(inputs[1].id).toBe(originalIds[1]);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Upload CSV File" })[1],
    );
    expect(firstPicker).toHaveBeenCalledTimes(1);
    expect(secondPicker).not.toHaveBeenCalled();
  });

  it("preserves the default enabled single control and CSV input contract", () => {
    const onFileSelect = vi.fn();
    const { container } = render(
      <CatalogCsvUploadButton onFileSelect={onFileSelect} />,
    );
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const picker = vi.spyOn(input, "click").mockImplementation(() => {});
    const button = screen.getByRole("button", { name: "Upload CSV File" });
    expect(button).toHaveProperty("disabled", false);
    expect(button.getAttribute("type")).toBe("button");
    expect(input.getAttribute("accept")).toBe(".csv");
    expect(input.className).toBe("hidden");
    expect(screen.getByText("isrc")).toBeTruthy();
    fireEvent.click(button);
    expect(picker).toHaveBeenCalledTimes(1);
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("preserves the disabled control and missing-catalog warning", () => {
    const onFileSelect = vi.fn();
    const { container } = render(
      <CatalogCsvUploadButton
        onFileSelect={onFileSelect}
        hasCatalogId={false}
      />,
    );
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const picker = vi.spyOn(input, "click").mockImplementation(() => {});
    const button = screen.getByRole("button", { name: "Upload CSV File" });
    expect(button).toHaveProperty("disabled", true);
    expect(
      screen.getByText("No catalog selected. Please select a catalog first."),
    ).toBeTruthy();
    fireEvent.click(button);
    expect(picker).not.toHaveBeenCalled();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("delivers synthetic file changes only to the owning callback", () => {
    const { inputs, firstSelect, secondSelect, firstPicker, secondPicker } =
      renderPair();
    const secondFile = new File(["isrc\nSYNTHETIC002"], "second.csv", {
      type: "text/csv",
    });
    fireEvent.change(inputs[1], { target: { files: [secondFile] } });
    expect(secondSelect).toHaveBeenCalledTimes(1);
    expect(secondSelect.mock.calls[0][0].target.files[0]).toBe(secondFile);
    expect(firstSelect).not.toHaveBeenCalled();
    const firstFile = new File(["isrc\nSYNTHETIC001"], "first.csv", {
      type: "text/csv",
    });
    fireEvent.change(inputs[0], { target: { files: [firstFile] } });
    expect(firstSelect).toHaveBeenCalledTimes(1);
    expect(firstSelect.mock.calls[0][0].target.files[0]).toBe(firstFile);
    expect(secondSelect).toHaveBeenCalledTimes(1);
    expect(firstPicker).not.toHaveBeenCalled();
    expect(secondPicker).not.toHaveBeenCalled();
  });

  it("keeps the same input association across ordinary rerenders", () => {
    const onFileSelect = vi.fn();
    const { container, rerender } = render(
      <CatalogCsvUploadButton onFileSelect={onFileSelect} />,
    );
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const originalId = input.id;
    rerender(
      <CatalogCsvUploadButton
        onFileSelect={onFileSelect}
        hasCatalogId={false}
      />,
    );
    expect(container.querySelector('input[type="file"]')).toBe(input);
    expect(input.id).toBe(originalId);
  });

  it.each([true, false])(
    "delivers a file through the owning catalog parent with firstSelected=%s",
    (firstSelected) => {
      const first = (
        <CatalogSongsResult
          key="first"
          result={{ success: true, songs: [] }}
          catalogId={firstSelected ? "first-catalog" : undefined}
        />
      );
      const second = (
        <CatalogSongsResult
          key="second"
          result={{ success: true, songs: [] }}
          catalogId="second-catalog"
        />
      );
      const view = render(
        <>
          {first}
          {second}
        </>,
      );
      const inputs = Array.from(
        view.container.querySelectorAll<HTMLInputElement>('input[type="file"]'),
      );
      let activated: HTMLInputElement | undefined;
      for (const input of inputs) {
        vi.spyOn(input, "click").mockImplementation(() => {
          activated = input;
        });
      }
      const selectSecond = () => {
        fireEvent.click(
          screen.getAllByRole("button", { name: "Upload CSV File" })[
            Array.from(
              view.container.querySelectorAll('input[type="file"]'),
            ).indexOf(inputs[1])
          ],
        );
        expect(activated).toBe(inputs[1]);
        const file = new File(["isrc\nSYNTHETIC002"], "second.csv", {
          type: "text/csv",
        });
        fireEvent.change(activated!, { target: { files: [file] } });
        expect(
          selections.get("second-catalog")!.mock.lastCall![0].target.files[0],
        ).toBe(file);
      };
      selectSecond();
      view.rerender(
        <>
          {second}
          {first}
        </>,
      );
      selectSecond();
      expect(selections.get("second-catalog")).toHaveBeenCalledTimes(2);
      expect(
        selections.get(firstSelected ? "first-catalog" : undefined),
      ).not.toHaveBeenCalled();
    },
  );
});
