"use client";

import { type NextPage } from "next";
import FansWrapper from "@/components/Fans/FansWrapper";

const FansPage: NextPage = () => {
  return (
    <div className="max-w-screen min-h-screen p-4">
      <div className="mb-4">
        <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">Fans</h1>
        <p className="text-lg text-muted-foreground text-left mb-4 font-light font-sans max-w-2xl">
          View your fan groups and get automated insights.
        </p>
      </div>
      <FansWrapper />
    </div>
  );
};

export default FansPage;
