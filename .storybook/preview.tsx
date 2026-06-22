import React, { useEffect, useState } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoryBoundary } from "../components/VercelChat/tools/__stories__/StoryBoundary";
import "../app/globals.css";

/**
 * Per-story wrapper: a fresh QueryClient (so cache never leaks between stories)
 * plus the app's real `.dark` class toggle driven by the toolbar.
 */
function StoryWrapper({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  // useState initializer runs once per story mount → isolated cache per story.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <StoryWrapper theme={context.globals.theme}>
        <div className="bg-background p-6 text-foreground">
          <StoryBoundary label={context.title || "Story"}>
            <Story />
          </StoryBoundary>
        </div>
      </StoryWrapper>
    ),
  ],
};

export default preview;
