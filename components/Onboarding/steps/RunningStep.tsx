"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { runOnboardingTask } from "@/lib/onboarding";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { ArtistRecord } from "@/types/Artist";
import { AgentTemplateRow } from "@/types/AgentTemplates";

interface RunningStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PROGRESS_STEPS = [
  { label: "Researching", duration: 5000 },
  { label: "Analyzing", duration: 10000 },
  { label: "Sending email", duration: 15000 },
];

const TIMEOUT_MS = 60000;

export default function RunningStep({ onNext, onBack }: RunningStepProps) {
  void onBack; // Not used during running state

  const { selectedTask, priorityArtists, setTaskResult, setTaskError, goToStep } =
    useOnboarding();
  const { userData, email } = useUserProvider();
  const { getAccessToken } = usePrivy();

  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const [artistName, setArtistName] = useState<string>("Artist");

  const hasStartedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch the first priority artist's name
  const fetchArtistName = useCallback(async () => {
    if (!priorityArtists || priorityArtists.length === 0 || !userData?.id) {
      return;
    }

    try {
      const artistId = priorityArtists[0];
      const params = new URLSearchParams({
        accountId: userData.id as string,
      });

      const response = await fetch(
        `${NEW_API_BASE_URL}/api/artists?${params.toString()}`
      );
      const data = await response.json();
      const artists: ArtistRecord[] = data.artists || [];
      const artist = artists.find((a) => a.account_id === artistId);
      if (artist?.name) {
        setArtistName(artist.name);
      }
    } catch {
      // Keep default "Artist" if fetch fails
    }
  }, [priorityArtists, userData?.id]);

  // Animated progress step advancement
  useEffect(() => {
    if (!isRunning || error) return;

    const advanceProgress = () => {
      if (currentProgressStep < PROGRESS_STEPS.length - 1) {
        progressTimeoutRef.current = setTimeout(() => {
          setCurrentProgressStep((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
          advanceProgress();
        }, PROGRESS_STEPS[currentProgressStep].duration);
      }
    };

    advanceProgress();

    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [isRunning, error, currentProgressStep]);

  // Run the task
  const runTask = useCallback(async () => {
    if (!selectedTask || !priorityArtists || priorityArtists.length === 0) {
      setError("Missing task or artist selection");
      setIsRunning(false);
      return;
    }

    const userEmail = email || "";
    if (!userEmail) {
      setError("Unable to get user email");
      setIsRunning(false);
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Unable to authenticate. Please try again.");
        setIsRunning(false);
        return;
      }

      // Convert selectedTask (AgentTemplate) to AgentTemplateRow for the API
      const templateRow: AgentTemplateRow = {
        id: selectedTask.id,
        title: selectedTask.title,
        description: selectedTask.description || "",
        prompt: selectedTask.prompt,
        tags: selectedTask.tags,
        creator: null,
        is_private: false,
        created_at: null,
        favorites_count: null,
        updated_at: null,
      };

      const result = await runOnboardingTask({
        template: templateRow,
        artistName,
        artistId: priorityArtists[0],
        userEmail,
        accessToken,
      });

      if (result.success) {
        setTaskResult(result.result);
        setTaskError(null);
        onNext();
      } else {
        setError(result.error || "Task failed. Please try again.");
        setTaskError(result.error || "Task failed");
        setIsRunning(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setTaskError(errorMessage);
      setIsRunning(false);
    }
  }, [selectedTask, priorityArtists, email, getAccessToken, artistName, setTaskResult, setTaskError, onNext]);

  // Start the task on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Fetch artist name first, then run task
    const init = async () => {
      await fetchArtistName();
      runTask();
    };

    init();

    // Set up timeout warning
    timeoutRef.current = setTimeout(() => {
      setShowTimeout(true);
    }, TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchArtistName, runTask]);

  const handleRetry = () => {
    setError(null);
    setIsRunning(true);
    setCurrentProgressStep(0);
    setShowTimeout(false);
    hasStartedRef.current = false;

    // Trigger re-run
    const init = async () => {
      await fetchArtistName();
      runTask();
    };
    init();

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTimeout(true);
    }, TIMEOUT_MS);
  };

  const handleSkip = () => {
    setTaskResult(null);
    goToStep("recurring");
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-2">{error}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSkip} className="px-8">
            Skip for now
          </Button>
          <Button
            onClick={handleRetry}
            className="px-8"
            style={{ backgroundColor: "#345A5D" }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Running state
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-6">Running your first task...</h1>

      {/* Animated spinner */}
      <div className="mb-8">
        <div className="h-16 w-16 mx-auto">
          <svg
            className="animate-spin h-16 w-16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "#345A5D" }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 mb-8 w-full max-w-xs">
        {PROGRESS_STEPS.map((step, index) => {
          const isActive = index === currentProgressStep;
          const isCompleted = index < currentProgressStep;

          return (
            <div
              key={step.label}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${isActive ? "bg-[#345A5D]/10" : ""}
              `}
            >
              <div
                className={`
                  h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${isCompleted ? "bg-[#345A5D] text-white" : isActive ? "bg-[#345A5D] text-white animate-pulse" : "bg-muted text-muted-foreground"}
                `}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  text-sm transition-all
                  ${isActive ? "font-medium text-foreground" : isCompleted ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {step.label}
                {isActive && "..."}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeout warning */}
      {showTimeout && (
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Taking longer than expected...
          </p>
          <Button variant="outline" onClick={handleSkip} className="px-8">
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
}
