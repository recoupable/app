"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createTask } from "@/lib/tasks/createTask";
import type { Task } from "@/lib/tasks/getTasks";
import { buildFirstTaskParams } from "@/lib/onboarding/buildFirstTaskParams";
import {
  getFirstTaskConfirmPhase,
  type FirstTaskConfirmPhase,
  type FirstTaskDecision,
} from "@/lib/onboarding/getFirstTaskConfirmPhase";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { DEFAULT_MODEL } from "@/lib/consts";

interface UseConfirmFirstTaskInput {
  catalogName?: string;
}

/**
 * Confirm/decline for the onboarding first task (chat#1867). Confirm
 * schedules the weekly report through the existing `POST /api/tasks`
 * path (which also mints the schedule — same as useCreateStarterTask);
 * decline creates nothing. Auth + artist come from providers.
 */
export function useConfirmFirstTask({ catalogName }: UseConfirmFirstTaskInput) {
  const { getAccessToken, user } = usePrivy();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<FirstTaskDecision>("pending");

  const {
    mutate,
    isPending,
    data: task,
  } = useMutation<Task>({
    mutationFn: async () => {
      const artistAccountId = selectedArtist?.account_id;
      const artistName = selectedArtist?.name;
      if (!artistAccountId || !artistName) {
        throw new Error("ARTIST_REQUIRED");
      }
      const recipientEmail = user?.email?.address;
      if (!recipientEmail) {
        throw new Error("EMAIL_REQUIRED");
      }
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("AUTH_REQUIRED");
      }
      return createTask(accessToken, {
        ...buildFirstTaskParams({
          artistName,
          artistAccountId,
          recipientEmail,
          catalogName,
        }),
        model: DEFAULT_MODEL,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
    },
    onError: (error) => {
      // A missing email is permanent for wallet/social-only logins — tell the
      // user to link one instead of "try again", which can't succeed.
      const message =
        error instanceof Error && error.message === "EMAIL_REQUIRED"
          ? "Add an email address to your account to receive your weekly report."
          : "Couldn't schedule the weekly report. Please try again.";
      toast.error(message);
    },
  });

  const confirm = () => {
    setDecision("confirmed");
    mutate();
  };
  const decline = () => setDecision("declined");

  const phase: FirstTaskConfirmPhase = getFirstTaskConfirmPhase({
    decision,
    isCreating: isPending,
    hasTask: Boolean(task),
  });

  return { confirm, decline, phase, task };
}
