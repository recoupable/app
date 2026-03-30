import { SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewChatButtonProps {
  isExpanded: boolean;
  email: string | undefined;
  onClick: () => void;
}

const NewChatButton = ({ isExpanded, email, onClick }: NewChatButtonProps) => (
  <div className="flex flex-col gap-1 w-full mt-4">
    <button
      type="button"
      className={cn(
        "inline-flex items-center h-10 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200 text-sm font-normal text-foreground hover:bg-muted",
        isExpanded ? "w-full justify-start gap-2 px-3" : "w-10 justify-center mx-auto gap-0"
      )}
      onClick={onClick}
      aria-label={email ? "New Chat" : "Sign In"}
    >
      <div className="w-[21px] flex justify-center items-center shrink-0">
        <SquarePen className="size-[18px]" />
      </div>
      <span className={cn(
        "overflow-hidden transition-all duration-200",
        isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"
      )}>
        {email ? "New Chat" : "Sign In"}
      </span>
    </button>
  </div>
);

export default NewChatButton;
