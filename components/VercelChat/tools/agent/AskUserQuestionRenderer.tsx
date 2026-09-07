"use client";

import { MessageCircleQuestion } from "lucide-react";
import { ToolLayout } from "./ToolLayout";
import type { ToolRendererProps } from "./renderTool";

type Question = { question?: string };
type AskInput = { questions?: Question[] };
type AskOutput = {
  declined?: boolean;
  answers?: Record<string, string | string[]> | null;
};

export function AskUserQuestionRenderer({ part, state }: ToolRendererProps) {
  const input = part.input as AskInput | undefined;
  const output =
    part.state === "output-available"
      ? (part.output as AskOutput | undefined)
      : undefined;
  const questions = input?.questions ?? [];

  const isWaitingForInput = part.state === "input-available";
  const isStreaming = part.state === "input-streaming";
  const hasOutput = part.state === "output-available";
  const isDeclined = hasOutput && output?.declined === true;
  const hasAnswers = hasOutput && output?.answers != null;

  const summary = isStreaming
    ? "Generating questions"
    : isWaitingForInput
      ? "Waiting for user input"
      : isDeclined
        ? "User declined to answer"
        : hasAnswers
          ? "Answered"
          : state.denied
            ? "Cancelled"
            : "Questions";

  const questionCount = questions.length;
  const meta =
    questionCount > 0
      ? `${questionCount} question${questionCount === 1 ? "" : "s"}`
      : undefined;

  const answers = output?.answers;
  const expandedContent =
    hasAnswers && answers ? (
      <div className="space-y-2">
        {questions.map((q) => {
          if (!q?.question) return null;
          const answer = answers[q.question];
          const answerStr = Array.isArray(answer)
            ? answer.join(", ")
            : (answer ?? "(not answered)");
          return (
            <div key={q.question} className="space-y-0.5">
              <p className="text-sm text-foreground">{q.question}</p>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-500">&rarr;</span> {answerStr}
              </p>
            </div>
          );
        })}
      </div>
    ) : undefined;

  const displayState = isWaitingForInput
    ? { ...state, interrupted: false }
    : state;

  return (
    <ToolLayout
      name="Ask user"
      summary={summary}
      meta={meta}
      state={displayState}
      icon={<MessageCircleQuestion className="h-3.5 w-3.5" />}
      nameClassName={state.denied || isDeclined ? "text-red-500" : undefined}
      expandedContent={expandedContent}
      defaultExpanded={false}
    />
  );
}
