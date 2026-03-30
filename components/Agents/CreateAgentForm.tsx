import { UseFormReturn } from "react-hook-form";
import { type CreateAgentFormData } from "./schemas";
import FormFields from "./FormFields";
import TagSelector from "./TagSelector";
import PrivacySection from "./PrivacySection";
import SubmitButton from "./SubmitButton";

interface CreateAgentFormProps {
  form: UseFormReturn<CreateAgentFormData>;
  onSubmit: (values: CreateAgentFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  existingSharedEmails?: string[];
  onExistingEmailsChange?: (emails: string[]) => void;
}

const CreateAgentForm = ({
  form,
  onSubmit,
  isSubmitting,
  submitLabel,
  existingSharedEmails,
  onExistingEmailsChange,
}: CreateAgentFormProps) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFields form={form} />
      <TagSelector form={form} />
      <PrivacySection form={form} existingSharedEmails={existingSharedEmails} onExistingEmailsChange={onExistingEmailsChange} />
      <SubmitButton isSubmitting={isSubmitting} submitLabel={submitLabel} />
    </form>
  );
};

export default CreateAgentForm;
