"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown when both roster and socials steps are complete. */
const RosterVerifiedPanel = () => (
  <section className="flex flex-col items-center gap-4 text-center py-12">
    <CheckCircle2 className="size-10 text-[#22c55e]" />
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Roster verified
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Your artists and their socials are confirmed. Reports, research, and
        tasks will use them from here on.
      </p>
    </div>
    <Link href="/" className={cn(buttonVariants(), "min-w-[200px]")}>
      Back to Recoup
    </Link>
  </section>
);

export default RosterVerifiedPanel;
