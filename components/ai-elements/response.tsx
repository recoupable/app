"use client";

import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

const defaultPlugins = { code, math, mermaid };

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      plugins={defaultPlugins}
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "font-sans leading-relaxed",
        "dark:text-white [&_p]:dark:text-white [&_span]:dark:text-white [&_div]:dark:text-white",
        "[&_h1]:dark:text-white [&_h2]:dark:text-white [&_h3]:dark:text-white [&_h4]:dark:text-white",
        "[&_li]:dark:text-white [&_a]:dark:text-blue-400",
        "[&_p]:leading-relaxed [&_p]:text-base",
        // Code block improvements
        "[&_code]:whitespace-pre-wrap [&_code]:break-words",
        "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
        "[&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:relative",
        "[&_pre_button]:absolute [&_pre_button]:top-2 [&_pre_button]:right-2",
        "[&_div[data-streamdown='code-block']]:bg-white dark:[&_div[data-streamdown='code-block']]:bg-black",
        "[&_div[data-streamdown='code-block']]:border-black/10 dark:[&_div[data-streamdown='code-block']]:border-white/40",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
