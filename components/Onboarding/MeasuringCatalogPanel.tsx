"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Terminal state for `/setup/valuation` while a catalog exists but has no
 * valuation yet.
 *
 * Seeding (chat#1889 row 8) creates the catalog seconds after the first artist
 * is added and its measurements land later, so this window is routine. Without
 * a state of its own the route could neither redirect (there IS a catalog) nor
 * render the hero, and sat on a skeleton with no exit.
 */
const MeasuringCatalogPanel = () => (
  <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-8 text-center">
    <h1 className="text-2xl font-semibold text-foreground">
      Measuring your catalog
    </h1>
    <p className="text-sm text-muted-foreground">
      We are pulling play counts for every track. This usually takes a minute.
      Your baseline value appears here as soon as it is ready.
    </p>
    <Link href="/setup/tasks" className={cn(buttonVariants(), "min-w-[200px]")}>
      Set up your weekly report
    </Link>
  </section>
);

export default MeasuringCatalogPanel;
