"use client";

import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import { Button } from "@/components/ui/button";

interface ResultStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ResultStep({ onNext, onBack }: ResultStepProps) {
  const { taskResult } = useOnboarding();
  const { email } = useUserProvider();

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      {/* Success icon */}
      <div className="mb-6">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(52, 90, 93, 0.1)" }}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#345A5D" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-semibold mb-6 text-center">
        Done! Here&apos;s what I found:
      </h1>

      {/* Result content */}
      <div className="w-full mb-6 p-4 rounded-lg bg-muted/50 border border-input max-h-80 overflow-y-auto">
        {taskResult ? (
          <div className="text-sm whitespace-pre-wrap break-words">
            {taskResult}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No result available. The task may have been skipped.
          </p>
        )}
      </div>

      {/* Email notification */}
      {email && taskResult && (
        <p className="text-muted-foreground text-sm mb-8">
          I just sent this to <span className="font-medium">{email}</span>.
        </p>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="px-8"
          style={{ backgroundColor: "#345A5D" }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
