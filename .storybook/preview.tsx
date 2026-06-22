import React, { useEffect } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../app/globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

/** Applies the app's real `.dark` class toggle to <html> based on the toolbar. */
function ThemeWrapper({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);
  return <>{children}</>;
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
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper theme={context.globals.theme}>
          <div className="bg-background p-6 text-foreground">
            <Story />
          </div>
        </ThemeWrapper>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
