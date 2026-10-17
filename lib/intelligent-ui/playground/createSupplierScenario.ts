import type { Surface } from "../schema";
import { createComposedScenario } from "./createComposedScenario";

export function createSupplierScenario(source: Surface) {
  const quotes = source.components.find(
    (component) => component.type === "collection",
  );
  if (!quotes || quotes.type !== "collection")
    throw new Error("Missing supplier fixture");
  // The table is ordinary Markdown, using the supplied records without a custom widget.
  const table = [
    "| Supplier | Quote / 500 | Lead time |",
    "| :--- | ---: | :--- |",
    ...quotes.rows.map(
      (row) => `| ${row.label} | ${row.values.quote} | ${row.values.lead} |`,
    ),
  ].join("\n");
  return createComposedScenario(
    "supplier",
    "Supplier comparison",
    "Which supplier makes sense for 500 studio bags?",
    {
      ...source,
      components: [],
      id: "example-supplier-answer",
      title: "Studio bags · 500 units",
      answer: {
        revision: 2,
        parts: [
          {
            type: "markdown",
            id: "recommendation",
            text: "**Common Ground is the quickest option** at 14 days. Fieldwork costs least, but its sample review is still missing.",
          },
          { type: "markdown", id: "quotes", text: table },
          {
            type: "markdown",
            id: "qualification",
            text: "Northline and Common Ground have reviewed samples. If timing matters most, I’d review Common Ground first; before choosing Fieldwork, check its sample. Material certification hasn’t been supplied for any of the three.",
          },
          {
            type: "sources",
            id: "sources",
            evidenceIds: ["quote-sheet", "sample-log"],
          },
        ],
      },
    },
  );
}
