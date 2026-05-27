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
import { useCreateAgentTemplate } from "./useCreateAgentTemplate";

interface CreateAgentDialogProps {
  children: React.ReactNode;
}

const CreateAgentDialog = ({ children }: CreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const createTemplate = useCreateAgentTemplate();

  const onSubmit = (values: CreateAgentFormData) => {
    createTemplate.mutate(
      {
        title: values.title,
        description: values.description,
        prompt: values.prompt,
        tags: values.tags,
        is_private: values.isPrivate,
        share_emails: values.shareEmails,
      },
      { onSuccess: () => setOpen(false) },
    );
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
