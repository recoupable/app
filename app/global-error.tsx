"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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
          className="px-6 py-2"
        >
          Reload page
        </Button>
        <Button
          variant="outline"
          onClick={reset}
          className="px-6 py-2"
        >
          Try again
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Still having trouble?{" "}
        <a
          href="mailto:support@recoupable.dev"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Get help from our team
        </a>
      </p>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left max-w-full">
          <summary className="cursor-pointer text-sm text-gray-600 mb-2">
            Error details (development only)
          </summary>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-w-full whitespace-pre-wrap">
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
      <body>
        <div className="flex items-center justify-center min-h-screen text-center px-4">
          <div className="w-full max-w-lg flex flex-col items-center">
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Recoup_Icon_Wordmark_Black.svg"
                alt="Recoup Logo"
                width={160}
                height={60}
                className="mx-auto"
              />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
              App needs a refresh
            </h1>
            
            <p className="text-gray-600 max-w-md mx-auto text-base md:text-lg mb-8">
              The app ran into an issue and needs to restart. Just reload the
              page and everything should work normally again.
            </p>
            
            {actions}
          </div>
        </div>
      </body>
    </html>
  );
}
