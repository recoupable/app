/**
 * Enhanced Reasoning Component
 * 
 * Combines AI Elements Chain of Thought with our advanced backup features:
 * - Modern, clean UI from AI Elements
 * - Streaming shimmer animations from backup
 * - Smart title extraction from backup
 * - Auto-collapse behavior from backup
 * - Advanced content processing from backup
 */

'use client';

import { memo } from 'react';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';
import { parseReasoningSteps } from '@/lib/reasoning/parseReasoningSteps';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { extractReasoningTitle } from '@/lib/reasoning/extractReasoningTitle';
import { useDurationTracking } from '@/hooks/useDurationTracking';
import { useAutoCollapse } from '@/hooks/useAutoCollapse';
import StepContent from './StepContent';
import { cn } from '@/lib/utils';

export interface EnhancedReasoningProps {
  content?: string;
  isStreaming?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /**
   * Header shown while streaming with no content yet. Defaults to the
   * reasoning placeholder; the pre-send workspace wait reuses this exact
   * shell with its own text so the two read as one continuous state
   * (recoupable/app#2052).
   */
  placeholder?: string;
}

export const EnhancedReasoning = memo(({
  content,
  isStreaming = false,
  defaultOpen = true,
  onOpenChange,
  className,
  placeholder = 'Thinking...',
}: EnhancedReasoningProps) => {
  // Extract title and track duration
  const title = extractReasoningTitle(content);
  const { duration } = useDurationTracking(isStreaming);
  
  // Handle auto-collapse behavior (separated concern)
  const { isOpen, setIsOpen } = useAutoCollapse({
    isStreaming,
    defaultOpen,
    hasContent: !!content,
  });
  
  // Sync with parent component's onOpenChange callback
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };
  
  // Parse content into structured steps for better visualization
  const steps = parseReasoningSteps(content || '', isStreaming);
  
  // Handle case where we have no content yet (initial streaming state)
  if (!content && isStreaming) {
    return (
      <ChainOfThought 
        defaultOpen={defaultOpen} 
        open={isOpen}
        onOpenChange={handleOpenChange}
        className={cn('not-prose mb-4', className)}
      >
      <ChainOfThoughtHeader>
        <Shimmer as="span" duration={1.2}>
          {placeholder}
        </Shimmer>
      </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {/* Empty content while thinking */}
        </ChainOfThoughtContent>
      </ChainOfThought>
    );
  }
  
  // Handle case where we have no content at all
  if (!content || content.trim().length === 0) {
    return null;
  }
  
  return (
    <ChainOfThought 
      defaultOpen={defaultOpen}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn('not-prose mb-4', className)}
    >
      <ChainOfThoughtHeader>
        {isStreaming ? (
          <Shimmer as="span" duration={1.2}>
            {title}
          </Shimmer>
        ) : (
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {duration > 0 && (
              <span className="text-xs text-muted-foreground/50">
                ({duration}s)
              </span>
            )}
          </div>
        )}
      </ChainOfThoughtHeader>
      
      <ChainOfThoughtContent>
        {steps.map((step, index) => (
          <ChainOfThoughtStep
            key={`step-${index}`}
            icon={step.icon}
            label={step.label}
            status={step.status}
          >
            {step.content && step.content.trim() && step.content !== step.label && (
              <div className="mt-2">
                <StepContent content={step.content} />
              </div>
            )}
          </ChainOfThoughtStep>
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
});

EnhancedReasoning.displayName = 'EnhancedReasoning';
