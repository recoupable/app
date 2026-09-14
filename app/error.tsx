"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import ErrorPageLayout from "@/components/ErrorPageLayout";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Runtime error:", error);
  }, [error]);

  const actions = (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={reset}
          className="h-12 rounded-full bg-brand-lime px-6 text-brand-on-lime shadow-none hover:bg-brand-lime-hover"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          asChild
          className="h-12 rounded-full px-6"
        >
          <Link href="/">Back to workspace</Link>
        </Button>
      </div>

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

  return (
    <ErrorPageLayout
      eyebrow="WORKSPACE / SOMETHING WENT WRONG"
      title="Let’s try that again."
      description="We couldn’t load this view. Try again, or return to your workspace."
      actions={actions}
    />
  );
}
