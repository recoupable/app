import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErrorPageLayout from "@/components/ErrorPageLayout";

export default function NotFoundPage() {
  return (
    <ErrorPageLayout
      eyebrow="404 / PAGE NOT FOUND"
      title="This page isn’t here."
      description="The link may have changed. Head back to your workspace to keep going."
      actions={
        <Button
          asChild
          className="h-12 rounded-full bg-brand-lime px-6 text-brand-on-lime shadow-none hover:bg-brand-lime-hover"
        >
          <Link href="/">
            Back to workspace <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      }
    />
  );
}
