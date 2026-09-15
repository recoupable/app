"use client";

import "./globals.css";
import localFont from "next/font/local";
import ErrorPageLayout from "@/components/ErrorPageLayout";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const dmSans = localFont({
  src: "./fonts/DMSans-Latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-dm-sans",
});

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Critical application error:", error);
  }, [error]);

  const actions = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={() => window.location.reload()}
          className="h-12 rounded-full bg-brand-lime px-6 text-brand-on-lime shadow-none hover:bg-brand-lime-hover"
        >
          Reload page
        </Button>
        <Button
          variant="outline"
          onClick={reset}
          className="h-12 rounded-full px-6"
        >
          Try again
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Still having trouble?{" "}
        <a
          href="mailto:support@recoupable.dev"
          className="text-brand-link underline"
        >
          Get help from our team
        </a>
      </p>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left max-w-full">
          <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
            Error details (development only)
          </summary>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-w-full whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </>
  );

  // Global errors require full HTML structure since the entire app layout may be broken
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans bg-background text-foreground`}
      >
        <ErrorPageLayout
          className="min-h-dvh"
          eyebrow="RECOUP / CONNECTION INTERRUPTED"
          title="Let’s get you back."
          description="Recoup ran into an issue. Reload the page, or try opening your workspace again."
          actions={actions}
        />
      </body>
    </html>
  );
}
