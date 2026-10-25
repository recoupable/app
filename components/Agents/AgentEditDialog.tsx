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
import { useAgentTemplateMutation } from "./useAgentTemplateMutation";
import type { CreateAgentFormData } from "./schemas";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { useState, useEffect } from "react";

interface AgentEditDialogProps {
  agent: AgentTemplateRow;
}

const AgentEditDialog: React.FC<AgentEditDialogProps> = ({ agent }) => {
  const [open, setOpen] = useState(false);
  const editTemplate = useAgentTemplateMutation();
  const [currentSharedEmails, setCurrentSharedEmails] = useState<string[]>(
    agent.shared_emails || [],
  );

  const onSubmit = (values: CreateAgentFormData) => {
    const shareEmails = values.isPrivate
      ? Array.from(new Set([...currentSharedEmails, ...values.shareEmails]))
      : [];
    void editTemplate.mutate(
      {
        path: `/${encodeURIComponent(agent.id)}`,
        method: "PATCH",
        body: {
          title: values.title,
          description: values.description,
          prompt: values.prompt,
          tags: values.tags,
          is_private: values.isPrivate,
          share_emails: shareEmails,
        },
      },
      () => setOpen(false),
    );
  };

  const handleExistingEmailsChange = (emails: string[]) => {
    setCurrentSharedEmails(emails);
  };

  // Reset current shared emails when dialog opens or agent changes
  useEffect(() => {
    if (open) {
      setCurrentSharedEmails(agent.shared_emails || []);
    }
  }, [open, agent.shared_emails]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-xl"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-sans font-medium">
            Edit Agent
          </DialogTitle>
          <DialogDescription>
            Update the agent template details.
          </DialogDescription>
        </DialogHeader>
        <CreateAgentForm
          onSubmit={onSubmit}
          isSubmitting={editTemplate.isPending}
          initialValues={{
            title: agent.title,
            description: agent.description,
            prompt: agent.prompt,
            tags: agent.tags ?? [],
            isPrivate: agent.is_private,
            shareEmails: [],
          }}
          existingSharedEmails={currentSharedEmails}
          onExistingEmailsChange={handleExistingEmailsChange}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AgentEditDialog;
