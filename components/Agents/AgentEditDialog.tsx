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
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { useState, useEffect } from "react";

interface AgentEditDialogProps {
  agent: AgentTemplateRow;
}

const AgentEditDialog: React.FC<AgentEditDialogProps> = ({ agent }) => {
  const [open, setOpen] = useState(false);
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [currentSharedEmails, setCurrentSharedEmails] = useState<string[]>(
    agent.shared_emails || [],
  );

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
      const finalShareEmails =
        values.shareEmails && values.shareEmails.length > 0
          ? [...currentSharedEmails, ...values.shareEmails]
          : currentSharedEmails;

      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(
        `${getClientApiBaseUrl()}/api/agents/templates/${agent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            prompt: values.prompt,
            tags: values.tags,
            is_private: values.isPrivate,
            share_emails: finalShareEmails,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as
        | { status: "success"; template: unknown }
        | { status: "error"; error: string }
        | null;
      if (!res.ok || data?.status !== "success") {
        throw new Error(
          (data?.status === "error" && data.error) ||
            "Failed to update template",
        );
      }
      return data;
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
