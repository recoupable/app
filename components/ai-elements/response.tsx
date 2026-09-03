"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

// v1 bundled Shiki, KaTeX, Mermaid and CJK-friendly parsing; v2 ships them as
// plugins. Without them code blocks lose highlighting, math and diagrams
// render as text, and CJK emphasis parses wrong.
const plugins = { code, math, mermaid, cjk };
// v1 rendered links as plain anchors opening a new tab. v2 defaults to a
// button plus a confirmation modal per click; keep the v1 behaviour.
const linkSafety = { enabled: false };

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "font-sans leading-relaxed",
        // Code spans are excluded: Shiki colours tokens through a class since
        // streamdown 2, and a blanket white override paints them all white.
        "dark:text-white [&_p]:dark:text-white [&_span:not(pre_*)]:dark:text-white [&_div]:dark:text-white",
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
        className,
      )}
      plugins={plugins}
      linkSafety={linkSafety}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
