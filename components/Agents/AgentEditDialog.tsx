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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { useState, useEffect } from "react";
import { useAgentForm } from "./useAgentForm";

interface AgentEditDialogProps {
  agent: AgentTemplateRow;
}

const AgentEditDialog: React.FC<AgentEditDialogProps> = ({ agent }) => {
  const [open, setOpen] = useState(false);
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();
  const [currentSharedEmails, setCurrentSharedEmails] = useState<string[]>(agent.shared_emails || []);
  const form = useAgentForm({
    title: agent.title,
    description: agent.description,
    prompt: agent.prompt,
    tags: agent.tags ?? [],
    isPrivate: agent.is_private,
    shareEmails: [],
  });

  const editTemplate = useMutation({
    mutationFn: async (values: {
      title?: string;
      description?: string;
      prompt?: string;
      tags?: string[];
      isPrivate?: boolean;
      shareEmails?: string[];
    }) => {
      // Combine existing emails (after removals) with new emails
      const finalShareEmails = values.shareEmails && values.shareEmails.length > 0
        ? [...currentSharedEmails, ...values.shareEmails]
        : currentSharedEmails;

      const res = await fetch("/api/agent-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agent.id,
          userId: userData?.id,
          title: values.title,
          description: values.description,
          prompt: values.prompt,
          tags: values.tags,
          isPrivate: values.isPrivate,
          shareEmails: finalShareEmails,
        }),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
      setOpen(false);
    },
  });

  const onSubmit = (values: {
    title: string;
    description: string;
    prompt: string;
    tags: string[];
    isPrivate: boolean;
    shareEmails?: string[];
  }) => {
    editTemplate.mutate(values);
  };

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
          onSubmit={onSubmit}
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
