"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export type OnboardingStep =
  | "welcome"
  | "role"
  | "artists"
  | "task-picker"
  | "running"
  | "result"
  | "recurring"
  | "complete";

export type UserRole =
  | "manager"
  | "label"
  | "marketing"
  | "pr"
  | "artist"
  | "other"
  | null;

export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | null;

export interface AgentTemplate {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  tags: string[] | null;
}

export interface OnboardingState {
  step: OnboardingStep;
  name: string;
  role: UserRole;
  priorityArtists: string[];
  selectedTask: AgentTemplate | null;
  taskResult: string | null;
  taskError: string | null;
  recurring: RecurringFrequency;
}

const STORAGE_KEY = "recoup-onboarding";

const STEPS_ORDER: OnboardingStep[] = [
  "welcome",
  "role",
  "artists",
  "task-picker",
  "running",
  "result",
  "recurring",
  "complete",
];

const initialState: OnboardingState = {
  step: "welcome",
  name: "",
  role: null,
  priorityArtists: [],
  selectedTask: null,
  taskResult: null,
  taskError: null,
  recurring: null,
};

interface UseOnboardingReturn {
  state: OnboardingState;
  step: OnboardingStep;
  name: string;
  role: UserRole;
  priorityArtists: string[];
  selectedTask: AgentTemplate | null;
  taskResult: string | null;
  taskError: string | null;
  recurring: RecurringFrequency;
  setName: (name: string) => void;
  setRole: (role: UserRole) => void;
  setPriorityArtists: (artists: string[]) => void;
  setSelectedTask: (task: AgentTemplate | null) => void;
  setTaskResult: (result: string | null) => void;
  setTaskError: (error: string | null) => void;
  setRecurring: (frequency: RecurringFrequency) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  complete: (accountId: string) => Promise<boolean>;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

export function useOnboarding(): UseOnboardingReturn {
  const [savedState, setSavedState] = useLocalStorage<OnboardingState | null>(
    STORAGE_KEY,
    null
  );
  const [state, setState] = useState<OnboardingState>(
    savedState ?? initialState
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    if (savedState && !isHydrated) {
      setState(savedState);
    }
    setIsHydrated(true);
  }, [savedState, isHydrated]);

  // Persist to localStorage whenever state changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      setSavedState(state);
    }
  }, [state, isHydrated, setSavedState]);

  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const setName = useCallback(
    (name: string) => updateState({ name }),
    [updateState]
  );

  const setRole = useCallback(
    (role: UserRole) => updateState({ role }),
    [updateState]
  );

  const setPriorityArtists = useCallback(
    (priorityArtists: string[]) => updateState({ priorityArtists }),
    [updateState]
  );

  const setSelectedTask = useCallback(
    (selectedTask: AgentTemplate | null) => updateState({ selectedTask }),
    [updateState]
  );

  const setTaskResult = useCallback(
    (taskResult: string | null) => updateState({ taskResult }),
    [updateState]
  );

  const setTaskError = useCallback(
    (taskError: string | null) => updateState({ taskError }),
    [updateState]
  );

  const setRecurring = useCallback(
    (recurring: RecurringFrequency) => updateState({ recurring }),
    [updateState]
  );

  const currentStepIndex = STEPS_ORDER.indexOf(state.step);

  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS_ORDER.length) {
      updateState({ step: STEPS_ORDER[nextIndex] });
    }
  }, [currentStepIndex, updateState]);

  const prevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      updateState({ step: STEPS_ORDER[prevIndex] });
    }
  }, [currentStepIndex, updateState]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      updateState({ step });
    },
    [updateState]
  );

  const reset = useCallback(() => {
    setState(initialState);
    setSavedState(null);
  }, [setSavedState]);

  const complete = useCallback(
    async (accountId: string): Promise<boolean> => {
      try {
        const onboardingData = {
          name: state.name,
          role: state.role,
          priorityArtists: state.priorityArtists,
          selectedTask: state.selectedTask
            ? {
                id: state.selectedTask.id,
                title: state.selectedTask.title,
              }
            : null,
          recurring: state.recurring,
        };

        const onboardingStatus = {
          completed: true,
          completedAt: new Date().toISOString(),
        };

        const response = await fetch("/api/account/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId,
            onboarding_data: onboardingData,
            onboarding_status: onboardingStatus,
          }),
        });

        if (!response.ok) {
          return false;
        }

        // Clear localStorage on successful completion
        setSavedState(null);
        return true;
      } catch {
        return false;
      }
    },
    [state, setSavedState]
  );

  return {
    state,
    step: state.step,
    name: state.name,
    role: state.role,
    priorityArtists: state.priorityArtists,
    selectedTask: state.selectedTask,
    taskResult: state.taskResult,
    taskError: state.taskError,
    recurring: state.recurring,
    setName,
    setRole,
    setPriorityArtists,
    setSelectedTask,
    setTaskResult,
    setTaskError,
    setRecurring,
    nextStep,
    prevStep,
    goToStep,
    complete,
    reset,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === STEPS_ORDER.length - 1,
    currentStepIndex,
    totalSteps: STEPS_ORDER.length,
  };
}

export default useOnboarding;
