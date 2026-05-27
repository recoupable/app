import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateAgentForm from "./CreateAgentForm";
import { useState } from "react";
import { type CreateAgentFormData } from "./schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface CreateAgentDialogProps {
  children: React.ReactNode;
}

const CreateAgentDialog = ({ children }: CreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: async (values: CreateAgentFormData) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(`${getClientApiBaseUrl()}/api/agents/templates`, {
        method: "POST",
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
          share_emails: values.shareEmails,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { status: "success"; template: unknown }
        | { status: "error"; error: string }
        | null;
      if (!res.ok || data?.status !== "success") {
        throw new Error(
          (data?.status === "error" && data.error) ||
            "Failed to create template",
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
      setOpen(false);
    },
  });

  const onSubmit = (values: CreateAgentFormData) => {
    createTemplate.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-sans font-medium">
            Create New Agent
          </DialogTitle>
          <DialogDescription>
            Create a new intelligent agent to help manage your roster tasks.
          </DialogDescription>
        </DialogHeader>
        <CreateAgentForm
          onSubmit={onSubmit}
          isSubmitting={createTemplate.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentDialog;
