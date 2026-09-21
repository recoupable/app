"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

/** Public entry retains authentication providers without displaying private workspace chrome. */
export default function ContextPageLayout({
  children,
  workspace,
}: {
  children: ReactNode;
  workspace: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/context") return workspace;
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
