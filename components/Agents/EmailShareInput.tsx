import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/utils/isValidEmail";
import ExistingSharedEmailsList from "./ExistingSharedEmailsList";
import NewEmailsList from "./NewEmailsList";

interface EmailShareInputProps {
  emails: string[];
  existingSharedEmails?: string[];
  onEmailsChange: (emails: string[]) => void;
  onExistingEmailsChange?: (emails: string[]) => void;
}

const EmailShareInput = ({
  emails,
  existingSharedEmails = [],
  onEmailsChange,
  onExistingEmailsChange,
}: EmailShareInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const trimmedEmail = inputValue.trim().toLowerCase();

    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      // You could add error handling here
      return;
    }

    // Check if email already exists in either existing or new emails
    if (
      emails.includes(trimmedEmail) ||
      existingSharedEmails.includes(trimmedEmail)
    ) {
      setInputValue("");
      return;
    }

    onEmailsChange([...emails, trimmedEmail]);
    setInputValue("");
  };

  const removeNewEmail = (emailToRemove: string) => {
    onEmailsChange(emails.filter((email) => email !== emailToRemove));
  };

  const removeExistingEmail = (emailToRemove: string) => {
    if (onExistingEmailsChange) {
      onExistingEmailsChange(
        existingSharedEmails.filter((email) => email !== emailToRemove),
      );
    }
  };

  const hasAnyEmails = existingSharedEmails.length > 0 || emails.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="share-emails">Share with (email addresses)</Label>
      <Input
        id="share-emails"
        type="email"
        placeholder="Enter email address and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {hasAnyEmails && (
        <div className="space-y-3">
          <ExistingSharedEmailsList
            emails={existingSharedEmails}
            onRemoveEmail={removeExistingEmail}
          />
          <NewEmailsList emails={emails} onRemoveEmail={removeNewEmail} />
        </div>
      )}
    </div>
  );
};

export default EmailShareInput;
