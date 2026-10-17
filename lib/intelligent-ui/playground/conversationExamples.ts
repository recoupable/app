import type { ScenarioId } from "./scenarios";

export type ConversationExample = {
  id: string;
  label: string;
  scenarioId: ScenarioId;
  prompt: string;
};

// Recipes are authored fixtures. The response itself travels with its data revision.
export const conversationExamples: ConversationExample[] = [
  {
    id: "listening-patterns",
    label: "Listening patterns",
    scenarioId: "listening",
    prompt:
      "Is listening spread across these tracks, or concentrated in a few?",
  },
  {
    id: "song-exploration",
    label: "Explore a song",
    scenarioId: "song",
    prompt:
      "Help me hear how the arrangement changes from the intro to the chorus.",
  },
  {
    id: "supplier-comparison",
    label: "Supplier comparison",
    scenarioId: "supplier",
    prompt: "Which supplier makes sense for 500 studio bags?",
  },
];
