import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Knowledge } from "@/types/knowledge";

const KnowledgeBaseSection = ({ knowledges }: { knowledges: Knowledge[] }) => {
  return (
    <div>
      <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Knowledge Base ({knowledges.length})
      </h3>
      <div className="space-y-2">
        {knowledges.map((knowledge, index) => (
          <Link
            href={knowledge.url}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer">
              <div className="w-8 h-8 bg-card rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {knowledge.name}
                </div>
                <div className="text-xs text-muted-foreground">{knowledge.type}</div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBaseSection;
