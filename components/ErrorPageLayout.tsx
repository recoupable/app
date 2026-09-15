import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface ErrorPageLayoutProps {
  title: string;
  description: string;
  actions?: ReactNode;
  eyebrow?: string;
  showLogo?: boolean;
  className?: string;
}

export default function ErrorPageLayout({
  title,
  description,
  actions,
  eyebrow = "RECOUP / WORKSPACE",
  showLogo = true,
  className,
}: ErrorPageLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-full w-full items-center justify-center bg-secondary/50 px-5 py-12 text-center sm:p-12",
        className,
      )}
    >
      <section className="flex w-full max-w-2xl flex-col items-center rounded-[32px] bg-background px-6 py-12 shadow-[0_0_0_1px_var(--border),0_16px_48px_-24px_rgba(0,0,0,0.12)] sm:px-12 sm:py-16">
        {showLogo && (
          <div className="mb-12">
            <Logo isExpanded />
          </div>
        )}
        <p className="mb-5 font-mono text-[11px] tracking-[0.12em] text-brand-link">
          {eyebrow}
        </p>
        <h1 className="mb-5 text-4xl font-[450] tracking-[-0.045em] text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
        {actions && (
          <div className="mt-8 flex w-full flex-col items-center">
            {actions}
          </div>
        )}
      </section>
    </div>
  );
}
