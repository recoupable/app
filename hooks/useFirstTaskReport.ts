"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useChatTransport } from "@/hooks/useChatTransport";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { generateUUID } from "@/lib/generateUUID";
import { DEFAULT_MODEL } from "@/lib/consts";
import { getReportTextFromMessages } from "@/lib/onboarding/getReportTextFromMessages";
import {
  getFirstTaskRunPhase,
  type FirstTaskRunPhase,
} from "@/lib/onboarding/getFirstTaskRunPhase";

interface UseFirstTaskReportInput {
  /** Api-minted ids from the provisioned session — callers mount only once these exist. */
  sessionId: string;
  chatId: string;
  prompt: string;
}

interface UseFirstTaskReportResult {
  reportText: string;
  phase: FirstTaskRunPhase;
}

/**
 * Pre-runs the onboarding first task (chat#1867) through the normal
 * chat pipeline — the same `POST /api/chat` transport a scheduled run's
 * prompt flows through — and exposes the streamed report. Auto-fires
 * the prompt exactly once per mount; artist context comes from the
 * provider (composed-hook pattern, chat#1847).
 */
export function useFirstTaskReport({
  sessionId,
  chatId,
  prompt,
}: UseFirstTaskReportInput): UseFirstTaskReportResult {
  const { transport, getHeaders } = useChatTransport({ chatId, sessionId });
  const { selectedArtist } = useArtistProvider();
  const artistId = selectedArtist?.account_id;

  const { messages, status, sendMessage } = useChat({
    id: chatId,
    transport,
    experimental_throttle: 100,
    generateId: generateUUID,
  });

  const didSendRef = useRef(false);
  useEffect(() => {
    if (didSendRef.current || !artistId) return;
    didSendRef.current = true;
    const fire = async () => {
      const headers = await getHeaders();
      sendMessage(
        {
          id: generateUUID(),
          role: "user",
          parts: [{ type: "text", text: prompt }],
        },
        { body: { roomId: chatId, artistId, model: DEFAULT_MODEL }, headers },
      );
    };
    void fire();
  }, [artistId, chatId, prompt, getHeaders, sendMessage]);

  const reportText = getReportTextFromMessages(messages);
  return {
    reportText,
    phase: getFirstTaskRunPhase({ status, hasReport: reportText.length > 0 }),
  };
}
