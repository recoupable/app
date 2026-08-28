import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreateAgentFormData } from "./schemas";
import EmailShareInput from "./EmailShareInput";

interface PrivacySectionProps {
  form: UseFormReturn<CreateAgentFormData>;
  existingSharedEmails?: string[];
  onExistingEmailsChange?: (emails: string[]) => void;
}

const PrivacySection = ({
  form,
  existingSharedEmails = [],
  onExistingEmailsChange,
}: PrivacySectionProps) => {
  const isPrivate = form.watch("isPrivate");

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="isPrivate"
          checked={isPrivate}
          onCheckedChange={(checked) => form.setValue("isPrivate", checked)}
        />
        <Label htmlFor="isPrivate">Private</Label>
      </div>

      {isPrivate && (
        <EmailShareInput
          emails={form.watch("shareEmails") ?? []}
          existingSharedEmails={existingSharedEmails}
          onEmailsChange={(emails) => {
            form.setValue("shareEmails", emails, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          onExistingEmailsChange={onExistingEmailsChange}
        />
      )}
    </>
  );
};

export default PrivacySection;
