"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useCopy } from "@/hooks/useCopy";

export default function AccessPage() {
  const { getAccessToken, ready, authenticated } = usePrivy();
  const { copied, copy } = useCopy();

  const {
    data: accessToken,
    isLoading: loading,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["accessToken"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }
      return token;
    },
    enabled: ready && authenticated,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to get access token");
      console.error(error);
    }
  }, [isError, error]);

  const handleCopy = async () => {
    if (!accessToken) return;
    await copy(accessToken);
  };

  if (!ready) {
    return (
      <main className="min-h-screen p-4 md:px-8 md:py-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen p-4 md:px-8 md:py-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">
            Please sign in to view your access token.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:px-8 md:py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Access Token</CardTitle>
          <CardDescription>
            Your Privy Bearer token for API authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-foreground"></div>
              <p className="mt-2 text-muted-foreground">
                Loading access token...
              </p>
            </div>
          ) : accessToken ? (
            <>
              <div className="rounded-lg border bg-muted p-4">
                <pre className="text-sm font-mono break-all whitespace-pre-wrap">
                  {accessToken}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Token
                    </>
                  )}
                </Button>
                <Button onClick={() => refetch()} variant="outline">
                  Refresh Token
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {isError
                  ? "Failed to load access token"
                  : "No access token available"}
              </p>
              <Button onClick={() => refetch()}>Get Access Token</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
