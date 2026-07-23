import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { CreateAgentFormData } from "./schemas";
import EmailShareInput from "./EmailShareInput";
import AgentVisibilityControl from "./AgentVisibilityControl";

interface PrivacySectionProps {
  form: UseFormReturn<CreateAgentFormData>;
  existingSharedEmails?: string[];
  onExistingEmailsChange?: (emails: string[]) => void;
}

const PrivacySection = ({ form, existingSharedEmails = [], onExistingEmailsChange }: PrivacySectionProps) => {
  const isPrivate = form.watch("isPrivate");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-sm font-medium text-foreground">
          Visibility
        </Label>
        <AgentVisibilityControl form={form} />
      </div>

      {isPrivate && (
        <EmailShareInput
            emails={form.watch("shareEmails") ?? []}
            existingSharedEmails={existingSharedEmails}
            onEmailsChange={(emails) => {
              form.setValue("shareEmails", emails, { shouldDirty: true, shouldValidate: true });
            }}
            onExistingEmailsChange={onExistingEmailsChange}
          />
      )}
    </div>
  );
};

export default PrivacySection;
