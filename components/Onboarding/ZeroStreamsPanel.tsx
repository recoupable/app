import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * `/setup/valuation` for a catalog that measured with zero plays (chat#1969):
 * a terminal, honest answer instead of a $0 band or an eternal "measuring"
 * spinner. The valuation email is not sent for this case either, so this panel
 * is the signup's only explanation of what happened.
 */
const ZeroStreamsPanel = ({ measuredTrackCount }: { measuredTrackCount?: number }) => (
  <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-8 text-center">
    <h1 className="font-heading text-2xl font-semibold text-foreground">
      No streams found yet
    </h1>
    <p className="text-sm text-muted-foreground">
      We measured {measuredTrackCount ? `${measuredTrackCount} tracks in ` : ""}your catalog
      and found no Spotify plays yet. Your baseline valuation will appear as plays start
      logging; connecting your artist profiles helps future measurements pick them up.
    </p>
    <Link href="/setup/socials" className={cn(buttonVariants(), "min-w-[200px]")}>
      Connect your profiles
    </Link>
  </section>
);

export default ZeroStreamsPanel;
