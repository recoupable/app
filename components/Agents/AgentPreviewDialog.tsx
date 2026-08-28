import type React from "react";
import { Info, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

type Agent = AgentTemplateRow;

interface AgentPreviewDialogProps {
  agent: Agent;
}

const AgentPreviewDialog: React.FC<AgentPreviewDialogProps> = ({ agent }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 bg-transparent rounded-xl"
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">Preview</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[640px] rounded-xl">
      <DialogHeader>
        <DialogTitle className="text-base md:text-lg flex items-center gap-2">
          {agent.title}
          {agent.is_private ? (
            <Lock className="h-4 w-4 text-amber-500" aria-label="Private" />
          ) : (
            <Globe className="h-4 w-4 text-emerald-500" aria-label="Public" />
          )}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {agent.description}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Prompt
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm bg-muted/50 p-3 rounded-md max-h-56 overflow-auto">
            {agent.prompt}
          </pre>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Tags
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(agent.tags || []).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Updated
            </div>
            <div className="mt-1">
              {agent.updated_at
                ? format(new Date(agent.updated_at), "PPpp")
                : "—"}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-3">
              Creator
            </div>
            <div className="mt-1">{agent.creator?.name ?? "Recoup"}</div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default AgentPreviewDialog;
