"use client";

import { type NextPage } from "next";
import SegmentsWrapper from "@/components/Segments/SegmentsWrapper";

const SegmentsPage: NextPage = () => {
  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
        Fans
      </h1>
      <p className="text-lg text-muted-foreground text-left mb-4 font-light font-sans max-w-2xl">
        <span className="sm:hidden">View fan groups and insights.</span>
        <span className="hidden sm:inline">View your fan groups and get automated insights.</span>
      </p>
      <SegmentsWrapper />
    </div>
  );
};

export default SegmentsPage;
