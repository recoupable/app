import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateAgentForm from "./CreateAgentForm";
import { useEffect, useState } from "react";
import { type CreateAgentFormData } from "./schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { useAgentForm } from "./useAgentForm";

interface CreateAgentDialogProps {
  children: React.ReactNode;
}

const CreateAgentDialog = ({ children }: CreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();
  const form = useAgentForm();

  const createTemplate = useMutation({
    mutationFn: async (values: CreateAgentFormData) => {
      const res = await fetch("/api/agent-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          userId: userData?.id ?? null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
      setOpen(false);
    },
  });

  const onSubmit = (values: CreateAgentFormData) => {
    createTemplate.mutate(values);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

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
          form={form}
          onSubmit={onSubmit}
          isSubmitting={createTemplate.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentDialog;
