import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Playground from "@/components/IntelligentUI/Playground";
import { isPlaygroundEnabled } from "@/lib/intelligent-ui/playground/isPlaygroundEnabled";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Intelligent UI playground | Recoup",
  description:
    "Explore evidence-backed working surfaces with synthetic examples.",
  robots: { index: false, follow: false },
};

export default function IntelligentUIPlaygroundPage() {
  if (!isPlaygroundEnabled()) notFound();
  return <Playground />;
}
