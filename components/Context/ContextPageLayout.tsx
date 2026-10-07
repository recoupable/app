"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo/Logo";
import { ArrowLeft } from "lucide-react";

/** Public entry retains authentication providers without displaying private workspace chrome. */
export default function ContextPageLayout({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/context" && !pathname.startsWith("/oauth/"))
    return workspace;
  if (pathname.startsWith("/oauth/"))
    return (
      <div className="min-h-dvh bg-secondary/40 text-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Link
            href="/"
            aria-label="Recoup home"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo isExpanded />
          </Link>
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Recoup
          </Link>
        </header>
        <main>{children}</main>
      </div>
    );
  return (
    <div className="min-h-dvh bg-card text-foreground">
      <header className="px-6 py-5">
        <Link href="/" className="text-lg font-semibold">
          Recoup
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
