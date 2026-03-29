"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, RecurringFrequency } from "@/hooks/useOnboarding";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { Button } from "@/components/ui/button";

interface CompleteStepProps {
  onNext: () => void;
  onBack: () => void;
}

const FREQUENCY_LABELS: Record<NonNullable<RecurringFrequency>, string> = {
  weekly: "week",
  biweekly: "2 weeks",
  monthly: "month",
};

export default function CompleteStep({ onNext, onBack }: CompleteStepProps) {
  void onNext;
  void onBack;

  const { recurring, selectedTask, priorityArtists, complete } =
    useOnboarding();
  const { userData } = useUserProvider();
  const { artists, setSelectedArtist } = useArtistProvider();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoToDashboard = async () => {
    if (!userData?.account_id) {
      router.push("/");
      return;
    }

    setIsSubmitting(true);
    try {
      await complete(userData.account_id);

      // Auto-select the first priority artist after onboarding
      if (priorityArtists.length > 0) {
        const firstPriorityArtistId = priorityArtists[0];
        const artistToSelect = artists.find(
          (a) => a.account_id === firstPriorityArtistId
        );
        if (artistToSelect) {
          setSelectedArtist(artistToSelect);
        }
      }

      router.push("/");
    } catch {
      router.push("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
      {/* Celebration icon */}
      <div className="mb-6">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "rgba(52, 90, 93, 0.1)" }}
        >
          <span className="text-4xl" role="img" aria-label="celebration">
            🎉
          </span>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-4">You&apos;re all set!</h1>

      {recurring ? (
        <p className="text-lg text-muted-foreground mb-8">
          Your <span className="font-medium">{selectedTask?.title}</span> is
          scheduled for every {FREQUENCY_LABELS[recurring]}.
        </p>
      ) : (
        <p className="text-lg text-muted-foreground mb-8">
          Your first report is on its way. Set up recurring tasks anytime from
          the Tasks page.
        </p>
      )}

      <Button
        onClick={handleGoToDashboard}
        disabled={isSubmitting}
        className="px-8 py-3 text-lg"
        style={{ backgroundColor: "#345A5D" }}
      >
        {isSubmitting ? "Finishing up..." : "Go to Dashboard"}
      </Button>
    </div>
  );
}
