/**
 * Icon Mapper
 *
 * Maps reasoning content to appropriate Lucide icons.
 * Single responsibility: Assign contextual icons to reasoning steps.
 */

import {
  BrainIcon,
  SearchIcon,
  LightbulbIcon,
  CheckCircleIcon,
  ListIcon,
  TargetIcon,
  DotIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Determine appropriate icon based on step content
 *
 * @param content
 */
export function mapContentToIcon(content: string): LucideIcon {
  const lowerContent = content.toLowerCase();

  // Map keywords to icons
  const iconMap = [
    { keywords: ["search", "find", "look"], icon: SearchIcon },
    { keywords: ["analyz", "consider", "think"], icon: BrainIcon },
    { keywords: ["solution", "idea", "approach"], icon: LightbulbIcon },
    { keywords: ["conclusion", "result", "final"], icon: CheckCircleIcon },
    { keywords: ["step", "list", "item"], icon: ListIcon },
    { keywords: ["goal", "target", "objective"], icon: TargetIcon },
  ];

  // Find first matching icon
  for (const { keywords, icon } of iconMap) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return icon;
    }
  }

  // Default to DotIcon (like Perplexity)
  return DotIcon;
}
