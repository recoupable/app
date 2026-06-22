import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Knowledge } from "@/types/knowledge";

const KnowledgeBaseSection = ({ knowledges }: { knowledges: Knowledge[] }) => {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <FileText className="size-3.5" />
        Knowledge base ({knowledges.length})
      </h3>
      <div className="space-y-1">
        {knowledges.map((knowledge, index) => (
          <Link
            href={knowledge.url}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {knowledge.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {knowledge.type}
              </div>
            </div>

            <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBaseSection;
