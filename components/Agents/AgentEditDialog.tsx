import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import CreateAgentForm from "./CreateAgentForm";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { useState, useEffect } from "react";
import { type CreateAgentFormData } from "./schemas";
import { useAgentForm } from "@/hooks/useAgentForm";
import { useEditAgentTemplate } from "@/hooks/useEditAgentTemplate";

interface AgentEditDialogProps {
  agent: AgentTemplateRow;
}

const AgentEditDialog: React.FC<AgentEditDialogProps> = ({ agent }) => {
  const [open, setOpen] = useState(false);
  const [currentSharedEmails, setCurrentSharedEmails] = useState<string[]>(
    agent.shared_emails || []
  );
  const form = useAgentForm({
    title: agent.title,
    description: agent.description,
    prompt: agent.prompt,
    tags: agent.tags ?? [],
    isPrivate: agent.is_private,
    shareEmails: [],
  });
  const editTemplate = useEditAgentTemplate({
    agent,
    currentSharedEmails,
    onSuccess: () => setOpen(false),
  });

  const handleExistingEmailsChange = (emails: string[]) => {
    setCurrentSharedEmails(emails);
  };

  // Reset form state when the dialog opens for a specific agent, but do not
  // clobber in-progress edits on background refetches.
  useEffect(() => {
    if (open) {
      setCurrentSharedEmails(agent.shared_emails || []);
      form.reset({
        title: agent.title,
        description: agent.description,
        prompt: agent.prompt,
        tags: agent.tags ?? [],
        isPrivate: agent.is_private,
        shareEmails: [],
      });
    }
  }, [open, agent.id, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-xl" aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-sans font-medium">Edit Agent</DialogTitle>
          <DialogDescription>Update the agent template details.</DialogDescription>
        </DialogHeader>
        <CreateAgentForm
          form={form}
          onSubmit={(values: CreateAgentFormData) => editTemplate.mutate(values)}
          isSubmitting={editTemplate.isPending}
          existingSharedEmails={currentSharedEmails}
          onExistingEmailsChange={handleExistingEmailsChange}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AgentEditDialog;
