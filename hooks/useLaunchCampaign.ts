"use client";

import { useState, useRef, useCallback } from "react";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useAccessToken } from "./useAccessToken";

export type SectionKey =
  | "press_release"
  | "spotify_pitch"
  | "instagram_captions"
  | "tiktok_hooks"
  | "fan_newsletter"
  | "curator_email";

export type SectionStatus = "pending" | "generating" | "complete";

export interface Section {
  key: SectionKey;
  label: string;
  emoji: string;
  status: SectionStatus;
  content: string;
}

export interface LaunchFormData {
  artist_name: string;
  song_name: string;
  genre: string;
  release_date: string;
  description?: string;
}

const SECTION_ORDER: Array<Pick<Section, "key" | "label" | "emoji">> = [
  { key: "press_release", label: "Press Release", emoji: "📰" },
  { key: "spotify_pitch", label: "Spotify Pitch", emoji: "🎵" },
  { key: "instagram_captions", label: "Instagram Captions", emoji: "📱" },
  { key: "tiktok_hooks", label: "TikTok Hooks", emoji: "🎬" },
  { key: "fan_newsletter", label: "Fan Newsletter", emoji: "📧" },
  { key: "curator_email", label: "Curator Email", emoji: "📨" },
];

function initSections(): Section[] {
  return SECTION_ORDER.map(s => ({
    ...s,
    status: "pending",
    content: "",
  }));
}

function parseSections(text: string): Record<SectionKey, string> {
  const result: Record<string, string> = {};
  for (const { key } of SECTION_ORDER) {
    const start = text.indexOf(`[SECTION:${key}]`);
    const end = text.indexOf(`[/SECTION:${key}]`);
    if (start !== -1) {
      const content = end !== -1
        ? text.slice(start + `[SECTION:${key}]`.length, end)
        : text.slice(start + `[SECTION:${key}]`.length);
      result[key] = content.trim();
    }
  }
  return result as Record<SectionKey, string>;
}

function getActiveSectionKey(text: string): SectionKey | null {
  for (const { key } of SECTION_ORDER) {
    const start = text.indexOf(`[SECTION:${key}]`);
    const end = text.indexOf(`[/SECTION:${key}]`);
    if (start !== -1 && end === -1) {
      return key;
    }
  }
  return null;
}

export function useLaunchCampaign() {
  const accessToken = useAccessToken();
  const [sections, setSections] = useState<Section[]>(initSections());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fullTextRef = useRef("");

  const generate = useCallback(async (formData: LaunchFormData) => {
    if (!accessToken) {
      setError("Not authenticated. Please sign in.");
      return;
    }

    // Reset state
    fullTextRef.current = "";
    setSections(initSections());
    setIsGenerating(true);
    setIsDone(false);
    setError(null);

    try {
      const response = await fetch(`${NEW_API_BASE_URL}/api/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to generate campaign: ${response.status} ${text}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullTextRef.current += chunk;

        const text = fullTextRef.current;
        const parsed = parseSections(text);
        const activeKey = getActiveSectionKey(text);

        setSections(prev =>
          prev.map(section => {
            const content = parsed[section.key] ?? "";
            const isCompleted = text.includes(`[/SECTION:${section.key}]`);
            const isActive = section.key === activeKey;

            return {
              ...section,
              content,
              status: isCompleted ? "complete" : isActive ? "generating" : section.status,
            };
          }),
        );
      }

      setIsDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [accessToken]);

  const reset = useCallback(() => {
    fullTextRef.current = "";
    setSections(initSections());
    setIsGenerating(false);
    setIsDone(false);
    setError(null);
  }, []);

  const completedCount = sections.filter(s => s.status === "complete").length;
  const progress = Math.round((completedCount / sections.length) * 100);

  return { sections, isGenerating, isDone, error, generate, reset, progress };
}
