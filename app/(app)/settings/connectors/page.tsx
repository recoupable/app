"use client";

import { Suspense } from "react";
import { ConnectorsPage } from "@/components/ConnectorsPage";

export default function SettingsConnectorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ConnectorsPage />
    </Suspense>
  );
}
