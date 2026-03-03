"use client";

import { useAutoLogin } from "@/hooks/useAutoLogin";
import PulseHeader from "./PulseHeader";

const PulsePage = () => {
  useAutoLogin();

  return (
    <div className="relative min-h-full bg-background">
      <div className="mx-auto max-w-md px-6 py-8">
        <PulseHeader />
      </div>
    </div>
  );
};

export default PulsePage;
