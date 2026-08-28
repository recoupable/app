import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createAgentSchema, type CreateAgentFormData } from "./schemas";
import FormFields from "./FormFields";
import TagSelector from "./TagSelector";
import PrivacySection from "./PrivacySection";
import SubmitButton from "./SubmitButton";

interface CreateAgentFormProps {
  onSubmit: (values: CreateAgentFormData) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateAgentFormData>;
  submitLabel?: string;
  existingSharedEmails?: string[];
  onExistingEmailsChange?: (emails: string[]) => void;
}

const CreateAgentForm = ({
  onSubmit,
  isSubmitting,
  initialValues,
  submitLabel,
  existingSharedEmails,
  onExistingEmailsChange,
}: CreateAgentFormProps) => {
  const form = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      prompt: initialValues?.prompt ?? "",
      tags: initialValues?.tags ?? [],
      isPrivate: initialValues?.isPrivate ?? false,
      shareEmails: initialValues?.shareEmails ?? [],
    },
  });

  const isPrivate = form.watch("isPrivate");

  // Ensure shareEmails is initialized when private is toggled
  useEffect(() => {
    if (!isPrivate) {
      form.setValue("shareEmails", []);
    } else if (!form.getValues("shareEmails")) {
      form.setValue("shareEmails", []);
    }
  }, [isPrivate, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFields form={form} />
      <TagSelector form={form} />
      <PrivacySection
        form={form}
        existingSharedEmails={existingSharedEmails}
        onExistingEmailsChange={onExistingEmailsChange}
      />
      <SubmitButton isSubmitting={isSubmitting} submitLabel={submitLabel} />
    </form>
  );
};

export default CreateAgentForm;
