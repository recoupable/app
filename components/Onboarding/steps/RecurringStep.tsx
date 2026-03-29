"use client";

import { useState, useEffect, useCallback } from "react";
import { useOnboarding, RecurringFrequency } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { TASKS_API_URL, NEW_API_BASE_URL } from "@/lib/consts";
import { interpolatePrompt } from "@/lib/onboarding";
import { ArtistRecord } from "@/types/Artist";

interface RecurringStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface FrequencyOption {
  value: RecurringFrequency;
  label: string;
  description: string;
  cron: string | null;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: "weekly",
    label: "Every week",
    description: "Get a report every Monday",
    cron: "0 9 * * 1", // Every Monday at 9 AM
  },
  {
    value: "biweekly",
    label: "Every 2 weeks",
    description: "Get a report every other Monday",
    cron: "0 9 1-7,15-21 * 1", // Approximate biweekly on Mondays
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Get a report on the 1st of each month",
    cron: "0 9 1 * *", // 1st of every month at 9 AM
  },
  {
    value: null,
    label: "No thanks",
    description: "I'll set this up later",
    cron: null,
  },
];

export default function RecurringStep({ onNext, onBack }: RecurringStepProps) {
  const { setRecurring, recurring: savedRecurring, selectedTask, priorityArtists } =
    useOnboarding();
  const { userData, email } = useUserProvider();
  const { getAccessToken } = usePrivy();

  const [selectedFrequency, setSelectedFrequency] = useState<RecurringFrequency>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistName, setArtistName] = useState<string>("Artist");

  // Pre-fill from saved state on mount
  useEffect(() => {
    if (savedRecurring !== undefined) {
      setSelectedFrequency(savedRecurring);
    }
  }, [savedRecurring]);

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

  useEffect(() => {
    fetchArtistName();
  }, [fetchArtistName]);

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // If recurring is selected and we have all required data, create the task
      if (
        selectedFrequency &&
        selectedTask &&
        priorityArtists &&
        priorityArtists.length > 0 &&
        userData?.account_id
      ) {
        const userEmail = email || "";
        const frequencyOption = FREQUENCY_OPTIONS.find(
          (opt) => opt.value === selectedFrequency
        );

        if (frequencyOption?.cron && userEmail) {
          const accessToken = await getAccessToken();

          if (accessToken) {
            // Interpolate the prompt with artist name and user email
            const interpolatedPrompt = interpolatePrompt(
              selectedTask.prompt,
              artistName,
              userEmail
            );

            // Create the recurring task via the tasks API
            const taskPayload = {
              title: selectedTask.title,
              prompt: interpolatedPrompt,
              schedule: frequencyOption.cron,
              artist_account_id: priorityArtists[0],
            };

            await fetch(TASKS_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(taskPayload),
            });
          }
        }
      }

      // Update the onboarding state with the selected frequency
      setRecurring(selectedFrequency);
      onNext();
    } catch {
      // Even if task creation fails, proceed with onboarding
      setRecurring(selectedFrequency);
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">
        Want me to do this automatically?
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Set up recurring automation to keep receiving insights.
      </p>

      <div className="space-y-3 w-full max-w-md mb-8">
        {FREQUENCY_OPTIONS.map((option) => {
          const isSelected = selectedFrequency === option.value;
          return (
            <button
              key={option.value ?? "none"}
              type="button"
              onClick={() => setSelectedFrequency(option.value)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-[#345A5D] bg-[#345A5D]/10"
                    : "border-input hover:border-[#345A5D]/50"
                }
              `}
              style={{
                borderColor: isSelected ? "#345A5D" : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? "border-[#345A5D]" : "border-muted-foreground"}
                  `}
                  style={{
                    borderColor: isSelected ? "#345A5D" : undefined,
                  }}
                >
                  {isSelected && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: "#345A5D" }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {option.value === null ? "No thanks" : option.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.value === null
                      ? "I'll set this up later"
                      : option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="px-8"
          style={{ backgroundColor: "#345A5D" }}
        >
          {isSubmitting ? "Setting up..." : "Finish"}
        </Button>
      </div>
    </div>
  );
}
