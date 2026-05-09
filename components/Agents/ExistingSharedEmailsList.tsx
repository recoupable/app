import { Badge } from "@/components/ui/badge";
import { X, Users } from "lucide-react";

interface ExistingSharedEmailsListProps {
  emails: string[];
  onRemoveEmail?: (email: string) => void;
}

const ExistingSharedEmailsList = ({
  emails,
  onRemoveEmail,
}: ExistingSharedEmailsListProps) => {
  if (emails.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Users className="h-4 w-4" />
        <span>Already shared with:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {emails.map((email) => (
          <Badge
            key={`existing-${email}`}
            variant="outline"
            className="flex items-center gap-1 pr-1 bg-green-50 border-green-200 text-green-800"
          >
            {email}
            <span className="text-xs opacity-70 mr-1">(shared)</span>
            {onRemoveEmail && (
              <button
                type="button"
                onClick={() => onRemoveEmail(email)}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 opacity-70 hover:opacity-100"
                aria-label={`Remove ${email} from shared list`}
                title="Remove from shared list"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ExistingSharedEmailsList;
