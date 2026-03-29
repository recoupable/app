"use client";

import { useState, useEffect } from "react";
import { useOnboarding, AgentTemplate } from "@/hooks/useOnboarding";
import { filterTemplatesByRole } from "@/lib/onboarding/filterTemplatesByRole";
import { Button } from "@/components/ui/button";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

interface TaskPickerStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function TaskPickerStep({ onNext, onBack }: TaskPickerStepProps) {
  const { setSelectedTask, selectedTask: savedTask, role } = useOnboarding();

  const [templates, setTemplates] = useState<AgentTemplateRow[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AgentTemplateRow[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplateRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/onboarding-templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }

        const data: AgentTemplateRow[] = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  // Filter templates by role when templates or role changes
  useEffect(() => {
    if (templates.length > 0) {
      const filtered = filterTemplatesByRole(templates, role);
      setFilteredTemplates(filtered);
    }
  }, [templates, role]);

  // Pre-fill from saved state on mount
  useEffect(() => {
    if (savedTask && filteredTemplates.length > 0) {
      const matchingTemplate = filteredTemplates.find((t) => t.id === savedTask.id);
      if (matchingTemplate) {
        setSelectedTemplate(matchingTemplate);
      }
    }
  }, [savedTask, filteredTemplates]);

  const handleContinue = () => {
    if (selectedTemplate) {
      // Convert to AgentTemplate format for the onboarding state
      const task: AgentTemplate = {
        id: selectedTemplate.id,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        prompt: selectedTemplate.prompt,
        tags: selectedTemplate.tags,
      };
      setSelectedTask(task);
      onNext();
    }
  };

  const isDisabled = !selectedTemplate;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">
          What would be most valuable for you right now?
        </h1>
        <p className="text-muted-foreground mb-8">
          Loading available tasks...
        </p>
        <div className="w-full max-w-lg space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse p-6 rounded-xl border-2 border-input"
            >
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-destructive">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="px-8"
            style={{ backgroundColor: "#345A5D" }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">
          No tasks available
        </h1>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t find any tasks matching your role. Let&apos;s continue with the setup.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
          <Button
            onClick={onNext}
            className="px-8"
            style={{ backgroundColor: "#345A5D" }}
          >
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">
        What would be most valuable for you right now?
      </h1>
      <p className="text-muted-foreground mb-8">
        Pick a task and I&apos;ll run it for you right now.
      </p>

      <div className="w-full max-w-lg space-y-4 mb-8">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template)}
              className={`
                w-full p-6 rounded-xl border-2 text-left transition-all
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
              <div className="font-semibold text-lg">{template.title}</div>
              {template.description && (
                <div className="text-sm text-muted-foreground mt-2">
                  {template.description}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isDisabled}
          className="px-8"
          style={{
            backgroundColor: isDisabled ? undefined : "#345A5D",
          }}
        >
          Run it now
        </Button>
      </div>
    </div>
  );
}
