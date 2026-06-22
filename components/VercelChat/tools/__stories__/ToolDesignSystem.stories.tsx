import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sparkles, Music } from "lucide-react";
import {
  ToolCard,
  ToolCardBody,
  ToolCardRow,
  ToolError,
  ToolEmpty,
  ToolStatusPill,
  ToolCardSkeleton,
} from "../shared";

/**
 * The shared design-system primitives every chat tool response is built on.
 */
const meta: Meta = {
  title: "Chat Tools/Design System",
};
export default meta;

type Story = StoryObj;

export const StatusPill: Story = {
  render: () => <ToolStatusPill label="Searching the web" />,
};

export const Skeleton: Story = {
  render: () => <ToolCardSkeleton icon={Sparkles} label="Loading results" rows={3} />,
};

export const Error: Story = {
  render: () => (
    <ToolError
      title="search_web"
      message="The upstream provider timed out after 30s."
      onRetry={() => {}}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <ToolCard icon={Sparkles} tone="info" title="Web search" subtitle="0 results">
      <ToolCardBody>
        <ToolEmpty
          icon={Sparkles}
          title="No results found"
          description="Try a broader query or different keywords."
        />
      </ToolCardBody>
    </ToolCard>
  ),
};

export const CardTones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["neutral", "success", "error", "info", "accent", "warning"] as const).map(
        (tone) => (
          <ToolCard
            key={tone}
            icon={Music}
            tone={tone}
            title={`Tone: ${tone}`}
            subtitle="Tinted icon chip + optional ring"
            emphasized
          >
            <ToolCardBody>
              <ToolCardRow>
                <span className="text-sm text-foreground">A list row</span>
              </ToolCardRow>
            </ToolCardBody>
          </ToolCard>
        ),
      )}
    </div>
  ),
};
